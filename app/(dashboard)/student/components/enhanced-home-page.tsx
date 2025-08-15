"use client"

import React, { useMemo, useState, useEffect } from 'react'
import { ListTodo, CheckCircle2, Clock, AlertCircle, Sparkles, CalendarDays } from 'lucide-react'
import EnhancedTaskList from './enhanced-task-list'
import TaskCategories from './task-categories'
import { isOverdue, formatUpcomingDueDate } from '@/lib/utils'
import { Task, DatabaseTask, transformDatabaseTask, TaskCategory, StatFilter, User, TaskStats, UpcomingTaskDisplayData } from '@/types/task'

interface EnhancedHomePageProps {
  user: User
  tasks: DatabaseTask[]
  sectionTasks: any[]
  taskStats: TaskStats
}

export default function EnhancedHomePage({
  user,
  tasks,
  sectionTasks,
  taskStats
}: EnhancedHomePageProps) {
  const [currentRecentTaskIndex, setCurrentRecentTaskIndex] = useState(0)
  const [showGreeting, setShowGreeting] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null)
  const [statFilter, setStatFilter] = useState<StatFilter>('all')
  const MAX_RECENT_TASKS_TO_SHOW = 3

  useEffect(() => {
    const greetingTimer = setTimeout(() => {
      setShowGreeting(false)
    }, 1500)

    return () => {
      clearTimeout(greetingTimer)
    }
  }, [])

  // Compute enhanced task stats
  const enhancedTaskStats = useMemo(() => {
    const validTasks = tasks && Array.isArray(tasks) ? tasks : []
    const totalTasks = validTasks.length
    
    return {
      total: totalTasks,
      inProgress: validTasks.filter(t => t.status === 'in-progress').length,
      completed: validTasks.filter(t => t.status === 'completed').length,
      overdue: validTasks.filter(t => isOverdue(t.due_date) && t.status !== 'completed').length
    }
  }, [tasks])

  // Pre-calculate upcoming tasks with their formatted due dates
  const upcomingTasksData: UpcomingTaskDisplayData[] = useMemo(() => {
    if (!tasks || tasks.length === 0) return []
    return tasks
      .filter(task => task.status !== 'completed' && task.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
      .slice(0, MAX_RECENT_TASKS_TO_SHOW)
      .map(task => {
        const transformedTask = transformDatabaseTask(task)
        return {
          ...transformedTask,
          formattedDueDate: formatUpcomingDueDate(task.due_date!)
        }
      })
  }, [tasks])

  useEffect(() => {
    if (upcomingTasksData.length <= 1) {
      setCurrentRecentTaskIndex(0)
      return
    }

    const timer = setInterval(() => {
      setCurrentRecentTaskIndex(prevIndex => (prevIndex + 1) % upcomingTasksData.length)
    }, 5000) // Cycle every 5 seconds

    return () => clearInterval(timer)
  }, [upcomingTasksData.length])

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const validTasks = tasks && Array.isArray(tasks) ? tasks : []
    
    return validTasks.reduce((acc: Record<string, number>, task) => {
      const category = task.category || 'others'
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }, [tasks])

  // Filter tasks based on selected stat and category
  const getFilteredTasks = () => {
    let filtered = tasks

    // First apply category filter if selected
    if (selectedCategory) {
      filtered = filtered.filter(task => task.category === selectedCategory)
    }

    // Then apply stat filter
    switch (statFilter) {
      case 'overdue':
        return filtered.filter(task => isOverdue(task.due_date) && task.status !== 'completed')
      case 'in-progress':
        return filtered.filter(task => task.status === 'in-progress')
      case 'completed':
        return filtered.filter(task => task.status === 'completed')
      default:
        return filtered
    }
  }

  const getStatTitle = () => {
    switch (statFilter) {
      case 'overdue':
        return 'Overdue Tasks'
      case 'in-progress':
        return 'In Progress Tasks'
      case 'completed':
        return 'Completed Tasks'
      default:
        return selectedCategory 
          ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace('-', ' ')} Tasks`
          : 'All Tasks'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white overflow-hidden">
        <div
          className={`transition-all duration-1000 ease-in-out ${
            showGreeting ? 'opacity-100 max-h-[6rem]' : 'opacity-0 max-h-0'
          }`}
          style={{ overflow: 'hidden' }}
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-yellow-300 flex-shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome back, {user?.name || 'User'}!
            </h1>
          </div>
          <p className="text-blue-100 pl-10 sm:pl-11">
            You have {enhancedTaskStats.total} total tasks.
            {user?.departments?.name && (
              <span className="block text-sm opacity-90 mt-1">
                {user.departments.name} • {user.batches?.name} • Section {user.sections?.name}
              </span>
            )}
          </p>
        </div>

        {/* Upcoming Task Display Area */}
        <div className={`pl-10 sm:pl-11 min-h-[3.5em] relative transition-all duration-1000 ease-in-out ${showGreeting ? 'mt-3' : 'mt-0'}`}> 
          {upcomingTasksData.length > 0 ? (
            upcomingTasksData.map((task, index) => (
              <div
                key={task.id}
                className={`absolute w-full transition-opacity duration-700 ease-in-out flex flex-col gap-1 ${
                  index === currentRecentTaskIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
              >
                <p className="text-base font-medium text-blue-50 truncate" title={task.title}>
                  {task.title}
                </p>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />
                  <p className="text-xs text-blue-200 font-light">
                    {task.formattedDueDate}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-blue-100 opacity-75">
              {showGreeting ? "No upcoming tasks right now." : "You're all caught up!"}
            </p>
          )}
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button
          onClick={() => setStatFilter('all')}
          className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105 ${
            statFilter === 'all' 
              ? 'ring-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-gray-700' 
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {enhancedTaskStats.total}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
        </button>

        <button
          onClick={() => setStatFilter('overdue')}
          className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105 ${
            statFilter === 'overdue' 
              ? 'ring-2 ring-red-500 dark:ring-red-400 bg-red-50 dark:bg-gray-700' 
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {enhancedTaskStats.overdue}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overdue</p>
        </button>

        <button
          onClick={() => setStatFilter('in-progress')}
          className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105 ${
            statFilter === 'in-progress' 
              ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-gray-700' 
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {enhancedTaskStats.inProgress}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
        </button>

        <button
          onClick={() => setStatFilter('completed')}
          className={`rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-105 focus:scale-105 ${
            statFilter === 'completed' 
              ? 'ring-2 ring-green-500 dark:ring-green-400 bg-green-50 dark:bg-gray-700' 
              : 'bg-white dark:bg-gray-800'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              {enhancedTaskStats.completed}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
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
      <div>
        {statFilter !== 'all' && (
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {getStatTitle()}
            </h2>
            <button
              onClick={() => setStatFilter('all')}
              className="px-2 py-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 rounded-md"
            >
              View All Tasks
            </button>
          </div>
        )}
        
        <EnhancedTaskList
          tasks={getFilteredTasks()}
          showDeleteButton={false}
        />
      </div>
    </div>
  )
}
