import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // This simply checks that we can reach the database and that the `users` table exists.
    // It does not expose any sensitive data.
    const { error } = await supabase.from('users').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        { ok: false, message: 'Supabase query failed', details: error.message },
        { status: 502 }
      )
    }

    return NextResponse.json({ ok: true, message: 'Supabase connected (users table query succeeded)' })
  } catch (error) {
    return NextResponse.json(
      { ok: false, message: 'Supabase connection failed', details: String(error) },
      { status: 500 }
    )
  }
}
