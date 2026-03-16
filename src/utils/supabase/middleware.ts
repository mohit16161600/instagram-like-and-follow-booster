import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Prefer the service role key for server-side middleware operations if available.
  // This avoids RLS blocking reads/writes when policies are not defined.
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ensure every user has a row in `public.users` and starts with 50 points.
  // This helps when the trigger/insert might not have run for existing auth users.
  if (user) {
    const { data: userRecord } = await supabase
      .from('users')
      .select('points')
      .eq('id', user.id)
      .single()

    if (!userRecord) {
      await supabase
        .from('users')
        .insert({ id: user.id, email: user.email ?? '', points: 50 })
    } else if (userRecord.points === null || userRecord.points === 0) {
      await supabase.from('users').update({ points: 50 }).eq('id', user.id)
    }
  }

  // Define protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/profile') ||
                           request.nextUrl.pathname.startsWith('/earn-points') ||
                           request.nextUrl.pathname.startsWith('/create-task') ||
                           request.nextUrl.pathname.startsWith('/tasks-feed') ||
                           request.nextUrl.pathname.startsWith('/admin')

  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
                      request.nextUrl.pathname.startsWith('/register')

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Admin protection
  if (user && request.nextUrl.pathname.startsWith('/admin')) {
    // We could fetch the user's role here, but let's do simple auth first
    // For robust admin check, we query the `users` table for role = 'admin'
    // This is optional if we prefer component-level auth for admin routes, but let's do a basic block:
    const { data: userRecord } = await supabase.from('users').select('role').eq('id', user.id).single()
    if (!userRecord || userRecord.role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
