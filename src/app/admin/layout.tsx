import Header from '@/components/Header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="mb-6 px-4 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-4">Admin Dashboard</h1>
        </div>
        {children}
      </main>
    </div>
  )
}
