'use client'

import React, { useState } from 'react'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Tag, 
  FileText, 
  ChevronRight,
  PenSquare,
  Presentation,
  Beaker,
  Microscope,
  Activity,
  Users,
  Building,
  Folder,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { isOverdue, formatUpcomingDueDate, formatDateTime, cn } from '@/lib/utils'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Task, TaskSubmission } from '@/lib/supabase/types'

interface TaskWithSubmission extends Task {
  task_submissions?: TaskSubmission[]
  userSubmission?: TaskSubmission
  userStatus: 'pending' | 'submitted' | 'overdue'
}

interface TaskListProps {
  tasks: TaskWithSubmission[]
  showDeleteButton?: boolean
  onTaskUpdate?: () => void
}

export const TaskList: React.FC<TaskListProps> = ({ 
  tasks, 
  showDeleteButton = false,
  onTaskUpdate 
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskWithSubmission | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [submissionText, setSubmissionText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserClient()

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
        status: 'submitted' as const,
        submitted_at: new Date().toISOString()
      }

      if (selectedTask.userSubmission) {
        await supabase
          .from('task_submissions')
          .update(submissionData)
          .eq('id', selectedTask.userSubmission.id)
      } else {
        await supabase
          .from('task_submissions')
          .insert(submissionData)
      }

      setShowSubmissionModal(false)
      setSubmissionText('')
      setSelectedTask(null)
      onTaskUpdate?.()
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const configs = {
      submitted: 'bg-green-100 text-green-800 border-green-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    
    return (
      <span className={cn(
        'px-3 py-1 text-xs font-medium rounded-full border',
        configs[status as keyof typeof configs] || configs.pending
      )}>
        {status === 'submitted' ? 'Submitted' : status === 'overdue' ? 'Overdue' : 'Pending'}
      </span>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50'
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50/50'
      case 'low':
        return 'border-l-green-500 bg-green-50/50'
      default:
        return 'border-l-gray-500 bg-gray-50/50'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      'task': <FileText className="w-4 h-4" />,
      'presentation': <Presentation className="w-4 h-4" />,
      'project': <Folder className="w-4 h-4" />,
      'assignment': <PenSquare className="w-4 h-4" />,
      'quiz': <GraduationCap className="w-4 h-4" />,
      'lab-report': <Beaker className="w-4 h-4" />,
      'lab-final': <Microscope className="w-4 h-4" />,
      'lab-performance': <Activity className="w-4 h-4" />,
      'documents': <FileText className="w-4 h-4" />,
      'blc': <Building className="w-4 h-4" />,
      'groups': <Users className="w-4 h-4" />,
      'others': <MoreHorizontal className="w-4 h-4" />
    }
    return icons[category] || <FileText className="w-4 h-4" />
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <FileText className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          There are no tasks matching your current filters. Try adjusting your filters or check back later.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              'bg-white dark:bg-gray-800 rounded-xl shadow-sm border-l-4 p-6 hover:shadow-md transition-all duration-200 group',
              getPriorityColor(task.priority)
            )}
          >
            {/* Task Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {getStatusIcon(task.userStatus)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {task.title}
                    </h3>
                    <span className="flex-shrink-0 p-1 rounded bg-gray-100 dark:bg-gray-700" title={task.category}>
                      {getCategoryIcon(task.category)}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0 ml-4">
                {getStatusBadge(task.userStatus)}
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded capitalize',
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                )}>
                  {task.priority}
                </span>
              </div>
            </div>

            {/* Task Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Tag className="w-4 h-4" />
                  <span className="capitalize">{task.category.replace('-', ' ')}</span>
                </div>
                {task.due_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className={cn(
                      isOverdue(task.due_date) && task.userStatus !== 'submitted'
                        ? 'text-red-600 dark:text-red-400 font-medium'
                        : ''
                    )}>
                      {formatUpcomingDueDate(task.due_date)}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="text-xs">
                Created {formatDateTime(task.created_at)}
              </div>
            </div>

            {/* Submission Status */}
            {task.userSubmission && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Submission Status: {task.userSubmission.status}
                    </p>
                    {task.userSubmission.submitted_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Submitted: {formatDateTime(task.userSubmission.submitted_at)}
                      </p>
                    )}
                  </div>
                  {task.userSubmission.grade && (
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {task.userSubmission.grade}/100
                      </span>
                    </div>
                  )}
                </div>
                {task.userSubmission.feedback && (
                  <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded-md">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Feedback:</strong> {task.userSubmission.feedback}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {task.due_date && (
                  <span>Due: {formatDateTime(task.due_date)}</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                {task.userStatus !== 'submitted' && (
                  <Button
                    onClick={() => openSubmissionModal(task)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {task.userSubmission ? 'Update Submission' : 'Submit Task'}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
                {task.userSubmission && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openSubmissionModal(task)}
                  >
                    View Details
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        title={selectedTask?.title || 'Task Submission'}
        className="max-w-2xl"
      >
        <div className="space-y-4">
          {selectedTask && (
            <>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Task Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {selectedTask.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>Category: {selectedTask.category}</span>
                  <span>Priority: {selectedTask.priority}</span>
                  {selectedTask.due_date && (
                    <span>Due: {formatDateTime(selectedTask.due_date)}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Submission
                </label>
                <textarea
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full h-40 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                  placeholder="Enter your submission details, answers, or attach relevant information..."
                  required
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Provide detailed information about your work, answers, or any relevant details for this task.
                </p>
              </div>

              {selectedTask.userSubmission && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Submission History</h4>
                  <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <p><strong>Status:</strong> {selectedTask.userSubmission.status}</p>
                    {selectedTask.userSubmission.submitted_at && (
                      <p><strong>Last Submitted:</strong> {formatDateTime(selectedTask.userSubmission.submitted_at)}</p>
                    )}
                    {selectedTask.userSubmission.grade && (
                      <p><strong>Grade:</strong> {selectedTask.userSubmission.grade}/100</p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t dark:border-gray-600">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmissionModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitTask}
                  disabled={isSubmitting || !submissionText.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 
                   selectedTask.userSubmission ? 'Update Submission' : 'Submit Task'}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}

export default TaskList
