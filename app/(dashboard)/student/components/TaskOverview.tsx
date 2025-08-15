'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Task, TaskSubmission } from '@/lib/supabase/types'

interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}

export default function TaskOverview() {
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTaskStats = async () => {
      try {
        const supabase = createBrowserClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) return

        // Get user's section
        const { data: userData } = await supabase
          .from('users')
          .select('section_id')
          .eq('id', user.id)
          .single()

        if (!userData?.section_id) return

        // Get published tasks for the section
        const { data: tasks } = await supabase
          .from('tasks')
          .select(`
            id,
            status,
            due_date,
            task_submissions (
              id,
              status,
              user_id
            )
          `)
          .eq('section_id', userData.section_id)
          .eq('is_published', true)

        if (!tasks) return

        const now = new Date().toISOString()
        const userTasks = tasks.map(task => {
          const userSubmission = task.task_submissions?.find(
            (submission: any) => submission.user_id === user.id
          )
          
          let status = 'pending'
          if (userSubmission) {
            status = userSubmission.status === 'submitted' ? 'completed' : 'inProgress'
          } else if (task.due_date && task.due_date < now) {
            status = 'overdue'
          }

          return { ...task, userStatus: status }
        })

        const taskStats = userTasks.reduce((acc, task) => {
          acc.total++
          switch (task.userStatus) {
            case 'pending':
              acc.pending++
              break
            case 'inProgress':
              acc.inProgress++
              break
            case 'completed':
              acc.completed++
              break
            case 'overdue':
              acc.overdue++
              break
          }
          return acc
        }, {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          overdue: 0
        })

        setStats(taskStats)
      } catch (error) {
        console.error('Error loading task stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTaskStats()
  }, [])

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: '📝',
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: '⏳',
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: '✅',
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      icon: '🚨',
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    }
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div key={index} className={`${card.bgColor} rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow`}>
          <div className="flex items-center">
            <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl`}>
              {card.icon}
            </div>
            <div className="ml-4">
              <p className={`text-sm font-medium ${card.textColor} opacity-80`}>
                {card.title}
              </p>
              <p className={`text-2xl font-bold ${card.textColor}`}>
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}



