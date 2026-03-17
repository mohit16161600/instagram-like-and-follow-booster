import { createClient } from '@/utils/supabase/server'
import { updateProfile } from './actions'
import { Link as LinkIcon, Save } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-slate-950">Profile settings</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Keep your Instagram details accurate so your tasks are easier to complete and your profile stays consistent across the app.
        </p>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-slate-200 bg-sky-50 px-6 py-8 md:border-b-0 md:border-r">
            <h3 className="text-xl font-semibold leading-6 text-slate-950">Profile details</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Provide your Instagram details so others can engage with your profile.
            </p>
            <div className="mt-6 rounded-3xl border border-sky-200 bg-white p-5">
              <p className="text-sm font-semibold text-slate-950">Helpful tip</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Use the exact username and direct profile URL from Instagram to reduce task failures.
              </p>
            </div>
          </div>
          <div className="px-6 py-8">
            <form
              action={async (formData) => {
                'use server'
                await updateProfile(formData)
              }}
            >
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-6">
                  <label htmlFor="instagram_username" className="block text-sm font-medium text-slate-800">
                    Instagram Username
                  </label>
                  <div className="mt-2 flex rounded-2xl shadow-sm">
                    <span className="inline-flex items-center rounded-l-2xl border border-r-0 border-slate-300 bg-slate-50 px-4 text-sm text-slate-500">
                      @
                    </span>
                    <input
                      type="text"
                      name="instagram_username"
                      id="instagram_username"
                      defaultValue={profile?.instagram_username || ''}
                      autoComplete="username"
                      className="block w-full min-w-0 flex-1 rounded-none rounded-r-2xl border border-slate-300 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      placeholder="username"
                      required
                    />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-6">
                  <label htmlFor="profile_link" className="block text-sm font-medium text-slate-800">
                    Instagram Profile Link
                  </label>
                  <div className="mt-2 relative rounded-2xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="url"
                      name="profile_link"
                      id="profile_link"
                      defaultValue={profile?.profile_link || ''}
                      className="block w-full rounded-2xl border border-slate-300 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                      placeholder="https://instagram.com/username"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Save className="mr-2 h-4 w-4" />
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
