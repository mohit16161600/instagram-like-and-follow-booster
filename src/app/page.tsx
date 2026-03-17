import Link from 'next/link'
import { ArrowRight, CheckCircle2, Heart, ShieldCheck, UserPlus, Zap } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import SiteFooter from '@/components/SiteFooter'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
              IX
            </div>
            <div>
              <p className="text-lg font-semibold text-slate-950">InstaExchange</p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">Fair growth flow</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="inline-flex items-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950">
                  Dashboard
                </Link>
                <Link href="/tasks-feed" className="inline-flex items-center rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                  Open App
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-700 transition hover:text-slate-950">
                  Log in
                </Link>
                <Link href="/register" className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-sky-700">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.16),_transparent_20%),linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-800">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Real tasks, clearer verification, cleaner UI
            </div>
            <h1 className="mt-8 max-w-4xl text-5xl font-semibold tracking-tight text-slate-950 md:text-7xl">
              Grow your Instagram with a task flow that feels simple and trustworthy.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Earn points by helping other users, spend those points on your own requests, and manage everything from a cleaner dashboard with better feedback.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href={user ? '/dashboard' : '/register'} className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 text-lg font-medium text-white transition hover:bg-slate-800">
                {user ? 'Go to Dashboard' : 'Start Earning Now'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              {!user ? (
                <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-8 py-4 text-lg font-medium text-slate-700 transition hover:border-slate-400 hover:text-slate-950">
                  I already have an account
                </Link>
              ) : null}
            </div>
            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Clear point-based rewards
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Guided task verification
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Cleaner dashboard navigation
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-2xl shadow-slate-200">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">Platform flow</p>
              <h2 className="mt-4 text-3xl font-semibold text-white">From effort to growth</h2>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white">Earn points</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">Open a task, follow the instructions, and complete the verification flow to build your balance.</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-sm font-semibold text-white">Create requests</p>
                  <p className="mt-1 text-sm leading-6 text-slate-200">Turn your points into likes or follower requests with clearer forms and cleaner page structure.</p>
                </div>
                <div className="rounded-2xl bg-emerald-400/15 p-4 ring-1 ring-emerald-300/20">
                  <p className="text-sm font-semibold text-emerald-100">Built for readability</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-50">Light text on dark surfaces, dark text on light surfaces, and less visual clutter across the app.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-semibold text-slate-950">How it works</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              The exchange stays simple: help first, earn points, then use them for your own Instagram growth requests.
            </p>
          </div>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <Heart className="h-7 w-7 text-indigo-700" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">1. Earn points</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Like or follow other users&apos; profiles via our tasks feed to earn points. Follows give 2 points, likes give 1 point.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100">
                <UserPlus className="h-7 w-7 text-pink-700" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">2. Create tasks</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Use your earned points to request followers or likes on your own profile. It costs 20 points per request.
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                <Zap className="h-7 w-7 text-emerald-700" />
              </div>
              <h3 className="mt-6 text-xl font-semibold text-slate-950">3. Grow steadily</h3>
              <p className="mt-3 leading-7 text-slate-600">
                Watch your profile grow as targeted real users engage back. Fair exchange, zero bots.
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
