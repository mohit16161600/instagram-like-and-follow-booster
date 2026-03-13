'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateUserSettings(formData: FormData) {
  const supabase = await createClient()
  
  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return { error: 'Unauthorized' }

  const userId = formData.get('user_id') as string
  const action = formData.get('action') as string
  
  if (action === 'ban') {
    const isBanned = formData.get('banned') === 'true'
    await supabase.from('users').update({ banned: !isBanned }).eq('id', userId)
  } else if (action === 'points') {
    const newPoints = parseInt(formData.get('points') as string, 10)
    await supabase.from('users').update({ points: newPoints }).eq('id', userId)
  }

  revalidatePath('/admin')
  return { success: true }
}
