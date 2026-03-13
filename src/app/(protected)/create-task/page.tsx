'use client'

import { useState } from 'react'
import { createTask } from './actions'
import { AlertCircle, Link as LinkIcon } from 'lucide-react'

export default function CreateTaskPage() {
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
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-gray-100">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Request Engagement</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create a new task for other users to interact with your Instagram profile.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-100">
              <p className="text-xs text-blue-700">
                <strong>Cost:</strong> 20 points per request.<br/>
                Follow tasks reward users 2 pts.<br/>
                Like tasks reward users 1 pt.
              </p>
            </div>
          </div>
          
          <div className="mt-5 md:mt-0 md:col-span-2">
            {error && (
              <div className="mb-4 bg-red-50 p-4 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2 shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-6 gap-6">
                
                <div className="col-span-6">
                  <label htmlFor="task_type" className="block text-sm font-medium text-gray-700">
                    Task Type
                  </label>
                  <select
                    id="task_type"
                    name="task_type"
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md border"
                    required
                  >
                    <option value="follow">Get Followers</option>
                    <option value="like">Get Likes</option>
                  </select>
                </div>

                <div className="col-span-6">
                  <label htmlFor="instagram_link" className="block text-sm font-medium text-gray-700">
                    Instagram Link
                  </label>
                  <p className="text-xs text-gray-500 mb-1">Link to your profile (for follows) or specific post (for likes).</p>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="instagram_link"
                      id="instagram_link"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                      placeholder="https://instagram.com/..."
                      required
                    />
                  </div>
                </div>

              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
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
