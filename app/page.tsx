import Link from 'next/link'
import { Button } from '@/components/ui/Button'

type SearchParams = {
  setup?: string
}

type HomePageProps = {
  searchParams: SearchParams
}

export default function HomePage({ searchParams }: HomePageProps) {
  const isSetupRequired = searchParams.setup === 'required'
  const hasSupabaseConfig = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Setup Required Banner */}
        {(isSetupRequired || !hasSupabaseConfig) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-lg font-medium text-yellow-800">
                  ⚙️ Setup Required
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>The application requires Supabase configuration to function properly.</p>
                  <div className="mt-3 space-y-2">
                    <p className="font-medium">Quick Setup Steps:</p>
                    <ol className="list-decimal list-inside space-y-1 text-xs">
                      <li>Create <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in project root</li>
                      <li>Add your Supabase URL: <code className="bg-yellow-100 px-1 rounded">https://vxdqsigpsxauvaalsrni.supabase.co</code></li>
                      <li>Get anon key from Supabase Dashboard → Settings → API</li>
                      <li>See <code className="bg-yellow-100 px-1 rounded">SETUP_INSTRUCTIONS.md</code> for complete guide</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            NestTask University System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A comprehensive task management system designed for universities to streamline 
            academic workflows and enhance productivity across all departments.
          </p>
          
          {hasSupabaseConfig ? (
            <div className="space-x-4">
              <Link href="/login">
                <Button size="lg" className="px-8 py-3">
                  Get Started
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" size="lg" className="px-8 py-3">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-x-4">
              <Button disabled size="lg" className="px-8 py-3">
                Setup Required
              </Button>
              <Button variant="outline" disabled size="lg" className="px-8 py-3">
                Configure Supabase
              </Button>
            </div>
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Students</h3>
            <p className="text-gray-600">
              Track assignments, manage deadlines, and stay organized with your academic tasks.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Section Admins</h3>
            <p className="text-gray-600">
              Manage class schedules, assign tasks, and monitor student progress effectively.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">For Super Admins</h3>
            <p className="text-gray-600">
              Oversee entire departments, manage users, and maintain system-wide operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
