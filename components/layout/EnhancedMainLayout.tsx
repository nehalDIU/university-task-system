'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNavigation from '@/app/(dashboard)/student/components/bottom-navigation'

interface EnhancedMainLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  showSearch?: boolean
  showActions?: boolean
  className?: string
}

interface User {
  name: string
  email: string
  role: string
  avatar?: string
  department?: string
  section?: string
}

// Simple Error Boundary Component
function SimpleErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
    </div>
  )
}

// Simple Loading Spinner
function SimpleLoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
        sizeClasses[size]
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export function EnhancedMainLayout({
  children,
  title,
  subtitle,
  showSearch = true,
  showActions = true,
  className
}: EnhancedMainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const supabase = createBrowserClient()
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          console.error('Auth error:', authError)
          router.push('/login')
          return
        }

        if (!authUser) {
          router.push('/login')
          return
        }

        // Try to fetch user profile data
        try {
          const { data: userData, error: profileError } = await supabase
            .from('users')
            .select(`
              *,
              departments (name, code),
              batches (name),
              sections (name)
            `)
            .eq('id', authUser.id)
            .single()

          if (userData && !profileError) {
            setUser({
              name: userData.name || authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: userData.role || 'student',
              avatar: userData.avatar_url,
              department: userData.departments?.name,
              section: userData.sections?.name
            })
          } else {
            // Fallback user data if profile fetch fails
            setUser({
              name: authUser.email?.split('@')[0] || 'User',
              email: authUser.email || '',
              role: 'student'
            })
          }
        } catch (profileError) {
          console.warn('Profile fetch failed, using fallback:', profileError)
          // Fallback user data
          setUser({
            name: authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: 'student'
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
        setError('Failed to load user data')
        // Set fallback user data to prevent infinite loading
        setUser({
          name: 'Student User',
          email: 'student@university.edu',
          role: 'student',
          department: 'Computer Science',
          section: 'A'
        })
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [router])

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      const supabase = createBrowserClient()
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
      // Force navigation even if signout fails
      router.push('/login')
    }
  }, [router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false)
    }

    window.addEventListener('popstate', handleRouteChange)
    return () => window.removeEventListener('popstate', handleRouteChange)
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <SimpleLoadingSpinner size="lg" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-4">
            Loading NestTask
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4 mx-auto">
            <span className="text-red-600 dark:text-red-400 font-bold text-2xl">!</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <SimpleErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
          onSignOut={handleSignOut}
        />

        {/* Main Content Area */}
        <div className={cn(
          "lg:pl-72 transition-all duration-300 ease-in-out",
          "flex flex-col min-h-screen"
        )}>
          {/* Header */}
          <Header
            title={title}
            subtitle={subtitle}
            onMenuToggle={() => setSidebarOpen(true)}
            user={user}
            onSignOut={handleSignOut}
            showSearch={showSearch}
            showActions={showActions}
          />

          {/* Page Content */}
          <main className={cn(
            "flex-1 pb-20 lg:pb-8",
            "px-4 sm:px-6 lg:px-8",
            "pt-4 sm:pt-6",
            "animate-fade-in",
            className
          )}>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Bottom Navigation (Mobile) */}
          <BottomNavigation />
        </div>

        {/* Global Styles for Animations */}
        <style jsx global>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-fade-in {
            animation: fadeIn 0.5s ease-out;
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-scale-in {
            animation: scaleIn 0.2s ease-out;
          }

          /* Smooth scrollbar */
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }

          ::-webkit-scrollbar-track {
            background: transparent;
          }

          ::-webkit-scrollbar-thumb {
            background: rgba(156, 163, 175, 0.5);
            border-radius: 3px;
          }

          ::-webkit-scrollbar-thumb:hover {
            background: rgba(156, 163, 175, 0.7);
          }

          .dark ::-webkit-scrollbar-thumb {
            background: rgba(75, 85, 99, 0.5);
          }

          .dark ::-webkit-scrollbar-thumb:hover {
            background: rgba(75, 85, 99, 0.7);
          }
        `}</style>
      </div>
    </SimpleErrorBoundary>
  )
}

export default EnhancedMainLayout
