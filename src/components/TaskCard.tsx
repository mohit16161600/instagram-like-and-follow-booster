'use client'

import { useState } from 'react'
import { completeTaskAction } from '@/app/(protected)/tasks-feed/actions'
import { Heart, UserPlus, CheckCircle, ExternalLink, Loader2 } from 'lucide-react'

type Task = {
  id: string
  task_type: string
  instagram_link: string
  points_cost: number
  users: {
    instagram_username: string
  }
}

export default function TaskCard({ task }: { task: Task }) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const reward = task.task_type === 'follow' ? 2 : 1
  const Icon = task.task_type === 'follow' ? UserPlus : Heart

  async function handleDone() {
    setLoading(true)
    setError('')
    
    // Server action
    const res = await completeTaskAction(task.id, reward)
    
    if (res?.error) {
       setError(res.error)
       setLoading(false)
    } else {
       setDone(true)
    }
  }

  if (done) return null

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between transition hover:shadow-md">
      <div className="flex items-center space-x-4 mb-4 md:mb-0">
        <div className={`p-3 rounded-full ${task.task_type === 'follow' ? 'bg-indigo-100 text-indigo-600' : 'bg-pink-100 text-pink-600'}`}>
           <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">@{task.users?.instagram_username || 'anonymous'}</p>
          <p className="text-lg font-bold text-gray-900 capitalize">{task.task_type}</p>
          <p className="text-sm font-semibold text-green-600">+{reward} point{reward > 1 ? 's' : ''}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {error && <p className="text-xs text-red-500 self-center">{error}</p>}
        <a 
          href={task.instagram_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open Link
        </a>
        <button
          onClick={handleDone}
          disabled={loading}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4 mr-2" /> Mark as Done</>}
        </button>
      </div>
    </div>
  )
}
