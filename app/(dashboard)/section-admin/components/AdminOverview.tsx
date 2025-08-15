'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface AdminStats {
  totalStudents: number
  activeTasks: number
  pendingSubmissions: number
  completionRate: number
  totalRoutines: number
  upcomingDeadlines: number
}

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    activeTasks: 0,
    pendingSubmissions: 0,
    completionRate: 0,
    totalRoutines: 0,
    upcomingDeadlines: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAdminStats()
  }, [])

  const loadAdminStats = async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get admin's section
      const { data: adminData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', user.id)
        .single()

      if (!adminData?.section_id) return

      // Get total students in section
      const { data: students } = await supabase
        .from('users')
        .select('id')
        .eq('section_id', adminData.section_id)
        .eq('role', 'user')
        .eq('is_active', true)

      // Get active tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          due_date,
          task_submissions (
            id,
            user_id,
            status
          )
        `)
        .eq('section_id', adminData.section_id)
        .eq('is_published', true)

      // Get routines
      const { data: routines } = await supabase
        .from('routines')
        .select('id')
        .eq('section_id', adminData.section_id)
        .eq('is_active', true)

      const totalStudents = students?.length || 0
      const activeTasks = tasks?.length || 0
      const totalRoutines = routines?.length || 0
      
      // Calculate pending submissions and completion rate
      let pendingSubmissions = 0
      let totalExpectedSubmissions = 0
      let completedSubmissions = 0
      let upcomingDeadlines = 0

      const now = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(now.getDate() + 7)

      tasks?.forEach(task => {
        // Count upcoming deadlines
        if (task.due_date && new Date(task.due_date) <= nextWeek && new Date(task.due_date) >= now) {
          upcomingDeadlines++
        }

        // Calculate submission stats
        const submittedUsers = new Set()
        task.task_submissions?.forEach((submission: any) => {
          if (submission.status === 'submitted') {
            submittedUsers.add(submission.user_id)
            completedSubmissions++
          }
        })

        totalExpectedSubmissions += totalStudents
        pendingSubmissions += totalStudents - submittedUsers.size
      })

      const completionRate = totalExpectedSubmissions > 0 
        ? Math.round((completedSubmissions / totalExpectedSubmissions) * 100)
        : 0

      setStats({
        totalStudents,
        activeTasks,
        pendingSubmissions,
        completionRate,
        totalRoutines,
        upcomingDeadlines
      })
    } catch (error) {
      console.error('Error loading admin stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: '👥',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      change: null
    },
    {
      title: 'Active Tasks',
      value: stats.activeTasks,
      icon: '📝',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      change: null
    },
    {
      title: 'Pending Submissions',
      value: stats.pendingSubmissions,
      icon: '⏳',
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      change: null
    },
    {
      title: 'Completion Rate',
      value: `${stats.completionRate}%`,
      icon: '📊',
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      change: stats.completionRate >= 80 ? '+' : stats.completionRate >= 60 ? '=' : '-'
    },
    {
      title: 'Class Routines',
      value: stats.totalRoutines,
      icon: '📅',
      color: 'bg-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      change: null
    },
    {
      title: 'Upcoming Deadlines',
      value: stats.upcomingDeadlines,
      icon: '🚨',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      change: null
    }
  ]

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
        <div key={index} className={`${card.bgColor} rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}>
          <div className="flex items-center">
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl shadow-sm`}>
              {card.icon}
            </div>
            <div className="ml-4 flex-1">
              <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                {card.title}
              </p>
              <div className="flex items-center">
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
                {card.change && (
                  <span className={`ml-2 text-sm font-medium ${
                    card.change === '+' ? 'text-green-600' :
                    card.change === '-' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {card.change === '+' ? '↗' : card.change === '-' ? '↘' : '→'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



