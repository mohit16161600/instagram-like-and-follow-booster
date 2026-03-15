'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function sendOTP(formData: FormData) {
  const email = formData.get('email') as string
  const supabase = await createClient()

  // When Supabase sends the OTP/magic link email, it will include a redirect URL.
  // By default, Supabase uses the project "Site URL" setting, but you can override it here.
  const redirectTo =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Allow signup if user not exists
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Next steps happens on client or passed back to UI
  return { success: true, email }
}

export async function verifyOTP(formData: FormData) {
  const email = formData.get('email') as string
  const token = formData.get('token') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
