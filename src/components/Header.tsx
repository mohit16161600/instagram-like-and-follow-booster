import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { LayoutDashboard, ListTodo, PlusCircle, User } from 'lucide-react'
import ConfirmSignOutButton from '@/components/ConfirmSignOutButton'
import UserStats from '@/components/UserStats'

async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // We no longer fetch points/role here to prevent layout blocking.
  // Instead, the <UserStats /> client component handles it asynchronously.

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between lg:gap-8">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-sm">
                IX
              </div>
              <div>
                <span className="block text-lg font-semibold text-slate-950">InstaExchange</span>
                <span className="block text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                  User workspace
                </span>
              </div>
            </Link>

            <nav className="flex flex-wrap items-center gap-2">
              <Link href="/dashboard" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/tasks-feed" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
                <ListTodo className="mr-2 h-4 w-4" />
                Earn Points
              </Link>
              <Link href="/create-task" className="inline-flex items-center rounded-full border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Task
              </Link>
            </nav>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <UserStats />
            <Link href="/profile" className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
              <User className="mr-2 h-4 w-4" />
              Profile
            </Link>
            <ConfirmSignOutButton
              label="Logout"
              className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
              iconClassName="mr-2 h-4 w-4"
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
