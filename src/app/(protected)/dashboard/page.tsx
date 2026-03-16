import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { TrendingUp, PlusCircle, Coins } from 'lucide-react'

export default async function DashboardPage() {
  await createClient()
  
  // Dashboard stats
  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back!
          </h2>
          <p className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
            Engage and grow your audience
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 gap-3">
          <Link href="/tasks-feed" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none">
            <TrendingUp className="w-4 h-4 mr-2" />
            Earn Points
          </Link>
          <Link href="/create-task" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Request
          </Link>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder stats cards */}
        <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Coins className="h-6 w-6 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Points</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">Check Header</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow border border-gray-100 rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="ml-5 w-0 flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">Tasks Completed by You</dt>
                <dd className="text-lg font-medium text-gray-900">See /profile</dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
