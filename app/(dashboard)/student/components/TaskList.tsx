'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, Clock, AlertCircle, Calendar, User, Tag, FileText } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { createBrowserClient } from '@/lib/supabase/client'
import { isOverdue, formatUpcomingDueDate, cn } from '@/lib/utils'
import type { Task, TaskSubmission } from '@/lib/supabase/types'

interface TaskWithSubmission extends Task {
  task_submissions?: TaskSubmission[]
  userSubmission?: TaskSubmission
  userStatus: 'pending' | 'submitted' | 'overdue'
}

interface EnhancedTaskListProps {
  tasks: TaskWithSubmission[]
  showDeleteButton?: boolean
  onTaskUpdate?: () => void
}

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskWithSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TaskWithSubmission | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'pending' | 'submitted' | 'overdue'>('all')

  const supabase = createBrowserClient()

  useEffect(() => {
    loadTasks()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('tasks_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        () => {
          loadTasks()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'task_submissions'
        },
        () => {
          loadTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get user's section
      const { data: userData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', user.id)
        .single()

      if (!userData?.section_id) return

      // Get published tasks with submissions
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
          (submission: any) => submission.user_id === user.id
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
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitTask = async () => {
    if (!selectedTask || !submissionText.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const submissionData = {
        task_id: selectedTask.id,
        user_id: user.id,
        submission_text: submissionText,
        status: 'submitted',
        submitted_at: new Date().toISOString()
      }

      if (selectedTask.userSubmission) {
        // Update existing submission
        await supabase
          .from('task_submissions')
          .update(submissionData)
          .eq('id', selectedTask.userSubmission.id)
      } else {
        // Create new submission
        await supabase
          .from('task_submissions')
          .insert(submissionData)
      }

      setShowSubmissionModal(false)
      setSubmissionText('')
      setSelectedTask(null)
      loadTasks()
    } catch (error) {
      console.error('Error submitting task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const openSubmissionModal = (task: TaskWithSubmission) => {
    setSelectedTask(task)
    setSubmissionText(task.userSubmission?.submission_text || '')
    setShowSubmissionModal(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Submitted</span>
      case 'overdue':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Overdue</span>
      default:
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Pending</span>
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.userStatus === filter
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">My Tasks</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">My Tasks</h2>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Tasks' },
            { key: 'pending', label: 'Pending' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'overdue', label: 'Overdue' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No tasks found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`border-l-4 ${getPriorityColor(task.priority)} rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.998 1.998 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {task.category}
                      </span>
                      {task.due_date && (
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          Due: {formatDate(task.due_date)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(task.userStatus)}
                    <span className={`px-2 py-1 text-xs font-medium rounded capitalize ${
                      task.priority === 'high' ? 'bg-red-100 text-red-800' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(task.created_at)}
                  </div>
                  <div className="space-x-2">
                    {task.userStatus !== 'submitted' && (
                      <Button
                        onClick={() => openSubmissionModal(task)}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {task.userSubmission ? 'Update Submission' : 'Submit Task'}
                      </Button>
                    )}
                    {task.userSubmission && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSubmissionModal(task)}
                      >
                        View Submission
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        title={`Submit: ${selectedTask?.title}`}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Text
            </label>
            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your submission details..."
              required
            />
          </div>

          {selectedTask?.userSubmission && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Submission Status</h4>
              <div className="text-sm text-gray-600">
                <p><strong>Status:</strong> {selectedTask.userSubmission.status}</p>
                <p><strong>Submitted:</strong> {selectedTask.userSubmission.submitted_at ? formatDate(selectedTask.userSubmission.submitted_at) : 'Not submitted'}</p>
                {selectedTask.userSubmission.feedback && (
                  <div className="mt-2">
                    <strong>Feedback:</strong>
                    <p className="mt-1 p-2 bg-white rounded border">{selectedTask.userSubmission.feedback}</p>
                  </div>
                )}
                {selectedTask.userSubmission.grade && (
                  <p className="mt-2"><strong>Grade:</strong> {selectedTask.userSubmission.grade}/100</p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowSubmissionModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitTask}
              disabled={isSubmitting || !submissionText.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}