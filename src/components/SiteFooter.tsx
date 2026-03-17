import Link from 'next/link'

type SiteFooterProps = {
  compact?: boolean
}

export default function SiteFooter({ compact = false }: SiteFooterProps) {
  return (
    <footer className={compact ? 'border-t border-slate-200 bg-white/90' : 'border-t border-slate-200 bg-white'}>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-base font-semibold text-slate-900">InstaExchange</p>
          <p className="mt-1 max-w-xl text-slate-600">
            A cleaner exchange flow for earning points, creating requests, and growing with real task-based engagement.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/" className="font-medium text-slate-700 transition hover:text-slate-950">
            Home
          </Link>
          <Link href="/dashboard" className="font-medium text-slate-700 transition hover:text-slate-950">
            Dashboard
          </Link>
          <Link href="/tasks-feed" className="font-medium text-slate-700 transition hover:text-slate-950">
            Earn Points
          </Link>
          <Link href="/create-task" className="font-medium text-slate-700 transition hover:text-slate-950">
            Create Task
          </Link>
        </div>
      </div>
    </footer>
  )
}
