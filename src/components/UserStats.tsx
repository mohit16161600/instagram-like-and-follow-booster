'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Coins, ShieldCheck } from 'lucide-react'

export default function UserStats() {
  const [points, setPoints] = useState<number | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('points, role')
          .eq('id', user.id)
          .single()
        
        if (data) {
          setPoints(data.points)
          setRole(data.role)
        }
      }
      setLoading(false)
    }

    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-3 animate-pulse">
        <div className="h-9 w-24 rounded-full bg-slate-100" />
        <div className="h-9 w-24 rounded-full bg-slate-100" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm">
        <Coins className="mr-2 h-4 w-4 text-amber-600" />
        {points ?? 0} pts
      </div>
      
      {role === 'admin' && (
        <Link 
          href="/admin" 
          className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100"
        >
          <ShieldCheck className="mr-2 h-4 w-4" />
          Admin Panel
        </Link>
      )}
    </div>
  )
}
