import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  Activity,
  ArrowLeft,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import ConfirmSignOutButton from '@/components/ConfirmSignOutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, email, points')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#06111f] text-slate-100">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.24),_transparent_24%),linear-gradient(180deg,_rgba(6,17,31,1)_0%,_rgba(10,22,38,1)_100%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
          <aside className="border-b border-white/10 bg-slate-950/70 px-6 py-8 backdrop-blur lg:min-h-screen lg:w-[300px] lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-300/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                  Admin Control
                </p>
                <h1 className="text-2xl font-semibold text-white">Ops Console</h1>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Signed in as</p>
              <p className="mt-2 break-all text-base font-semibold text-white">{profile?.email ?? user.email}</p>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/20 px-4 py-3">
                <span className="text-sm text-slate-300">Admin credits</span>
                <span className="text-lg font-semibold text-emerald-300">{profile?.points ?? 0}</span>
              </div>
            </div>

            <nav className="mt-8 space-y-3">
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-400/15"
              >
                <span className="flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4" />
                  Command center
                </span>
                <span className="text-xs text-cyan-200">Live</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Return to user panel
              </Link>
            </nav>

            <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm font-semibold text-white">Review focus</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-cyan-300" />
                  Validate user roles and bans carefully
                </li>
                <li className="flex items-center gap-3">
                  <Activity className="h-4 w-4 text-emerald-300" />
                  Monitor task volume and completion flow
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <ConfirmSignOutButton
                label="Sign out"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
                iconClassName="h-4 w-4"
              />
            </div>
          </aside>

          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  )
}
