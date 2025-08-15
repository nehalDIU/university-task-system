'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface SystemStats {
  totalUsers: number
  activeUsers: number
  departments: number
  sections: number
  totalTasks: number
  activeTasks: number
  completedSubmissions: number
  pendingApprovals: number
  systemHealth: number
}

export default function SystemOverview() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    departments: 0,
    sections: 0,
    totalTasks: 0,
    activeTasks: 0,
    completedSubmissions: 0,
    pendingApprovals: 0,
    systemHealth: 100
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSystemStats()
    
    // Refresh stats every 5 minutes
    const interval = setInterval(loadSystemStats, 300000)
    
    return () => clearInterval(interval)
  }, [])

  const loadSystemStats = async () => {
    try {
      const supabase = createBrowserClient()

      // Get user statistics
      const { data: users } = await supabase
        .from('users')
        .select('id, is_active, role, created_at')

      const { data: departments } = await supabase
        .from('departments')
        .select('id')

      const { data: sections } = await supabase
        .from('sections')
        .select('id')

      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, is_published, created_at')

      const { data: submissions } = await supabase
        .from('task_submissions')
        .select('id, status')

      // Calculate user stats
      const totalUsers = users?.length || 0
      const activeUsers = users?.filter(user => user.is_active).length || 0
      
      // Section admins awaiting approval
      const pendingApprovals = users?.filter(user => 
        user.role === 'section_admin' && !user.is_active
      ).length || 0

      // Task stats
      const totalTasks = tasks?.length || 0
      const activeTasks = tasks?.filter(task => task.is_published).length || 0

      // Submission stats
      const completedSubmissions = submissions?.filter(sub => 
        sub.status === 'submitted'
      ).length || 0

      // Calculate system health (mock calculation)
      const baseHealth = 100
      const userActivity = activeUsers / Math.max(totalUsers, 1) * 20
      const taskActivity = activeTasks / Math.max(totalTasks, 1) * 20
      const submissionRate = completedSubmissions / Math.max(totalTasks * 10, 1) * 20 // Assuming 10 users per task average
      const systemHealth = Math.min(100, Math.max(70, baseHealth - (100 - userActivity - taskActivity - submissionRate)))

      setStats({
        totalUsers,
        activeUsers,
        departments: departments?.length || 0,
        sections: sections?.length || 0,
        totalTasks,
        activeTasks,
        completedSubmissions,
        pendingApprovals,
        systemHealth: Math.round(systemHealth)
      })
    } catch (error) {
      console.error('Error loading system stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} active`,
      icon: '👥',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      trend: stats.activeUsers / Math.max(stats.totalUsers, 1) > 0.8 ? 'up' : 'down'
    },
    {
      title: 'Departments',
      value: stats.departments,
      subtitle: `${stats.sections} sections`,
      icon: '🏢',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      trend: 'stable'
    },
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      subtitle: `${stats.totalTasks} total`,
      icon: '📝',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      trend: stats.activeTasks / Math.max(stats.totalTasks, 1) > 0.7 ? 'up' : 'down'
    },
    {
      title: 'Submissions',
      value: stats.completedSubmissions,
      subtitle: 'Completed',
      icon: '✅',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      trend: 'up'
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingApprovals,
      subtitle: 'Section admins',
      icon: '⏳',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      trend: stats.pendingApprovals > 0 ? 'attention' : 'stable'
    },
    {
      title: 'System Health',
      value: `${stats.systemHealth}%`,
      subtitle: stats.systemHealth >= 90 ? 'Excellent' : stats.systemHealth >= 75 ? 'Good' : 'Needs attention',
      icon: '💚',
      color: stats.systemHealth >= 90 ? 'bg-green-500' : stats.systemHealth >= 75 ? 'bg-yellow-500' : 'bg-red-500',
      bgColor: stats.systemHealth >= 90 ? 'bg-green-50' : stats.systemHealth >= 75 ? 'bg-yellow-50' : 'bg-red-50',
      textColor: stats.systemHealth >= 90 ? 'text-green-700' : stats.systemHealth >= 75 ? 'text-yellow-700' : 'text-red-700',
      trend: stats.systemHealth >= 90 ? 'up' : stats.systemHealth >= 75 ? 'stable' : 'down'
    }
  ]

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <span className="text-green-500">↗</span>
      case 'down':
        return <span className="text-red-500">↘</span>
      case 'attention':
        return <span className="text-orange-500">⚠</span>
      default:
        return <span className="text-gray-500">→</span>
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-6 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 cursor-pointer`}>
          <div className="flex items-center">
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl shadow-sm`}>
              {card.icon}
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                {card.title}
              </p>
              <div className="flex items-center justify-between">
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
                {getTrendIcon(card.trend)}
              </div>
              <p className={`text-xs ${card.textColor} opacity-70 mt-1`}>
                {card.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



