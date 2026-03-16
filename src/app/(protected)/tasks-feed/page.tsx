import { createClient } from '@/utils/supabase/server'
import TaskCard from '@/components/TaskCard'
import { CheckCircle2, Clock3, Inbox, Layers3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

type TaskFeedRecord = {
  id: string
  task_type: string
  instagram_link: string
  points_cost: number
  user_id: string
  status: string
  actions: Array<{
    completed_by_user: string
    status: string | null
    points_earned: number | null
    review_notes: string | null
    verification_input: string | null
  }>
}

type TaskRow = Omit<TaskFeedRecord, 'actions'>

type UserProfileRow = {
  id: string
  instagram_username: string | null
}

type ActionRow = {
  task_id: string
  completed_by_user: string
  status: string | null
  points_earned: number | null
  review_notes: string | null
  verification_input: string | null
}

type LegacyActionRow = {
  task_id: string
  completed_by_user: string
  points_earned: number | null
}

function getTaskUsername(task: TaskFeedRecord, usernameByUserId: Map<string, string | null>) {
  return usernameByUserId.get(task.user_id) ?? null
}

function attachActions(tasks: TaskRow[], actions: ActionRow[]): TaskFeedRecord[] {
  const actionsByTaskId = new Map<string, TaskFeedRecord['actions']>()

  for (const action of actions) {
    const existing = actionsByTaskId.get(action.task_id) ?? []
    existing.push({
      completed_by_user: action.completed_by_user,
      status: action.status,
      points_earned: action.points_earned,
      review_notes: action.review_notes,
      verification_input: action.verification_input,
    })
    actionsByTaskId.set(action.task_id, existing)
  }

  return tasks.map((task) => ({
    ...task,
    actions: actionsByTaskId.get(task.id) ?? [],
  }))
}

async function loadActionsForTasks(supabase: Awaited<ReturnType<typeof createClient>>, taskIds: string[]) {
  if (!taskIds.length) {
    return [] as ActionRow[]
  }

  const primaryQuery = await supabase
    .from('actions')
    .select('task_id, completed_by_user, status, points_earned, review_notes, verification_input')
    .in('task_id', taskIds)

  if (!primaryQuery.error) {
    return (primaryQuery.data as ActionRow[] | null) ?? []
  }

  console.error(primaryQuery.error)

  const legacyQuery = await supabase
    .from('actions')
    .select('task_id, completed_by_user, points_earned')
    .in('task_id', taskIds)

  if (legacyQuery.error) {
    console.error(legacyQuery.error)
    return []
  }

  return ((legacyQuery.data as LegacyActionRow[] | null) ?? []).map((action) => ({
    task_id: action.task_id,
    completed_by_user: action.completed_by_user,
    status: 'approved',
    points_earned: action.points_earned,
    review_notes: null,
    verification_input: null,
  }))
}

type TasksFeedPageProps = {
  searchParams?: Promise<{
    created?: string
  }>
}

export default async function TasksFeedPage({ searchParams }: TasksFeedPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams
  
  if (!user) return null

  // Fetch tasks
  // 1. Where creator is NOT the current user
  // 2. Where task status is 'active'
  // 3. Where current user hasn't successfully completed it yet (left join actions)

  // Supabase syntax for this:
  const { data: allActiveTasks, error } = await supabase
    .from('tasks')
    .select('id, task_type, instagram_link, points_cost, user_id, status')
    .eq('status', 'active')
    .neq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) {
    console.error(error)
    return (
      <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Failed to load tasks.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    )
  }

  const taskIds = ((allActiveTasks as TaskRow[] | null) ?? []).map((task) => task.id)
  const userIds = Array.from(new Set((((allActiveTasks as TaskRow[] | null) ?? []).map((task) => task.user_id))))

  const [{ data: relatedUsers }, relatedActions] = await Promise.all([
    userIds.length
      ? supabase.from('users').select('id, instagram_username').in('id', userIds)
      : Promise.resolve({ data: [] as UserProfileRow[], error: null }),
    loadActionsForTasks(supabase, taskIds),
  ])

  const usernameByUserId = new Map<string, string | null>(
    ((relatedUsers as UserProfileRow[] | null) ?? []).map((profile) => [profile.id, profile.instagram_username])
  )

  const allActiveTasksWithActions = attachActions(
    (allActiveTasks as TaskRow[] | null) ?? [],
    relatedActions
  )

  // Filter out tasks the user has already done
  const availableTasks = allActiveTasksWithActions.filter((task) => {
    if (task.user_id === user.id) {
      return false
    }

    const hasCompleted = task.actions.some(
      (action) => action.completed_by_user === user.id && action.status === 'approved'
    )
    return !hasCompleted
  })

  const currentTask = availableTasks[0] ?? null
  const currentUserAction = currentTask?.actions.find((action) => action.completed_by_user === user.id) ?? null
  const currentTaskForCard = currentTask
    ? {
        ...currentTask,
        users: { instagram_username: getTaskUsername(currentTask, usernameByUserId) },
      }
    : null

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

      {params?.created === '1' && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Your task was created successfully.</p>
            <p className="text-sm">It is now listed in your active requests below.</p>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_0.85fr]">
        {currentTaskForCard ? (
          <TaskCard
            task={currentTaskForCard}
            queueCount={availableTasks.length}
            previousAttempt={currentUserAction}
          />
        ) : (
          <div className="rounded-3xl border border-gray-200 bg-white py-16 text-center shadow-sm">
            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks available</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new tasks from other users.</p>
          </div>
        )}

        <aside className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900 p-3 text-white">
              <Layers3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Task Queue</h3>
              <p className="text-sm text-gray-500">Only one task is shown at a time so users stay focused and the flow feels smoother.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Clock3 className="h-4 w-4" />
                Waiting tasks
              </div>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{availableTasks.length}</p>
              <p className="mt-1 text-sm text-slate-500">
                {currentTask ? 'Only one task unlocks at a time. Finish the current one to load the next task.' : 'New tasks will appear here when other users create them.'}
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                Verification rules
              </div>
              <p className="mt-2">Follow tasks require the exact Instagram username.</p>
              <p className="mt-1">Like tasks require the exact Instagram post or reel link.</p>
              <p className="mt-1">When the check passes, points are added to the user and removed from that task balance.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
