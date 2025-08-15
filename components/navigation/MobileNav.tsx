'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

interface MobileNavProps {
  user: User
}

export function MobileNav({ user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
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

  if (!isOpen) return null

  return (
    <div className="lg:hidden">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Mobile menu */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
            <h1 className="text-xl font-bold text-white">University Tasks</h1>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
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
        </div>
      </div>
    </div>
  )
}



