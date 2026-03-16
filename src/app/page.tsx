import Link from 'next/link'
import { ArrowRight, Heart, UserPlus, Zap } from 'lucide-react'

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      {/* Navbar */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              InstaExchange
            </div>
            <div className="space-x-4 flex items-center">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium">Log in</Link>
              <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition shadow-md shadow-blue-500/20">Sign Up</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 max-w-4xl mx-auto leading-tight">
            Grow your Instagram <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-600">organically.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
            Earn points by engaging with others, and spend them to get real followers and likes on your own profile. The fairest exchange platform.
          </p>
          <div className="flex justify-center flex-col sm:flex-row gap-4">
            <Link href="/register" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full text-white bg-blue-600 hover:bg-blue-700 md:text-lg transition shadow-xl shadow-blue-500/30 group">
              Start Earning Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 border border-gray-200 text-lg font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 md:text-lg transition shadow-sm">
              I already have an account
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-t border-gray-200 pt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Heart className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Earn Points</h3>
              <p className="text-gray-600">
                Like or follow other users&apos; profiles via our tasks feed to earn points. Follows give 2 points, likes give 1 point.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="w-7 h-7 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Create Tasks</h3>
              <p className="text-gray-600">
                Use your earned points to request followers or likes on your own profile. It costs 20 points per request.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Zap className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Grow Fast</h3>
              <p className="text-gray-600">
                Watch your profile grow as targeted real users engage back. Fair exchange, zero bots.
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} InstaExchange. Built for fair audience growth.</p>
        </div>
      </footer>
    </div>
  )
}
