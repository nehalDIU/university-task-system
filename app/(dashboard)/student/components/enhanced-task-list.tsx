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
      'midterm': <GraduationCap className="w-4 h-4" />,
      'final-exam': <GraduationCap className="w-4 h-4" />,
      'others': <MoreHorizontal className="w-4 h-4" />
    }
    return icons[category] || <FileText className="w-4 h-4" />
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 lg:py-20 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-professional animate-fade-in">
        <div className="max-w-md mx-auto px-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl"></div>
            <FileText className="relative mx-auto h-16 w-16 text-blue-500 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            No tasks found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
            There are no tasks matching your current filters. Try adjusting your filters or check back later for new assignments.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-ring"
            >
              Refresh Tasks
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus-ring">
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 lg:space-y-6">
        {/* Mobile: Single column grid */}
        <div className="block sm:hidden space-y-4 animate-fade-in">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-2xl shadow-professional hover:shadow-professional-lg border-l-4 p-6 transition-all duration-300 group transform hover:scale-[1.02] focus-within:scale-[1.02]',
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
                      {task.userSubmission ? 'Update' : 'Submit'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: Multi-column grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6 animate-fade-in">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                'bg-white dark:bg-gray-800 rounded-2xl shadow-professional hover:shadow-professional-lg border-l-4 p-5 hover:-translate-y-2 transition-all duration-300 group transform hover:scale-[1.02] focus-within:scale-[1.02]',
                getPriorityColor(task.priority)
              )}
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(task.userStatus)}
                  <span className="flex-shrink-0 p-1 rounded bg-gray-100 dark:bg-gray-700" title={task.category}>
                    {getCategoryIcon(task.category)}
                  </span>
                </div>
                {getStatusBadge(task.userStatus)}
              </div>

              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {task.title}
              </h3>

              {task.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
                  {task.description}
                </p>
              )}

              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div className="flex items-center space-x-1 mb-1">
                  <Tag className="w-3 h-3" />
                  <span className="capitalize">{task.category.replace('-', ' ')}</span>
                </div>
                {task.due_date && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
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

              {/* Action Button */}
              <div className="mt-auto pt-2">
                {task.userStatus !== 'submitted' && (
                  <Button
                    onClick={() => openSubmissionModal(task)}
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {task.userSubmission ? 'Update' : 'Submit'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
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