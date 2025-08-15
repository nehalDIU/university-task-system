"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Home, CheckSquare, Calendar, User, Settings, LogOut, Menu, X, Bell, Users, Crown } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signout } from "@/lib/actions"
import BottomNavigation from "./bottom-navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
  profile: any
}

const getNavigation = (profile: any) => {
  const baseNavigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "My Tasks", href: "/tasks", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  // Add section admin link if user is section admin or super admin
  if (profile?.role === "section_admin" || profile?.role === "super_admin") {
    baseNavigation.splice(3, 0, {
      name: "Section Admin",
      href: `/sections/${profile?.section_id}/dashboard`,
      icon: Users,
    })
  }

  // Add super admin link if user is super admin
  if (profile?.role === "super_admin") {
    baseNavigation.splice(-2, 0, {
      name: "Super Admin",
      href: "/super-admin/dashboard",
      icon: Crown,
    })
  }

  return baseNavigation
}

export default function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const navigation = getNavigation(profile)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent profile={profile} pathname={pathname} navigation={navigation} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col min-h-0 bg-white border-r border-gray-200">
          <SidebarContent profile={profile} pathname={pathname} navigation={navigation} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <button type="button" className="text-gray-500 hover:text-gray-600" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">NestTask</h1>
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>

        {/* Bottom navigation for mobile */}
        <BottomNavigation />
      </div>
    </div>
  )
}

function SidebarContent({ profile, pathname, navigation }: { profile: any; pathname: string; navigation: any[] }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-6">
        <h1 className="text-2xl font-bold text-blue-600">NestTask</h1>
      </div>

      {/* Profile section */}
      <div className="px-4 pb-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white">{profile?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.name}</p>
            <p className="text-xs text-gray-500 truncate">{profile?.role?.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-4 py-4">
        <form action={signout}>
          <Button variant="ghost" className="w-full justify-start text-gray-600 hover:text-gray-900">
            <LogOut className="mr-3 h-5 w-5" />
            Sign Out
          </Button>
        </form>
      </div>
    </>
  )
}
