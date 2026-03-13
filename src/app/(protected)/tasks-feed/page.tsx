import { createClient } from '@/utils/supabase/server'
import TaskCard from '@/components/TaskCard'
import { Inbox } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TasksFeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Fetch tasks
  // 1. Where creator is NOT the current user
  // 2. Where task status is 'active'
  // 3. Where current user hasn't successfully completed it yet (left join actions)

  // Supabase syntax for this:
  const { data: allActiveTasks, error } = await supabase
    .from('tasks')
    .select(`
      id,
      task_type,
      instagram_link,
      points_cost,
      user_id,
      status,
      users:user_id ( instagram_username ),
      actions ( completed_by_user )
    `)
    .eq('status', 'active')
    .neq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error(error)
    return <div className="p-4 text-red-500">Failed to load tasks.</div>
  }

  // Filter out tasks the user has already done
  // (Left outer join via API brings actions, we filter array in JS because complex queries in Supabase RPC might be overkill here)
  const availableTasks = allActiveTasks?.filter((task) => {
    // Return true if `actions` doesn't contain an entry with completed_by_user == user.id
    const hasCompleted = task.actions.some((action: any) => action.completed_by_user === user.id)
    return !hasCompleted
  })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
          Earn Points
        </h2>
        <p className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 text-gray-500">
          Complete these tasks to earn points for your own requests.
        </p>
      </div>

      <div className="space-y-4 mt-6">
        {availableTasks && availableTasks.length > 0 ? (
          availableTasks.map((task) => (
            <TaskCard key={task.id} task={task as any} />
          ))
        ) : (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-lg shadow-sm">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new tasks from other users.</p>
          </div>
        )}
      </div>
    </div>
  )
}
