import { createClient } from '@/utils/supabase/server'
import { updateUserSettings } from './actions'
import {
  Activity,
  Ban,
  BarChart3,
  Search,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') {
    return (
      <div className="rounded-[28px] border border-rose-400/25 bg-rose-500/10 p-8 text-center text-sm font-medium text-rose-100">
        Unauthorized access. You must be an admin.
      </div>
    )
  }

  const [
    { count: usersCount },
    { count: tasksCount },
    { count: actionsCount },
    { count: bannedCount },
    { count: adminCount },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('actions').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('banned', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
  ])

  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const activeUsers = (usersCount ?? 0) - (bannedCount ?? 0)
  const completionRate =
    tasksCount && actionsCount ? Math.min(100, Math.round((actionsCount / tasksCount) * 100)) : 0

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] shadow-[0_30px_80px_rgba(2,8,23,0.45)] backdrop-blur">
        <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.6fr_0.9fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              Platform supervision
            </div>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Administrative operations, fully separated from the user workspace.
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Review user trust, task health, and activity trends from one dedicated command center with stronger contrast and cleaner moderation controls.
            </p>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Control snapshot</p>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Live users</span>
                <span className="text-lg font-semibold text-white">{usersCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Task completions</span>
                <span className="text-lg font-semibold text-emerald-300">{actionsCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
                <span className="text-sm text-slate-300">Completion rate</span>
                <span className="text-lg font-semibold text-cyan-300">{completionRate}%</span>
              </div>
            </div>
            <p className="mt-5 text-xs text-slate-400">
              Last refreshed on {new Date().toLocaleDateString()}.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Users className="h-4 w-4 text-cyan-300" />
            Total users
          </dt>
          <dd className="mt-4 text-3xl font-semibold text-white">{usersCount ?? 0}</dd>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Activity className="h-4 w-4 text-emerald-300" />
            Active users
          </dt>
          <dd className="mt-4 text-3xl font-semibold text-emerald-300">{activeUsers}</dd>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Ban className="h-4 w-4 text-rose-300" />
            Banned users
          </dt>
          <dd className="mt-4 text-3xl font-semibold text-rose-300">{bannedCount ?? 0}</dd>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Shield className="h-4 w-4 text-violet-300" />
            Admin accounts
          </dt>
          <dd className="mt-4 text-3xl font-semibold text-violet-300">{adminCount ?? 0}</dd>
        </div>
        <div className="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 shadow-lg shadow-slate-950/30">
          <dt className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <BarChart3 className="h-4 w-4 text-amber-300" />
            Total tasks
          </dt>
          <dd className="mt-4 text-3xl font-semibold text-white">{tasksCount ?? 0}</dd>
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.7fr_0.7fr]">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/75 shadow-[0_25px_60px_rgba(2,8,23,0.4)]">
          <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">User management</h2>
              <p className="mt-1 text-sm text-slate-300">
                Moderate accounts, adjust roles, and keep platform details clean.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search coming soon"
                  disabled
                  className="w-full rounded-2xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-400 placeholder:text-slate-500"
                />
              </div>
              <button
                type="button"
                className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/15"
              >
                Moderation queue
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">User</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Instagram</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Points</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Role</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-transparent">
                {allUsers?.map((u) => (
                  <tr key={u.id} className="transition hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-6 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-semibold text-white">{u.email}</div>
                      <div className="text-sm text-slate-400">ID: {u.id.slice(0, 8)}...</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData) }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="email" />
                        <input
                          type="email"
                          name="email"
                          defaultValue={u.email}
                          className="w-44 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                        />
                        <button type="submit" className="text-left text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Update</button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData) }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="instagram_username" />
                        <input
                          type="text"
                          name="instagram_username"
                          defaultValue={u.instagram_username || ''}
                          placeholder="username"
                          className="w-36 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                        />
                        <button type="submit" className="text-left text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Update</button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData) }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="points" />
                        <input
                          type="number"
                          name="points"
                          defaultValue={u.points}
                          className="w-24 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-300 focus:outline-none"
                        />
                        <button type="submit" className="text-left text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Update</button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData) }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="role" />
                        <select
                          name="role"
                          defaultValue={u.role}
                          className="w-28 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 focus:border-cyan-300 focus:outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="text-left text-xs font-semibold text-cyan-300 transition hover:text-cyan-200">Update</button>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${u.banned ? 'bg-rose-400/15 text-rose-200 ring-1 ring-rose-400/25' : 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-400/25'}`}>
                        {u.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData) }} className="inline">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="ban" />
                        <input type="hidden" name="banned" value={String(u.banned)} />
                        <button type="submit" className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${u.banned ? 'bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25' : 'bg-rose-400/15 text-rose-200 hover:bg-rose-400/25'}`}>
                          {u.banned ? 'Unban' : 'Ban'}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-6 shadow-[0_25px_60px_rgba(2,8,23,0.4)]">
            <h3 className="text-lg font-semibold text-white">Quick actions</h3>
            <p className="mt-2 text-sm text-slate-300">
              High-visibility controls for trust and safety checks.
            </p>
            <div className="mt-5 grid gap-3">
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Review recent signups
              </button>
              <button
                type="button"
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                Audit suspicious task spikes
              </button>
            </div>
          </div>

          <div className="rounded-[30px] border border-white/10 bg-slate-950/75 p-6 shadow-[0_25px_60px_rgba(2,8,23,0.4)]">
            <h3 className="text-lg font-semibold text-white">Health summary</h3>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Healthy users</p>
                <p className="mt-2 text-2xl font-semibold text-white">{activeUsers}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Moderation load</p>
                <p className="mt-2 text-2xl font-semibold text-white">{bannedCount ?? 0}</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-slate-400">Actions logged</p>
                <p className="mt-2 text-2xl font-semibold text-white">{actionsCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
