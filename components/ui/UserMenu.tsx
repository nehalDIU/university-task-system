'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, Moon, Sun, Monitor, ChevronDown, UserCircle, Bell, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface UserProfile {
  name: string
  email: string
  role: string
  avatar?: string
  department?: string
  section?: string
}

interface UserMenuProps {
  user: UserProfile
  onSignOut?: () => void
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void
  currentTheme?: 'light' | 'dark' | 'system'
  className?: string
}

export function UserMenu({ 
  user, 
  onSignOut, 
  onThemeChange, 
  currentTheme = 'system',
  className 
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(currentTheme)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    setSelectedTheme(theme)
    onThemeChange?.(theme)
  }

  const handleSignOut = () => {
    setIsOpen(false)
    onSignOut?.()
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const menuItems = [
    {
      label: 'Profile',
      icon: <UserCircle className="w-4 h-4" />,
      href: '/profile',
      description: 'Manage your account'
    },
    {
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      href: '/settings',
      description: 'Preferences and configuration'
    },
    {
      label: 'Notifications',
      icon: <Bell className="w-4 h-4" />,
      href: '/notifications',
      description: 'Manage notifications'
    },
    {
      label: 'Help & Support',
      icon: <HelpCircle className="w-4 h-4" />,
      href: '/help',
      description: 'Get help and support'
    }
  ]

  const themeOptions = [
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> }
  ]

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-2 rounded-xl transition-all duration-200",
          "hover:bg-gray-100 dark:hover:bg-gray-700",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          isOpen && "bg-gray-100 dark:bg-gray-700"
        )}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
              {getInitials(user.name)}
            </div>
          )}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
        </div>
        
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-32">
            {user.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-32 capitalize">
            {user.role}
          </div>
        </div>
        
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 hidden sm:block",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            "absolute right-0 mt-2 w-72 z-50",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "rounded-xl shadow-professional-lg backdrop-blur-sm",
            "overflow-hidden",
            "animate-scale-in"
          )}
        >
          {/* User Info Header */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {getInitials(user.name)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 capitalize">
                    {user.role}
                  </span>
                  {user.department && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {user.department}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                onClick={() => setIsOpen(false)}
              >
                <div className="text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {item.description}
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Theme Selector */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Appearance
            </div>
            <div className="space-y-1">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value as 'light' | 'dark' | 'system')}
                  className={cn(
                    "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                    selectedTheme === option.value
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  )}
                >
                  <div className={cn(
                    selectedTheme === option.value
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  )}>
                    {option.icon}
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                  {selectedTheme === option.value && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors group"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
