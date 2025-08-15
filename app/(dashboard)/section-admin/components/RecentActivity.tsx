'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'

interface ActivityItem {
  id: string
  type: 'task_submission' | 'task_created' | 'user_joined' | 'routine_created'
  title: string
  description: string
  time: string
  user?: string
  icon: string
  color: string
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRecentActivity()
    
    // Set up polling for recent updates (every 30 seconds)
    const interval = setInterval(loadRecentActivity, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const loadRecentActivity = async () => {
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

      const activities: ActivityItem[] = []

      // Get recent task submissions
      const { data: submissions } = await supabase
        .from('task_submissions')
        .select(`
          id,
          status,
          submitted_at,
          tasks (title),
          users (name)
        `)
        .not('submitted_at', 'is', null)
        .gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .order('submitted_at', { ascending: false })
        .limit(10)

      submissions?.forEach((submission: any) => {
        if (submission.submitted_at) {
          activities.push({
            id: `submission-${submission.id}`,
            type: 'task_submission',
            title: 'Task Submitted',
            description: `${submission.users?.name} submitted "${submission.tasks?.title}"`,
            time: submission.submitted_at,
            user: submission.users?.name,
            icon: '📝',
            color: 'text-blue-600'
          })
        }
      })

      // Get recently created tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, created_at, created_by')
        .eq('section_id', adminData.section_id)
        .eq('created_by', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      tasks?.forEach(task => {
        activities.push({
          id: `task-${task.id}`,
          type: 'task_created',
          title: 'Task Created',
          description: `New task "${task.title}" was created`,
          time: task.created_at,
          icon: '➕',
          color: 'text-green-600'
        })
      })

      // Get new section members
      const { data: newMembers } = await supabase
        .from('users')
        .select('id, name, created_at')
        .eq('section_id', adminData.section_id)
        .eq('role', 'user')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      newMembers?.forEach(member => {
        activities.push({
          id: `member-${member.id}`,
          type: 'user_joined',
          title: 'New Member',
          description: `${member.name} joined the section`,
          time: member.created_at,
          user: member.name,
          icon: '👋',
          color: 'text-purple-600'
        })
      })

      // Get recently created routines
      const { data: routines } = await supabase
        .from('routines')
        .select('id, title, created_at')
        .eq('section_id', adminData.section_id)
        .eq('created_by', user.id)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)

      routines?.forEach(routine => {
        activities.push({
          id: `routine-${routine.id}`,
          type: 'routine_created',
          title: 'Schedule Added',
          description: `Class schedule "${routine.title}" was added`,
          time: routine.created_at,
          icon: '📅',
          color: 'text-indigo-600'
        })
      })

      // Sort all activities by time
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      
      setActivities(activities.slice(0, 15)) // Limit to 15 most recent
    } catch (error) {
      console.error('Error loading recent activity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const time = new Date(dateString)
    const diffInMilliseconds = now.getTime() - time.getTime()
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60))
    const diffInHours = Math.floor(diffInMinutes / 60)
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return time.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getActivityIcon = (activity: ActivityItem) => {
    return (
      <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm ${activity.color}`}>
        {activity.icon}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Recent Activity
          </h3>
          <button
            onClick={loadRecentActivity}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh
          </button>
        </div>
      </div>
      
      <div className="p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No recent activity</p>
            <p className="text-sm">Activity from the last 7 days will appear here</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
                {getActivityIcon(activity)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {getTimeAgo(activity.time)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
            <button 
              onClick={loadRecentActivity}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Load More Activity
            </button>
          </div>
        )}
      </div>
    </div>
  )
}



