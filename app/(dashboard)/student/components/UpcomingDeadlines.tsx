'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/supabase/types'

interface TaskWithTimeLeft extends Task {
  timeLeft: string
  isOverdue: boolean
}

export default function UpcomingDeadlines() {
  const [upcomingTasks, setUpcomingTasks] = useState<TaskWithTimeLeft[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadUpcomingDeadlines()
    
    // Update time left every minute
    const interval = setInterval(() => {
      updateTimeLeft()
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  const loadUpcomingDeadlines = async () => {
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

      // Get tasks with upcoming deadlines (within next 7 days or overdue)
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          task_submissions!left (
            id,
            user_id,
            status
          )
        `)
        .eq('section_id', userData.section_id)
        .eq('is_published', true)
        .not('due_date', 'is', null)
        .lte('due_date', sevenDaysFromNow.toISOString())
        .order('due_date', { ascending: true })

      if (!tasks) return

      // Filter out tasks that are already submitted
      const pendingTasks = tasks.filter(task => {
        const userSubmission = task.task_submissions?.find(
          (submission: any) => submission.user_id === user.id && submission.status === 'submitted'
        )
        return !userSubmission
      })

      const tasksWithTimeLeft = pendingTasks.map(task => ({
        ...task,
        ...calculateTimeLeft(task.due_date!)
      }))

      setUpcomingTasks(tasksWithTimeLeft)
    } catch (error) {
      console.error('Error loading upcoming deadlines:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTimeLeft = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const timeDiff = due.getTime() - now.getTime()
    
    if (timeDiff < 0) {
      const overdueDiff = Math.abs(timeDiff)
      const days = Math.floor(overdueDiff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      return {
        timeLeft: days > 0 ? `${days} days overdue` : `${hours} hours overdue`,
        isOverdue: true
      }
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    let timeLeft = ''
    if (days > 0) {
      timeLeft = `${days} day${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      timeLeft = `${hours} hour${hours !== 1 ? 's' : ''}`
    } else {
      timeLeft = `${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
    
    return {
      timeLeft,
      isOverdue: false
    }
  }

  const updateTimeLeft = () => {
    setUpcomingTasks(prev => 
      prev.map(task => ({
        ...task,
        ...calculateTimeLeft(task.due_date!)
      }))
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Upcoming Deadlines</h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center">
          <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Upcoming Deadlines
        </h3>
      </div>
      
      <div className="p-6">
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-12 h-12 mx-auto mb-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-600 font-medium">All caught up!</p>
            <p className="text-sm text-gray-500">No upcoming deadlines in the next 7 days.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div
                key={task.id}
                className={`p-3 rounded-lg border-l-4 ${
                  task.isOverdue
                    ? 'border-red-500 bg-red-50'
                    : task.timeLeft.includes('hour') || task.timeLeft.includes('minute')
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-yellow-500 bg-yellow-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm leading-5">
                      {task.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Due: {formatDate(task.due_date!)}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        task.isOverdue
                          ? 'bg-red-100 text-red-800'
                          : task.timeLeft.includes('hour') || task.timeLeft.includes('minute')
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {task.timeLeft}
                    </span>
                    <div className="flex items-center mt-1">
                      <span className={`w-2 h-2 rounded-full mr-1 ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}></span>
                      <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}



