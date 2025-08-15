"use client"

import { Home, CheckSquare, Calendar, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/Button"

const navigation = [
  { name: "Home", href: "/", icon: Home },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Profile", href: "/profile", icon: User },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 lg:hidden shadow-professional-lg">
      {/* Safe area padding for iOS */}
      <div className="pb-safe">
        <div className="grid grid-cols-4 py-2 px-2 max-w-md mx-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href === "/calendar" && pathname.startsWith("/calendar"))

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center py-3 px-2 rounded-2xl transition-all duration-300 transform active:scale-95 group ${
                  isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
                aria-label={item.name}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full shadow-sm"></div>
                )}
                
                {/* Background highlight */}
                <div className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-b from-blue-50/80 to-blue-100/40 dark:from-blue-900/30 dark:to-blue-800/20 shadow-sm" 
                    : "group-hover:bg-gray-100/60 dark:group-hover:bg-gray-800/40"
                }`} />
                
                {/* Icon container */}
                <div className={`relative p-1 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "bg-blue-500/10 dark:bg-blue-400/20" 
                    : "group-hover:bg-gray-200/50 dark:group-hover:bg-gray-700/50"
                }`}>
                  <item.icon className={`h-6 w-6 transition-all duration-300 ${
                    isActive 
                      ? 'scale-110 text-blue-600 dark:text-blue-400' 
                      : 'group-hover:scale-105'
                  }`} />
                </div>
                
                {/* Label */}
                <span className={`text-xs mt-1 font-medium transition-all duration-300 ${
                  isActive 
                    ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                    : 'group-hover:text-gray-700 dark:group-hover:text-gray-300'
                }`}>
                  {item.name}
                </span>

                {/* Ripple effect on tap */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-2xl" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
