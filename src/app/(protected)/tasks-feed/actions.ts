'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeTaskAction(taskId: string, reward: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Check if task exists and wasn't already completed by user
  // This is handled partly by the UNIQUE constraint on (task_id, completed_by_user)
  // in the `actions` schema. Let's just insert and catch if conflict.

  const { error: actionError } = await supabase
    .from('actions')
    .insert({
      task_id: taskId,
      completed_by_user: user.id,
      points_earned: reward
    })

  if (actionError) {
    if (actionError.code === '23505') { // unique violation
      return { error: 'You have already completed this task.' }
    }
    return { error: 'Failed to record action.' }
  }

  // Add points to user
  // Get current points
  const { data: userData } = await supabase
    .from('users')
    .select('points')
    .eq('id', user.id)
    .single()

  const currentPoints = userData?.points || 0

  await supabase
    .from('users')
    .update({ points: currentPoints + reward })
    .eq('id', user.id)

  revalidatePath('/tasks-feed')
  revalidatePath('/dashboard')
  
  return { success: true }
}
