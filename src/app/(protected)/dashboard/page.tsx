import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { ArrowRight, Coins, ListTodo, PlusCircle, TrendingUp, UserCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: profile }, { count: activeTaskCount }, { count: completedTaskCount }] = await Promise.all([
    user
      ? supabase.from('users').select('points, instagram_username').eq('id', user.id).single()
      : Promise.resolve({ data: null }),
    user
      ? supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'active')
      : Promise.resolve({ count: 0 }),
    user
      ? supabase.from('actions').select('id', { count: 'exact', head: true }).eq('completed_by_user', user.id).eq('status', 'approved')
      : Promise.resolve({ count: 0 }),
  ])

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="bg-slate-950 px-6 py-8 text-white sm:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-200">Dashboard</p>
              <h2 className="mt-3 text-3xl font-semibold">Welcome back{profile?.instagram_username ? `, @${profile.instagram_username}` : ''}.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Track your points, review your activity, and move quickly between earning points and creating new requests.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/tasks-feed" className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-medium text-white transition hover:bg-white/15">
                <TrendingUp className="mr-2 h-4 w-4" />
                Earn Points
              </Link>
              <Link href="/create-task" className="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-sky-400">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Request
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-4 px-6 py-6 sm:px-8 md:grid-cols-3">
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-medium text-amber-900">Available points</p>
            <p className="mt-3 text-3xl font-semibold text-amber-950">{profile?.points ?? 0}</p>
            <p className="mt-2 text-sm text-amber-800">Use these to create follower and like requests.</p>
          </div>
          <div className="rounded-3xl border border-sky-200 bg-sky-50 p-5">
            <p className="text-sm font-medium text-sky-900">Active requests</p>
            <p className="mt-3 text-3xl font-semibold text-sky-950">{activeTaskCount ?? 0}</p>
            <p className="mt-2 text-sm text-sky-800">Your currently running tasks waiting for engagement.</p>
          </div>
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="text-sm font-medium text-emerald-900">Completed tasks</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-950">{completedTaskCount ?? 0}</p>
            <p className="mt-2 text-sm text-emerald-800">Approved actions you have finished successfully.</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <ListTodo className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">What to do next</h3>
              <p className="text-sm text-slate-600">A clearer path for moving through the app without guessing.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Earn before you spend</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Visit the tasks feed to complete jobs, follow the verification steps, and increase your balance.
              </p>
              <Link href="/tasks-feed" className="mt-4 inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800">
                Open tasks feed
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-950">Keep your profile ready</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Update your Instagram username and profile link so your requests remain easy for others to complete.
              </p>
              <Link href="/profile" className="mt-4 inline-flex items-center text-sm font-medium text-sky-700 hover:text-sky-800">
                Edit profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-800">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Account snapshot</h3>
              <p className="text-sm text-slate-600">Core details at a glance with clearer text contrast.</p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-sky-200">Instagram username</p>
              <p className="mt-2 text-2xl font-semibold">{profile?.instagram_username ? `@${profile.instagram_username}` : 'Not added yet'}</p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <div className="flex items-center gap-3">
                <Coins className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-950">Balance reminder</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Each new request costs 20 points, so keep earning to maintain steady activity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
