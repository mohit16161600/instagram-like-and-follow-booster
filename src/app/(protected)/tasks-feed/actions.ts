'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const INSTAGRAM_HOSTS = new Set(['instagram.com', 'www.instagram.com'])

function normalizeInstagramUrl(value: string) {
  const parsed = new URL(value)
  if (!INSTAGRAM_HOSTS.has(parsed.hostname)) {
    throw new Error('Task link must be an Instagram URL.')
  }

  return {
    origin: `https://${parsed.hostname.toLowerCase()}`,
    pathname: parsed.pathname.replace(/\/+$/, '').toLowerCase(),
  }
}

function normalizeUsername(value: string) {
  return value.trim().replace(/^@+/, '').replace(/\/+$/, '').toLowerCase()
}

function getTaskReward(taskType: string) {
  return taskType === 'follow' ? 2 : 1
}

async function getCurrentQueueTaskId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
) {
  // Single round-trip to find the first task the user hasn't successfully completed
  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, actions(id)')
    .eq('status', 'active')
    .neq('user_id', userId)
    .eq('actions.completed_by_user', userId)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error || !tasks) {
    return null
  }

  // Find the first task where there are no actions for this user
  const nextTask = tasks.find(t => !t.actions || (Array.isArray(t.actions) && t.actions.length === 0))
  return nextTask?.id ?? null
}

export async function checkTaskAvailability(taskId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const currentQueueTaskId = await getCurrentQueueTaskId(supabase, user.id)
  if (!currentQueueTaskId) {
    revalidatePath('/tasks-feed')
    return { unavailable: true }
  }

  if (currentQueueTaskId !== taskId) {
    revalidatePath('/tasks-feed')
    return { unavailable: true }
  }

  const { data: task, error } = await supabase
    .from('tasks')
    .select('id, status, points_cost')
    .eq('id', taskId)
    .single()

  if (error || !task || task.status !== 'active' || task.points_cost <= 0) {
    revalidatePath('/tasks-feed')
    return { unavailable: true }
  }

  return { available: true }
}

export async function completeTaskAction(taskId: string, verificationInput: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const currentQueueTaskId = await getCurrentQueueTaskId(supabase, user.id)
  if (currentQueueTaskId && currentQueueTaskId !== taskId) {
    return { error: 'Complete the current task in the queue first. The next task will unlock after that.' }
  }

  const cleanedInput = verificationInput.trim()
  if (!cleanedInput) {
    return { error: 'Complete the task first, then submit the verification field properly.' }
  }

  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select('id, user_id, task_type, instagram_link, points_cost, status')
    .eq('id', taskId)
    .single()

  if (taskError || !task) {
    revalidatePath('/tasks-feed')
    return { unavailable: true, error: 'This task is no longer available.' }
  }

  if (task.user_id === user.id) {
    return { error: 'You cannot complete your own task.' }
  }

  if (task.status !== 'active' || task.points_cost <= 0) {
    revalidatePath('/tasks-feed')
    return { unavailable: true, error: 'This task has already been completed.' }
  }

  const { data: existingAction } = await supabase
    .from('actions')
    .select('id')
    .eq('task_id', taskId)
    .eq('completed_by_user', user.id)
    .maybeSingle()

  if (existingAction) {
    return { error: 'You have already completed this task.' }
  }

  let verificationError = ''

  try {
    const normalizedTask = normalizeInstagramUrl(task.instagram_link)

    if (task.task_type === 'follow') {
      const expectedUsername = normalizeUsername(normalizedTask.pathname.split('/')[1] ?? '')
      const submittedUsername = normalizeUsername(cleanedInput)

      if (!expectedUsername || submittedUsername !== expectedUsername) {
        verificationError = `Follow the correct Instagram profile, then type @${expectedUsername || 'username'} exactly to continue.`
      }
    } else {
      const submittedUrl = normalizeInstagramUrl(cleanedInput)
      const samePath = submittedUrl.pathname === normalizedTask.pathname
      const sameHost = submittedUrl.origin === normalizedTask.origin

      if (!samePath || !sameHost) {
        verificationError = 'Open the exact Instagram post from this task and paste that same post link to continue.'
      }
    }
  } catch (error) {
    verificationError = error instanceof Error ? error.message : 'Verification failed. Please try again.'
  }

  if (verificationError) {
    await supabase
      .from('actions')
      .upsert(
        {
          task_id: taskId,
          completed_by_user: user.id,
          points_earned: 0,
        },
        { onConflict: 'task_id,completed_by_user' }
      )

    revalidatePath('/tasks-feed')
    return { error: verificationError }
  }

  const reward = Math.min(getTaskReward(task.task_type), task.points_cost)
  if (reward <= 0) {
    revalidatePath('/tasks-feed')
    return { unavailable: true, error: 'This task has already been completed.' }
  }

  const { error: actionError } = await supabase
    .from('actions')
    .upsert(
      {
        task_id: taskId,
        completed_by_user: user.id,
        points_earned: reward,
      },
      { onConflict: 'task_id,completed_by_user' }
    )

  if (actionError) {
    return { error: 'Failed to record action.' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('points')
    .eq('id', user.id)
    .single()

  const currentPoints = userData?.points || 0

  const { error: userUpdateError } = await supabase
    .from('users')
    .update({ points: currentPoints + reward })
    .eq('id', user.id)

  if (userUpdateError) {
    return { error: 'Task was verified, but points could not be added.' }
  }

  const remainingPoints = Math.max(task.points_cost - reward, 0)

  const { error: taskUpdateError } = await supabase
    .from('tasks')
    .update({
      points_cost: remainingPoints,
      status: remainingPoints === 0 ? 'completed' : 'active',
    })
    .eq('id', taskId)

  if (taskUpdateError) {
    return { error: 'Task was verified, but the task balance could not be updated.' }
  }

  revalidatePath('/tasks-feed')
  revalidatePath('/dashboard')
  revalidatePath('/create-task')
  
  return { success: true, reward }
}
