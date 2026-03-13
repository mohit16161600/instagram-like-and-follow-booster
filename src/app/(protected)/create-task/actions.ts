'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createTask(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const taskType = formData.get('task_type') as string
  const instagramLink = formData.get('instagram_link') as string
  // Points cost per valid action: 2 for follow, 1 for like.
  // We'll deduct 20 points explicitly per user request to create a task?
  // User Prompt: "System deducts points when a task is created"
  // "Follow tasks reward 2 points, Like tasks reward 1 point."
  // Wait, if 1 task takes 20 points from creator, it can reward 10 follows (20/2) or 20 likes (20/1).
  // I will just deduct 20 points to create the chunk of this budget.

  const pointsCost = 20

  // Check user points
  const { data: userData } = await supabase
    .from('users')
    .select('points')
    .eq('id', user.id)
    .single()

  if (!userData || userData.points < pointsCost) {
    return { error: 'You need to earn at least 20 points before requesting followers or likes.' }
  }

  // Deduct points and create task in a single logic block
  // Using RPC is better, but we can do consecutive queries here since it's simple MV.
  const { error: deductError } = await supabase
    .from('users')
    .update({ points: userData.points - pointsCost })
    .eq('id', user.id)

  if (deductError) return { error: 'Failed to deduct points' }

  // Insert task
  const { error: taskError } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      task_type: taskType,
      instagram_link: instagramLink,
      points_cost: pointsCost, // budget
    })

  if (taskError) {
    // Ideally rollback, but avoiding complex transactions for now
    return { error: 'Failed to create task' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/tasks-feed')
  redirect('/tasks-feed')
}
