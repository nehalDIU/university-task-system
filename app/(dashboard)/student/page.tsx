'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ListTodo, CheckCircle2, Clock, AlertCircle, Sparkles, CalendarDays } from 'lucide-react'
import { createBrowserClient } from '@/lib/supabase/client'
import { isOverdue, formatUpcomingDueDate, cn } from '@/lib/utils'
import { TaskList } from './components/EnhancedTaskList'
import TaskCategories from './components/task-categories'
import { Loader } from '@/components/ui/Loader'
import type { Task, TaskSubmission, User as SupabaseUser } from '@/lib/supabase/types'

// TaskCategory type
type TaskCategory =
  | 'presentation'
  | 'assignment'
  | 'quiz'
  | 'lab-report'
  | 'lab-final'
  | 'lab-performance'
  | 'task'
  | 'documents'
  | 'blc'
  | 'groups'
  | 'project'
  | 'midterm'
  | 'final-exam'
  | 'others'

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
  const [currentTime, setCurrentTime] = useState(new Date())
  
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
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
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
        
        {/* Welcome Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white overflow-hidden shadow-professional-lg animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-indigo-600/90 backdrop-blur-sm"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
          <div className="relative z-10">
            <div
              className={cn(
                "transition-all duration-1000 ease-in-out",
                showGreeting ? "opacity-100 max-h-[6rem]" : "opacity-0 max-h-0"
              )}
              style={{ overflow: 'hidden' }}
            >
                           <div className="flex items-start gap-3 mb-2">
               <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                 <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-300 flex-shrink-0" />
               </div>
               <div className="flex-1">
                 <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                   Welcome back, {user?.name || 'Student'}!
                 </h1>
                 {/* Mobile Greeting */}
                 <div className="sm:hidden mt-1">
                   <p className="text-blue-100/90 text-sm font-medium">
                     {(() => {
                       const hour = currentTime.getHours()
                       if (hour < 12) return 'Good morning'
                       if (hour < 17) return 'Good afternoon'
                       return 'Good evening'
                     })()} 👋
                   </p>
                 </div>
               </div>
             </div>
                             <p className="text-blue-100/90 pl-0 sm:pl-14 text-sm sm:text-base">
                 You have <span className="font-semibold text-white">{taskStats.total}</span> total tasks.
                 {user?.departments?.name && (
                   <span className="block text-xs sm:text-sm opacity-80 mt-1 font-medium">
                     {user.departments.name} • {user.batches?.name} • Section {user.sections?.name}
                   </span>
                 )}
               </p>
            </div>

            {/* Upcoming Task Display Area */}
            <div className={cn(
              "pl-12 sm:pl-14 min-h-[3.5em] relative transition-all duration-1000 ease-in-out",
              showGreeting ? "mt-4" : "mt-0"
            )}>
              {upcomingTasksData.length > 0 ? (
                upcomingTasksData.map((task, index) => (
                  <div
                    key={task.id}
                    className={cn(
                      "absolute w-full transition-opacity duration-700 ease-in-out flex flex-col gap-1.5",
                      index === currentUpcomingTaskIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm flex-shrink-0 mt-0.5">
                        <CalendarDays className="w-3 h-3 text-blue-100" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-medium text-blue-50 line-clamp-1" title={task.title}>
                          📝 {task.title}
                        </p>
                        <p className="text-xs text-blue-200/80 font-medium">
                          Due {task.formattedDueDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-green-500/20 rounded-lg backdrop-blur-sm">
                    <CheckCircle2 className="w-3 h-3 text-green-300" />
                  </div>
                  <p className="text-sm text-blue-100/80 font-medium">
                    {showGreeting ? "No upcoming tasks right now." : "You're all caught up! 🎉"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Task Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => setStatFilter('all')}
            className={cn(
              "group relative rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 transform hover:scale-105 focus:scale-105 focus-ring",
              "shadow-professional hover:shadow-professional-lg",
              statFilter === 'all' 
                ? "ring-2 ring-blue-500 dark:ring-blue-400 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20" 
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors duration-300",
                statFilter === 'all' 
                  ? "bg-blue-500 text-white shadow-lg" 
                  : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30"
              )}>
                <ListTodo className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-2xl sm:text-3xl font-bold transition-colors duration-300",
                statFilter === 'all' ? "text-blue-700 dark:text-blue-300" : "text-gray-900 dark:text-white"
              )}>
                {taskStats.total}
              </span>
            </div>
            <p className={cn(
              "text-sm font-medium transition-colors duration-300",
              statFilter === 'all' ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
            )}>
              Total Tasks
            </p>
            <div className={cn(
              "absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "bg-gradient-to-r from-blue-500/5 to-indigo-500/5"
            )} />
          </button>

          <button
            onClick={() => setStatFilter('overdue')}
            className={cn(
              "group relative rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 transform hover:scale-105 focus:scale-105 focus-ring",
              "shadow-professional hover:shadow-professional-lg",
              statFilter === 'overdue' 
                ? "ring-2 ring-red-500 dark:ring-red-400 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20" 
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors duration-300",
                statFilter === 'overdue' 
                  ? "bg-red-500 text-white shadow-lg" 
                  : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-800/30"
              )}>
                <AlertCircle className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-2xl sm:text-3xl font-bold transition-colors duration-300",
                statFilter === 'overdue' ? "text-red-700 dark:text-red-300" : "text-gray-900 dark:text-white"
              )}>
                {taskStats.overdue}
              </span>
            </div>
            <p className={cn(
              "text-sm font-medium transition-colors duration-300",
              statFilter === 'overdue' ? "text-red-600 dark:text-red-400" : "text-gray-500 dark:text-gray-400"
            )}>
              Overdue
            </p>
            <div className={cn(
              "absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "bg-gradient-to-r from-red-500/5 to-red-600/5"
            )} />
          </button>

          <button
            onClick={() => setStatFilter('pending')}
            className={cn(
              "group relative rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 transform hover:scale-105 focus:scale-105 focus-ring",
              "shadow-professional hover:shadow-professional-lg",
              statFilter === 'pending' 
                ? "ring-2 ring-indigo-500 dark:ring-indigo-400 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20" 
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors duration-300",
                statFilter === 'pending' 
                  ? "bg-indigo-500 text-white shadow-lg" 
                  : "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30"
              )}>
                <Clock className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-2xl sm:text-3xl font-bold transition-colors duration-300",
                statFilter === 'pending' ? "text-indigo-700 dark:text-indigo-300" : "text-gray-900 dark:text-white"
              )}>
                {taskStats.pending}
              </span>
            </div>
            <p className={cn(
              "text-sm font-medium transition-colors duration-300",
              statFilter === 'pending' ? "text-indigo-600 dark:text-indigo-400" : "text-gray-500 dark:text-gray-400"
            )}>
              Pending
            </p>
            <div className={cn(
              "absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "bg-gradient-to-r from-indigo-500/5 to-purple-500/5"
            )} />
          </button>

          <button
            onClick={() => setStatFilter('submitted')}
            className={cn(
              "group relative rounded-xl sm:rounded-2xl p-4 sm:p-5 transition-all duration-300 transform hover:scale-105 focus:scale-105 focus-ring",
              "shadow-professional hover:shadow-professional-lg",
              statFilter === 'submitted' 
                ? "ring-2 ring-green-500 dark:ring-green-400 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20" 
                : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={cn(
                "p-2.5 rounded-xl transition-colors duration-300",
                statFilter === 'submitted' 
                  ? "bg-green-500 text-white shadow-lg" 
                  : "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-800/30"
              )}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className={cn(
                "text-2xl sm:text-3xl font-bold transition-colors duration-300",
                statFilter === 'submitted' ? "text-green-700 dark:text-green-300" : "text-gray-900 dark:text-white"
              )}>
                {taskStats.submitted}
              </span>
            </div>
            <p className={cn(
              "text-sm font-medium transition-colors duration-300",
              statFilter === 'submitted' ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"
            )}>
              Submitted
            </p>
            <div className={cn(
              "absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
              "bg-gradient-to-r from-green-500/5 to-emerald-500/5"
            )} />
          </button>
        </div>

        {/* Task Categories */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <TaskCategories
            onCategorySelect={(category) => {
              setSelectedCategory(category)
              setStatFilter('all')
            }}
            selectedCategory={selectedCategory}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Task List */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          {statFilter !== 'all' && (
            <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-professional">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                  {getStatTitle()}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {getFilteredTasks().length} task{getFilteredTasks().length !== 1 ? 's' : ''} found
                </p>
              </div>
              <button
                onClick={() => setStatFilter('all')}
                className="px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors focus-ring"
              >
                View All Tasks
              </button>
            </div>
          )}
          
          <TaskList 
            tasks={getFilteredTasks()} 
            onTaskUpdate={loadTasks}
          />
        </div>
    </div>
  )
}