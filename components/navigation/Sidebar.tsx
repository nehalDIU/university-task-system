'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface SidebarProps {
  user: User
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const userRole = user.user_metadata?.role || 'student'

  const navigationItems = {
    student: [
      { name: 'Dashboard', href: '/student', icon: '📊' },
      { name: 'Tasks', href: '/student/tasks', icon: '📝' },
      { name: 'Calendar', href: '/student/calendar', icon: '📅' },
      { name: 'Profile', href: '/student/profile', icon: '👤' },
    ],
    'section-admin': [
      { name: 'Dashboard', href: '/section-admin', icon: '📊' },
      { name: 'Task Management', href: '/section-admin/tasks', icon: '📝' },
      { name: 'Schedule', href: '/section-admin/schedule', icon: '📅' },
      { name: 'Students', href: '/section-admin/students', icon: '👥' },
    ],
    'super-admin': [
      { name: 'Dashboard', href: '/super-admin', icon: '📊' },
      { name: 'Users', href: '/super-admin/users', icon: '👥' },
      { name: 'Departments', href: '/super-admin/departments', icon: '🏢' },
      { name: 'Audit Logs', href: '/super-admin/audit', icon: '📋' },
    ],
  }

  const items = navigationItems[userRole as keyof typeof navigationItems] || navigationItems.student

  const handleSignOut = async () => {
    const supabase = createBrowserClient()
    await supabase.auth.signOut()
  }

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:block hidden">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-center h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">University Tasks</h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {items.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === item.href
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0)}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}



