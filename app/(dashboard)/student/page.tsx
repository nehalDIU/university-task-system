'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Metadata } from 'next'
import { ListTodo, CheckCircle2, Clock, AlertCircle, Sparkles, CalendarDays, User } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { isOverdue, formatUpcomingDueDate, cn } from '@/lib/utils'
import { TaskList } from './components/EnhancedTaskList'
import { TaskCategories, type TaskCategory } from './components/TaskCategories'
import { Loader } from '@/components/ui/Loader'
import type { Task, TaskSubmission, User as SupabaseUser } from '@/lib/supabase/types'

// Enhanced types
interface TaskWithSubmission extends Task {
  task_submissions?: TaskSubmission[]
  userSubmission?: TaskSubmission
  userStatus: 'pending' | 'submitted' | 'overdue'
}

interface UserWithDetails extends SupabaseUser {
  departments?: { name: string; code: string }
  batches?: { name: string }
  sections?: { name: string }
}

interface UpcomingTaskDisplayData extends TaskWithSubmission {
  formattedDueDate: string
}

type StatFilter = 'all' | 'overdue' | 'pending' | 'submitted'

export default function StudentDashboard() {
  // State management
  const [user, setUser] = useState<UserWithDetails | null>(null)
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null)
  const [statFilter, setStatFilter] = useState<StatFilter>('all')
  const [currentUpcomingTaskIndex, setCurrentUpcomingTaskIndex] = useState(0)
  const [showGreeting, setShowGreeting] = useState(true)
  
  const supabase = createBrowserClient()
  const MAX_UPCOMING_TASKS_TO_SHOW = 3

  // Initialize and load data
  useEffect(() => {
    loadData()
    
    // Greeting animation
    const greetingTimer = setTimeout(() => {
      setShowGreeting(false)
    }, 2000)

    // Real-time subscriptions
    const tasksChannel = supabase
      .channel('tasks_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, loadTasks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_submissions' }, loadTasks)
      .subscribe()

    return () => {
      clearTimeout(greetingTimer)
      supabase.removeChannel(tasksChannel)
    }
  }, [])

  // Load user and tasks data
  const loadData = async () => {
    try {
      await Promise.all([loadUser(), loadTasks()])
    } finally {
      setIsLoading(false)
    }
  }

  const loadUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

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
        setUser(userData)
      }
    } catch (error) {
      console.error('Error loading user:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      // Get user's section
      const { data: userData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', authUser.id)
        .single()

      if (!userData?.section_id) return

      // Load published tasks with submissions
      const { data: tasksData } = await supabase
        .from('tasks')
        .select(`
          *,
          task_submissions (*)
        `)
        .eq('section_id', userData.section_id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (!tasksData) return

      const now = new Date().toISOString()
      const tasksWithStatus = tasksData.map(task => {
        const userSubmission = task.task_submissions?.find(
          (submission: any) => submission.user_id === authUser.id
        )
        
        let userStatus: 'pending' | 'submitted' | 'overdue' = 'pending'
        if (userSubmission && userSubmission.status === 'submitted') {
          userStatus = 'submitted'
        } else if (task.due_date && task.due_date < now && !userSubmission) {
          userStatus = 'overdue'
        }

        return {
          ...task,
          userSubmission,
          userStatus
        }
      })

      setTasks(tasksWithStatus)
    } catch (error) {
      console.error('Error loading tasks:', error)
    }
  }

  // Compute task statistics
  const taskStats = useMemo(() => {
    const validTasks = tasks || []
    return {
      total: validTasks.length,
      pending: validTasks.filter(t => t.userStatus === 'pending').length,
      submitted: validTasks.filter(t => t.userStatus === 'submitted').length,
      overdue: validTasks.filter(t => t.userStatus === 'overdue').length
    }
  }, [tasks])

  // Pre-calculate upcoming tasks with formatted due dates
  const upcomingTasksData: UpcomingTaskDisplayData[] = useMemo(() => {
    if (!tasks || tasks.length === 0) return []
    return tasks
      .filter(task => task.userStatus !== 'submitted' && task.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, MAX_UPCOMING_TASKS_TO_SHOW)
      .map(task => ({
        ...task,
        formattedDueDate: formatUpcomingDueDate(task.due_date!)
      }))
  }, [tasks])

  // Cycle through upcoming tasks
  useEffect(() => {
    if (upcomingTasksData.length <= 1) {
      setCurrentUpcomingTaskIndex(0)
      return
    }

    const timer = setInterval(() => {
      setCurrentUpcomingTaskIndex(prev => (prev + 1) % upcomingTasksData.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [upcomingTasksData.length])

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const validTasks = tasks || []
    return validTasks.reduce((acc: Record<TaskCategory, number>, task) => {
      const category = (task.category as TaskCategory) || 'others'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<TaskCategory, number>)
  }, [tasks])

  // Filter tasks based on selected filters
  const getFilteredTasks = () => {
    let filtered = tasks

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(task => task.category === selectedCategory)
    }

    // Apply status filter
    switch (statFilter) {
      case 'overdue':
        return filtered.filter(task => task.userStatus === 'overdue')
      case 'pending':
        return filtered.filter(task => task.userStatus === 'pending')
      case 'submitted':
        return filtered.filter(task => task.userStatus === 'submitted')
      default:
        return filtered
    }
  }

  const getStatTitle = () => {
    switch (statFilter) {
      case 'overdue':
        return 'Overdue Tasks'
      case 'pending':
        return 'Pending Tasks'
      case 'submitted':
        return 'Submitted Tasks'
      default:
        return selectedCategory 
          ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Tasks`
          : 'All Tasks'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white overflow-hidden relative">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
          <div className="relative z-10">
            <div
              className={cn(
                "transition-all duration-1000 ease-in-out",
                showGreeting ? "opacity-100 max-h-24" : "opacity-0 max-h-0 overflow-hidden"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300 flex-shrink-0" />
                <h1 className="text-2xl sm:text-3xl font-bold">
                  Welcome back, {user?.name || 'Student'}!
                </h1>
              </div>
              <p className="text-blue-100 pl-10 sm:pl-11">
                You have {taskStats.total} total tasks to manage.
        </p>
      </div>

            {/* Upcoming Task Display */}
            <div className={cn(
              "pl-10 sm:pl-11 min-h-[4rem] relative transition-all duration-1000 ease-in-out",
              showGreeting ? "mt-3" : "mt-0"
            )}>
              {upcomingTasksData.length > 0 ? (
                upcomingTasksData.map((task, index) => (
                  <div
                    key={task.id}
                    className={cn(
                      "absolute w-full transition-opacity duration-700 ease-in-out flex flex-col gap-2",
                      index === currentUpcomingTaskIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <p className="text-base font-medium text-blue-50 truncate" title={task.title}>
                      📝 {task.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-blue-200 flex-shrink-0" />
                      <p className="text-sm text-blue-200 font-light">
                        {task.formattedDueDate}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-300" />
                  <p className="text-sm text-blue-100">
                    All caught up! No upcoming deadlines.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Task Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => setStatFilter('all')}
            className={cn(
              "rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105",
              statFilter === 'all' 
                ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-gray-700" 
                : "bg-white dark:bg-gray-800"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.total}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
          </button>

          <button
            onClick={() => setStatFilter('overdue')}
            className={cn(
              "rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105",
              statFilter === 'overdue' 
                ? "ring-2 ring-red-500 dark:ring-red-400 bg-red-50 dark:bg-gray-700" 
                : "bg-white dark:bg-gray-800"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.overdue}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
          </button>

          <button
            onClick={() => setStatFilter('pending')}
            className={cn(
              "rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105",
              statFilter === 'pending' 
                ? "ring-2 ring-yellow-500 dark:ring-yellow-400 bg-yellow-50 dark:bg-gray-700" 
                : "bg-white dark:bg-gray-800"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.pending}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          </button>

          <button
            onClick={() => setStatFilter('submitted')}
            className={cn(
              "rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105",
              statFilter === 'submitted' 
                ? "ring-2 ring-green-500 dark:ring-green-400 bg-green-50 dark:bg-gray-700" 
                : "bg-white dark:bg-gray-800"
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {taskStats.submitted}
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
          </button>
        </div>

        {/* Task Categories */}
        <TaskCategories
          onCategorySelect={(category) => {
            setSelectedCategory(category)
            setStatFilter('all')
          }}
          selectedCategory={selectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Task List */}
        <main id="task-list" role="main" aria-label="Academic tasks and assignments">
          {(statFilter !== 'all' || selectedCategory) && (
            <header className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {getStatTitle()}
              </h2>
              <button
                onClick={() => {
                  setStatFilter('all')
                  setSelectedCategory(null)
                }}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Clear all filters and show all tasks"
              >
                Clear filters
              </button>
            </header>
          )}
          
          <TaskList 
            tasks={getFilteredTasks()} 
            onTaskUpdate={loadTasks}
          />
        </main>
      </div>
    </div>
  )
}