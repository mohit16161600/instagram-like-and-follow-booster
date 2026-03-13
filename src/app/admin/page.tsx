import { createClient } from '@/utils/supabase/server'
import { updateUserSettings } from './actions'
import { Users, Filter, CheckCircle, Ban } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Verify admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: me } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') {
    return (
      <div className="p-8 text-center text-red-500 font-medium">
        Unauthorized access. You must be an admin.
      </div>
    )
  }

  // Fetch stats (using exact counts for brevity)
  const [{ count: usersCount }, { count: tasksCount }, { count: actionsCount }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('actions').select('*', { count: 'exact', head: true }),
  ])

  // Fetch users for management
  const { data: allUsers } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100) // basic pagination placeholder

  return (
    <div className="space-y-8 px-4 sm:px-0">
      
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{usersCount}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{tasksCount}</dd>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg px-4 py-5 sm:p-6 border border-gray-100">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Actions Completed</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">{actionsCount}</dd>
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white shadow border border-gray-200 sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            User Management
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allUsers?.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{u.email}</div>
                    <div className="text-sm text-gray-500">@{u.instagram_username || 'anonymous'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <form action={async (formData) => { "use server"; await updateUserSettings(formData); }} className="flex flex-col gap-2 max-w-[120px]">
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="action" value="points" />
                      <input 
                        type="number" 
                        name="points" 
                        defaultValue={u.points} 
                        className="text-sm border border-gray-300 rounded px-2 py-1 w-24"
                      />
                      <button type="submit" className="text-xs text-blue-600 hover:text-blue-900 text-left">Update</button>
                    </form>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <form action={async (formData) => { "use server"; await updateUserSettings(formData); }}>
                      <input type="hidden" name="user_id" value={u.id} />
                      <input type="hidden" name="action" value="ban" />
                      <input type="hidden" name="banned" value={String(u.banned)} />
                      <button type="submit" className={`${u.banned ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'}`}>
                        {u.banned ? 'Unban' : 'Ban User'}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
