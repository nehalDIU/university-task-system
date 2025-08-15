'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface AnalyticsData {
  taskCompletion: {
    completed: number
    pending: number
    overdue: number
  }
  studentPerformance: {
    excellent: number
    good: number
    needs_improvement: number
  }
  categoryDistribution: {
    [key: string]: number
  }
  recentTrends: {
    date: string
    completions: number
  }[]
}

export default function TaskAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    taskCompletion: { completed: 0, pending: 0, overdue: 0 },
    studentPerformance: { excellent: 0, good: 0, needs_improvement: 0 },
    categoryDistribution: {},
    recentTrends: []
  })
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'semester'>('week')

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
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

      // Get date range based on selected period
      const now = new Date()
      const startDate = new Date()
      switch (selectedPeriod) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case 'semester':
          startDate.setMonth(now.getMonth() - 4)
          break
      }

      // Get tasks with submissions
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          *,
          task_submissions (
            id,
            user_id,
            status,
            submitted_at,
            grade
          )
        `)
        .eq('section_id', adminData.section_id)
        .eq('is_published', true)
        .gte('created_at', startDate.toISOString())

      // Get section students
      const { data: students } = await supabase
        .from('users')
        .select('id')
        .eq('section_id', adminData.section_id)
        .eq('role', 'user')
        .eq('is_active', true)

      if (!tasks || !students) return

      // Calculate task completion stats
      const taskCompletion = { completed: 0, pending: 0, overdue: 0 }
      const categoryDistribution: { [key: string]: number } = {}
      
      tasks.forEach(task => {
        // Category distribution
        categoryDistribution[task.category] = (categoryDistribution[task.category] || 0) + 1

        // Task completion status
        const submittedUsers = new Set()
        task.task_submissions?.forEach((submission: any) => {
          if (submission.status === 'submitted') {
            submittedUsers.add(submission.user_id)
          }
        })

        const expectedSubmissions = students.length
        const actualSubmissions = submittedUsers.size
        
        if (actualSubmissions === expectedSubmissions) {
          taskCompletion.completed++
        } else if (task.due_date && new Date(task.due_date) < now) {
          taskCompletion.overdue++
        } else {
          taskCompletion.pending++
        }
      })

      // Calculate student performance
      const studentPerformance = { excellent: 0, good: 0, needs_improvement: 0 }
      const studentGrades: { [key: string]: number[] } = {}

      tasks.forEach(task => {
        task.task_submissions?.forEach((submission: any) => {
          if (submission.grade !== null) {
            if (!studentGrades[submission.user_id]) {
              studentGrades[submission.user_id] = []
            }
            studentGrades[submission.user_id].push(submission.grade)
          }
        })
      })

      Object.values(studentGrades).forEach((grades: number[]) => {
        const average = grades.reduce((sum, grade) => sum + grade, 0) / grades.length
        if (average >= 85) studentPerformance.excellent++
        else if (average >= 70) studentPerformance.good++
        else studentPerformance.needs_improvement++
      })

      // Calculate recent trends (last 7 days)
      const recentTrends: { date: string, completions: number }[] = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(now.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        let completions = 0
        tasks.forEach(task => {
          task.task_submissions?.forEach((submission: any) => {
            if (submission.submitted_at && submission.submitted_at.startsWith(dateStr)) {
              completions++
            }
          })
        })
        
        recentTrends.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          completions
        })
      }

      setAnalytics({
        taskCompletion,
        studentPerformance,
        categoryDistribution,
        recentTrends
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCompletionRate = () => {
    const total = analytics.taskCompletion.completed + analytics.taskCompletion.pending + analytics.taskCompletion.overdue
    if (total === 0) return 0
    return Math.round((analytics.taskCompletion.completed / total) * 100)
  }

  const getPerformanceRate = () => {
    const total = analytics.studentPerformance.excellent + analytics.studentPerformance.good + analytics.studentPerformance.needs_improvement
    if (total === 0) return 0
    return Math.round((analytics.studentPerformance.excellent / total) * 100)
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Task Analytics</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Task Analytics
          </h3>
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'semester', label: 'Semester' }
            ].map((period) => (
              <button
                key={period.key}
                onClick={() => setSelectedPeriod(period.key as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedPeriod === period.key
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Task Completion Rate</p>
                <p className="text-2xl font-bold text-blue-700">{getCompletionRate()}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Top Performers</p>
                <p className="text-2xl font-bold text-green-700">{getPerformanceRate()}%</p>
              </div>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Task Completion Breakdown */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Task Completion Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                Completed
              </span>
              <span className="font-medium">{analytics.taskCompletion.completed}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                Pending
              </span>
              <span className="font-medium">{analytics.taskCompletion.pending}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                Overdue
              </span>
              <span className="font-medium">{analytics.taskCompletion.overdue}</span>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3 bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500" 
                style={{ 
                  width: `${(analytics.taskCompletion.completed / (analytics.taskCompletion.completed + analytics.taskCompletion.pending + analytics.taskCompletion.overdue)) * 100}%` 
                }}
              ></div>
              <div 
                className="bg-yellow-500" 
                style={{ 
                  width: `${(analytics.taskCompletion.pending / (analytics.taskCompletion.completed + analytics.taskCompletion.pending + analytics.taskCompletion.overdue)) * 100}%` 
                }}
              ></div>
              <div 
                className="bg-red-500" 
                style={{ 
                  width: `${(analytics.taskCompletion.overdue / (analytics.taskCompletion.completed + analytics.taskCompletion.pending + analytics.taskCompletion.overdue)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Student Performance */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Student Performance Distribution</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{analytics.studentPerformance.excellent}</p>
              <p className="text-green-600 text-xs font-medium">Excellent (85%+)</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{analytics.studentPerformance.good}</p>
              <p className="text-yellow-600 text-xs font-medium">Good (70-84%)</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{analytics.studentPerformance.needs_improvement}</p>
              <p className="text-red-600 text-xs font-medium">Needs Help (&lt;70%)</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        {Object.keys(analytics.categoryDistribution).length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Task Categories</h4>
            <div className="space-y-2">
              {Object.entries(analytics.categoryDistribution).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{category}</span>
                  <span className="font-medium">{count} tasks</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity Trend */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recent Submission Trend</h4>
          <div className="flex items-end space-x-2 h-16">
            {analytics.recentTrends.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${Math.max((day.completions / Math.max(...analytics.recentTrends.map(d => d.completions), 1)) * 100, 10)}%` 
                  }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{day.date}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">Daily task submissions over the last week</p>
        </div>
      </div>
    </div>
  )
}



