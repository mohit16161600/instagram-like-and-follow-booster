import { createClient } from '@/utils/supabase/server'
import { updateProfile } from './actions'
import { Instagram, Link as LinkIcon, Save } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = { instagram_username: '', profile_link: '' }
  if (user) {
    const { data } = await supabase
      .from('users')
      .select('instagram_username, profile_link')
      .eq('id', user.id)
      .single()
    if (data) {
      profile = data
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 border border-gray-100">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Profile Settings</h3>
            <p className="mt-1 text-sm text-gray-500">
              Provide your Instagram details so others can engage with your profile.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form action={async (formData) => {
              'use server';
              await updateProfile(formData);
            }}>
              <div className="grid grid-cols-6 gap-6">
                
                <div className="col-span-6 sm:col-span-6">
                  <label htmlFor="instagram_username" className="block text-sm font-medium text-gray-700">
                    Instagram Username
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      @
                    </span>
                    <input
                      type="text"
                      name="instagram_username"
                      id="instagram_username"
                      defaultValue={profile?.instagram_username || ''}
                      autoComplete="username"
                      className="flex-1 focus:ring-blue-500 focus:border-blue-500 block w-full min-w-0 rounded-none rounded-r-md sm:text-sm border-gray-300 px-3 py-2 border"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label htmlFor="profile_link" className="block text-sm font-medium text-gray-700">
                    Instagram Profile Link
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      name="profile_link"
                      id="profile_link"
                      defaultValue={profile?.profile_link || ''}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border px-3"
                      placeholder="https://instagram.com/username"
                      required
                    />
                  </div>
                </div>

              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
