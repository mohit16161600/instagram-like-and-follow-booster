export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[2rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/70">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-slate-950">InstaExchange</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Sign in securely and manage your Instagram engagement tasks with a cleaner flow.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
