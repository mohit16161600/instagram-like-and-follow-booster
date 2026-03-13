import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Coins, User, LogOut, LayoutDashboard, PlusCircle, ListTodo } from 'lucide-react'
import { redirect } from 'next/navigation'

async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch points
  const { data: userData } = await supabase
    .from('users')
    .select('points, role')
    .eq('id', user.id)
    .single()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center gap-2">
               <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">InstaExchange</span>
            </Link>
            <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <LayoutDashboard className="w-4 h-4 mr-2"/> Dashboard
              </Link>
              <Link href="/tasks-feed" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <ListTodo className="w-4 h-4 mr-2"/> Earn Points
              </Link>
              <Link href="/create-task" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                <PlusCircle className="w-4 h-4 mr-2"/> Create Task
              </Link>
              {userData?.role === 'admin' && (
                <Link href="/admin" className="border-transparent text-red-500 hover:border-red-300 hover:text-red-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold border border-yellow-200">
               <Coins className="w-4 h-4 mr-1.5 text-yellow-600" />
               {userData?.points || 0} pts
            </div>
            <Link href="/profile" className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100">
              <User className="h-5 w-5" />
            </Link>
            <form action={async () => {
              'use server';
              const supabase = await createClient();
              await supabase.auth.signOut();
              redirect('/login');
            }}>
              <button type="submit" className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
