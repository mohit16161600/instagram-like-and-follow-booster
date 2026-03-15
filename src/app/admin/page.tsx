import { createClient } from '@/utils/supabase/server'
import { updateUserSettings, bulkUpdateUsers } from './actions'
import { Users, Filter, CheckCircle, Ban, Search, BarChart3, Shield, Activity } from 'lucide-react'

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

  // Fetch stats
  const [{ count: usersCount }, { count: tasksCount }, { count: actionsCount }, { count: bannedCount }, { count: adminCount }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('tasks').select('*', { count: 'exact', head: true }),
    supabase.from('actions').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('banned', true),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
  ])

  // Fetch users for management (with search if provided)
  const searchQuery = '' // For now, no search; can add later
  let query = supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (searchQuery) {
    query = query.or(`email.ilike.%${searchQuery}%,instagram_username.ilike.%${searchQuery}%`)
  }

  const { data: allUsers } = await query

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Shield className="w-8 h-8 mr-3 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="mt-2 text-gray-600">Manage users, monitor activity, and oversee the platform.</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow-sm rounded-lg px-4 py-5 border border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Users
            </dt>
            <dd className="mt-1 text-3xl font-bold text-gray-900">{usersCount}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg px-4 py-5 border border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Active Users
            </dt>
            <dd className="mt-1 text-3xl font-bold text-green-600">{usersCount - bannedCount}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg px-4 py-5 border border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <Ban className="w-4 h-4 mr-2" />
              Banned Users
            </dt>
            <dd className="mt-1 text-3xl font-bold text-red-600">{bannedCount}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg px-4 py-5 border border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Admins
            </dt>
            <dd className="mt-1 text-3xl font-bold text-blue-600">{adminCount}</dd>
          </div>
          <div className="bg-white overflow-hidden shadow-sm rounded-lg px-4 py-5 border border-gray-200">
            <dt className="text-sm font-medium text-gray-500 truncate flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Total Tasks
            </dt>
            <dd className="mt-1 text-3xl font-bold text-gray-900">{tasksCount}</dd>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl leading-6 font-semibold text-gray-900 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              User Management
            </h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Bulk Actions
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instagram</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers?.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.email}</div>
                      <div className="text-sm text-gray-500">ID: {u.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData); }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="email" />
                        <input 
                          type="email" 
                          name="email" 
                          defaultValue={u.email} 
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-32 focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="text-xs text-blue-600 hover:text-blue-900 font-medium">Update</button>
                      </form>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData); }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="instagram_username" />
                        <input 
                          type="text" 
                          name="instagram_username" 
                          defaultValue={u.instagram_username || ''} 
                          placeholder="username"
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-28 focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="text-xs text-blue-600 hover:text-blue-900 font-medium">Update</button>
                      </form>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData); }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="points" />
                        <input 
                          type="number" 
                          name="points" 
                          defaultValue={u.points} 
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-20 focus:ring-2 focus:ring-blue-500"
                        />
                        <button type="submit" className="text-xs text-blue-600 hover:text-blue-900 font-medium">Update</button>
                      </form>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData); }} className="flex flex-col gap-1">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="role" />
                        <select 
                          name="role" 
                          defaultValue={u.role} 
                          className="text-sm border border-gray-300 rounded px-2 py-1 w-24 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button type="submit" className="text-xs text-blue-600 hover:text-blue-900 font-medium">Update</button>
                      </form>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${u.banned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                        {u.banned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <form action={async (formData) => { "use server"; await updateUserSettings(formData); }} className="inline">
                        <input type="hidden" name="user_id" value={u.id} />
                        <input type="hidden" name="action" value="ban" />
                        <input type="hidden" name="banned" value={String(u.banned)} />
                        <button type="submit" className={`px-3 py-1 rounded text-xs font-medium ${u.banned ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
                          {u.banned ? 'Unban' : 'Ban'}
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
    </div>
  )
}
