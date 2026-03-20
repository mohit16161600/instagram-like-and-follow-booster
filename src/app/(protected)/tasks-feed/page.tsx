import { createClient } from '@/utils/supabase/server'
import TaskCard from '@/components/TaskCard'
import { CheckCircle2, Clock3, ExternalLink as ExternalLinkIcon, Inbox, Layers3, Sparkles } from 'lucide-react'

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

type TaskRow = Omit<TaskFeedRecord, 'actions'> & {
  users?: Array<{
    instagram_username: string | null
  }> | {
    instagram_username: string | null
  } | null
}

type UserProfileRow = {
  id: string
  instagram_username: string | null
}

type ActionRow = {
  task_id: string
  completed_by_user: string
  points_earned: number | null
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
      status: 'approved',
      points_earned: action.points_earned,
      review_notes: null,
      verification_input: null,
    })
    actionsByTaskId.set(action.task_id, existing)
  }

  return tasks.map((task) => ({
    ...task,
    actions: actionsByTaskId.get(task.id) ?? [],
  }))
}

async function loadActionsForTasks(supabase: Awaited<ReturnType<typeof createClient>>, taskIds: string[], userId: string) {
  if (!taskIds.length) {
    return [] as ActionRow[]
  }

  const primaryQuery = await supabase
    .from('actions')
    .select('task_id, completed_by_user, points_earned')
    .in('task_id', taskIds)
    .eq('completed_by_user', userId)

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
    .select('id, task_type, instagram_link, points_cost, user_id, status, users(instagram_username)')
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

  const [relatedActions] = await Promise.all([
    loadActionsForTasks(supabase, taskIds, user.id),
  ])

  const usernameByUserId = new Map<string, string | null>(
    ((allActiveTasks as any[] | null) ?? []).map((task) => {
      const userData = Array.isArray(task.users) ? task.users[0] : task.users
      return [task.user_id, userData?.instagram_username || null]
    })
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
    <div className="max-w-4xl mx-auto space-y-12 py-8 px-4">
      {/* 1. Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Earn Points
        </div>
        <h1 className="text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
          Task Dashboard
        </h1>
        <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto">
          Complete tasks to grow your balance and verify actions in real-time.
        </p>
      </div>

      {params?.created === '1' && (
        <div className="rounded-3xl border border-emerald-100 bg-emerald-50 px-6 py-4 text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <p className="font-bold text-sm">Campaign launched successfully! Your task is now live.</p>
          </div>
        </div>
      )}

      {/* 2. Primary Task Area */}
      <div className="w-full">
        {currentTaskForCard ? (
          <TaskCard
            task={currentTaskForCard}
            queueCount={availableTasks.length}
            previousAttempt={currentUserAction}
          />
        ) : (
          <div className="rounded-[3rem] border border-slate-200 bg-white py-24 text-center shadow-xl shadow-slate-200/50">
            <Inbox className="mx-auto h-20 w-20 text-slate-200" />
            <h3 className="mt-6 text-2xl font-black text-slate-900">Queue is Clear</h3>
            <p className="mt-2 text-slate-500 font-medium">There are no new tasks available right now. Check back soon!</p>
          </div>
        )}
      </div>

      {/* 4. Steps / Explanation Section */}
      <div className="pt-16 border-t border-slate-100">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900">How to use this dashboard</h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">Follow these 3 simple steps to grow your point balance instantly.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              step: '01', 
              title: 'Open Task', 
              desc: 'Click on the "Open Target" button to visit the Instagram profile or post directly.',
              icon: ExternalLinkIcon,
              color: 'bg-indigo-50 text-indigo-600'
            },
            { 
              step: '02', 
              title: 'Interact', 
              desc: 'Follow the account or like the post as requested. Stay on the page for at least 2 seconds.',
              icon: Sparkles,
              color: 'bg-amber-50 text-amber-600'
            },
            { 
              step: '03', 
              title: 'Claim Points', 
              desc: 'Come back and click "Claim Points". Your balance will update immediately.',
              icon: CheckCircle2,
              color: 'bg-emerald-50 text-emerald-600'
            }
          ].map((item, idx) => (
            <div key={idx} className="group relative rounded-3xl border border-slate-100 bg-white p-6 transition-all hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5">
              <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-[10px] font-black text-white">
                {item.step}
              </div>
              <div className={`mt-2 flex h-12 w-12 items-center justify-center rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon className="h-6 w-6" />
              </div>
              <h4 className="mt-4 text-lg font-black text-slate-900">{item.title}</h4>
              <p className="mt-2 text-sm font-medium text-slate-500 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
