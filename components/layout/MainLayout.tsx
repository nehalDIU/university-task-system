'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomNavigation from '@/app/(dashboard)/student/components/bottom-navigation'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface MainLayoutProps {
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

export function MainLayout({
  children,
  title,
  subtitle,
  showSearch = true,
  showActions = true,
  className
}: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createBrowserClient()

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        
        if (!authUser) {
          router.push('/login')
          return
        }

        // Fetch user profile data
        const { data: userData } = await supabase
          .from('users')
          .select(`
            *,
            departments (name, code),
            batches (name),
            sections (name)
          `)
          .eq('id', authUser.id)
          .single()

        if (userData) {
          setUser({
            name: userData.name || authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: userData.role || 'student',
            avatar: userData.avatar_url,
            department: userData.departments?.name,
            section: userData.sections?.name
          })
        } else {
          // Fallback user data
          setUser({
            name: authUser.email?.split('@')[0] || 'User',
            email: authUser.email || '',
            role: 'student'
          })
        }
      } catch (error) {
        console.error('Error loading user:', error)
        // Set fallback user data
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
  }, [supabase, router])

  // Handle sign out
  const handleSignOut = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }, [supabase, router])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      setSidebarOpen(false)
    }

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
      
      // Close sidebar with Escape
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
          <LoadingSpinner size="lg" className="mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Loading NestTask
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Preparing your dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <ErrorBoundary>
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
            "px-4 sm:px-6 lg:px-8 py-6",
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
    </ErrorBoundary>
  )
}

export default MainLayout
