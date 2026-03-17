'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createTask } from './actions'
import { AlertCircle, Link as LinkIcon } from 'lucide-react'

export default function CreateTaskPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const res = await createTask(formData)

    if (res?.error) {
      setError(res.error)
      setLoading(false)
      return
    }

    router.push('/tasks-feed?created=1')
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Create a task</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Build a new request with clearer input fields and more readable instructions so users know exactly what to do.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-slate-200 bg-slate-950 px-6 py-8 text-white md:border-b-0 md:border-r">
            <h3 className="text-xl font-semibold">Request engagement</h3>
            <p className="mt-3 text-sm leading-6 text-slate-200">
              Create a new task for other users to interact with your Instagram profile.
            </p>
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Cost and rewards</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                <strong className="text-white">Cost:</strong> 20 points per request.
                <br />
                Follow tasks reward users 2 pts.
                <br />
                Like tasks reward users 1 pt.
              </p>
            </div>
          </div>

          <div className="px-6 py-8">
            {error ? (
              <div className="mb-6 flex items-start rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mr-2 h-5 w-5 shrink-0 text-red-500" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            ) : null}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="task_type" className="block text-sm font-medium text-slate-800">
                    Task Type
                  </label>
                  <select
                    id="task_type"
                    name="task_type"
                    className="mt-2 block w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  >
                    <option value="follow">Get Followers</option>
                    <option value="like">Get Likes</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="instagram_link" className="block text-sm font-medium text-slate-800">
                    Instagram Link
                  </label>
                  <p className="mb-2 text-xs leading-5 text-slate-500">Link to your profile for follows or a specific post or reel for likes.</p>
                  <div className="relative rounded-2xl">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      name="instagram_link"
                      id="instagram_link"
                      className="block w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      placeholder="https://instagram.com/..."
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-70"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
