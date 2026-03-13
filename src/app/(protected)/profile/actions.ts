'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const igUsername = formData.get('instagram_username') as string
  const profileLink = formData.get('profile_link') as string

  const { error } = await supabase
    .from('users')
    .update({
      instagram_username: igUsername,
      profile_link: profileLink,
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
