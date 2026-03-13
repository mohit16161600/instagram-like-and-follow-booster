export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
        <div className="text-center">
          <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
            InstaExchange
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Earn points and get engagement
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
