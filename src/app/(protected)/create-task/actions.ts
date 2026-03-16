'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com'])
const RESERVED_PROFILE_SEGMENTS = new Set([
  'accounts',
  'explore',
  'p',
  'reel',
  'reels',
  'stories',
  'tv',
])

function getPathSegments(pathname: string) {
  return pathname.split('/').filter(Boolean)
}

function isValidInstagramUsername(value: string) {
  return /^[a-zA-Z0-9._]{1,30}$/.test(value)
}

async function checkInstagramUrlReachability(url: string, taskType: string) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
        'accept-language': 'en-US,en;q=0.9',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return taskType === 'like'
        ? 'This Instagram post or reel link could not be opened. Use a public, active post URL.'
        : 'This Instagram profile link could not be opened. Use a real public profile URL.'
    }

    const finalUrl = new URL(response.url)
    if (!INSTAGRAM_HOSTS.has(finalUrl.hostname.toLowerCase())) {
      return 'Instagram redirected this link somewhere unexpected. Please use the original Instagram URL.'
    }

    const html = (await response.text()).toLowerCase()
    const unavailableMarkers = [
      "sorry, this page isn't available",
      'the link you followed may be broken',
      'page not found',
    ]

    if (unavailableMarkers.some((marker) => html.includes(marker))) {
      return taskType === 'like'
        ? 'This Instagram post or reel does not appear to be publicly available.'
        : 'This Instagram profile does not appear to be publicly available.'
    }
  } catch {
    return null
  }

  return null
}

async function validateTaskTarget(taskType: string, parsedUrl: URL) {
  if (!INSTAGRAM_HOSTS.has(parsedUrl.hostname.toLowerCase())) {
    return 'Task link must be an Instagram URL.'
  }

  const segments = getPathSegments(parsedUrl.pathname)

  if (taskType === 'follow') {
    if (segments.length !== 1) {
      return 'Follow tasks must use a direct Instagram profile link like https://www.instagram.com/username/'
    }

    const username = segments[0]
    if (RESERVED_PROFILE_SEGMENTS.has(username.toLowerCase()) || !isValidInstagramUsername(username)) {
      return 'Follow tasks must use a real Instagram profile URL.'
    }
  }

  if (taskType === 'like') {
    const validContentPrefixes = new Set(['p', 'reel', 'reels', 'tv'])
    if (segments.length < 2 || !validContentPrefixes.has(segments[0].toLowerCase()) || !segments[1]) {
      return 'Like tasks must use a direct Instagram post or reel link.'
    }
  }

  return checkInstagramUrlReachability(parsedUrl.toString(), taskType)
}

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const taskType = String(formData.get('task_type') ?? '').trim()
  const instagramLink = String(formData.get('instagram_link') ?? '').trim()
  const pointsCost = 20
  const validTaskTypes = new Set(['follow', 'like'])

  if (!validTaskTypes.has(taskType)) {
    return { error: 'Please select a valid task type.' }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(instagramLink)
  } catch {
    return { error: 'Please enter a valid Instagram URL.' }
  }

  const targetValidationError = await validateTaskTarget(taskType, parsedUrl)
  if (targetValidationError) {
    return { error: targetValidationError }
  }

  let { data: userData } = await supabase
    .from('users')
    .select('email, points, banned')
    .eq('id', user.id)
    .single()

  if (!userData) {
    const { data: insertedUser, error: userInsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email ?? '',
        },
        { onConflict: 'id' }
      )
      .select('email, points, banned')
      .single()

    if (userInsertError) {
      return { error: 'Unable to prepare your account for task creation.' }
    }

    userData = insertedUser
  }

  if (userData?.banned) {
    return { error: 'Your account is restricted. Please contact support.' }
  }

  if (!userData || userData.points < pointsCost) {
    return { error: 'You need to earn at least 20 points before requesting followers or likes.' }
  }

  const { error: deductError } = await supabase
    .from('users')
    .update({ points: userData.points - pointsCost })
    .eq('id', user.id)

  if (deductError) {
    return { error: 'Failed to reserve points for this task.' }
  }

  const { error: taskError } = await supabase.from('tasks').insert({
    user_id: user.id,
    task_type: taskType,
    instagram_link: parsedUrl.toString(),
    points_cost: pointsCost,
    status: 'active',
  })

  if (taskError) {
    await supabase.from('users').update({ points: userData.points }).eq('id', user.id)
    return { error: `Failed to create task: ${taskError.message}` }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tasks-feed')
  revalidatePath('/create-task')

  return { success: true }
}
