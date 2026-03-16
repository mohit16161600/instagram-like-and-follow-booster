'use client'

import { useEffect, useState } from 'react'
import { sendOTP, verifyOTP } from '../actions'
import { Mail, KeyRound, Loader2, Info } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const interval = window.setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000)
    return () => window.clearInterval(interval)
  }, [cooldown])

  async function handleSendOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    const res = await sendOTP(formData)
    
    if (res.error) {
      setError(res.error)
    } else {
      setStep('otp')
      // Prevent immediate resends and reduce chance of hitting email rate limits
      setCooldown(60)
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    formData.append('email', email)
    const res = await verifyOTP(formData)
    
    if (res?.error) {
      setError(res.error)
      setLoading(false)
    }
  }

  return (
    <>
      <div>
        <h3 className="text-xl font-semibold text-center text-gray-800">
          {step === 'email' ? 'Create a new account' : 'Verify your email'}
        </h3>
      </div>
      
      {error && (
        <div className="bg-red-50 p-3 rounded-md text-sm text-red-600 border border-red-200 flex items-start gap-2">
          <Info className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {step === 'email' ? (
        <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">We&apos;ll send you a secure code to confirm your email.</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : cooldown > 0 ? (
                `Resend in ${cooldown}s`
              ) : (
                'Get Sign Up Code'
              )}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-600">
             Already have an account?{' '}
             <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
               Sign in
             </Link>
          </div>
        </form>
      ) : (
        <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
         <div>
            <p className="text-sm text-gray-600 mb-4 text-center">
              We&apos;ve sent a one-time password to <strong>{email}</strong>
            </p>
            <label htmlFor="token" className="sr-only">Auth Code</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <KeyRound className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="token"
                name="token"
                type="text"
                required
                inputMode="numeric"
                pattern="\d{6,8}"
                maxLength={8}
                className="appearance-none rounded-lg relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter 6-8 digit code"
                title="Enter the 6-8 digit code from the email"
              />
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
            </button>
          </div>
          
          <div className="text-center text-sm">
             <button 
               type="button" 
               onClick={() => setStep('email')} 
               className="font-medium text-green-600 hover:text-green-500"
             >
               Use a different email
             </button>
          </div>
        </form>
      )}
    </>
  )
}
