'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Task } from '@/lib/supabase/types'

interface TaskFormData {
  title: string
  description: string
  category: string
  priority: 'low' | 'medium' | 'high'
  due_date: string
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'assignment',
    priority: 'medium',
    due_date: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')

  const supabase = createBrowserClient()

  useEffect(() => {
    loadTasks()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('admin_tasks_channel')
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
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get admin's section
      const { data: adminData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', user.id)
        .single()

      if (!adminData?.section_id) return

      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          task_submissions (
            id,
            user_id,
            status
          )
        `)
        .eq('section_id', adminData.section_id)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      setTasks(data || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: adminData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', user.id)
        .single()

      if (!adminData?.section_id) return

      const taskData = {
        ...formData,
        section_id: adminData.section_id,
        created_by: user.id,
        due_date: formData.due_date || null
      }

      const { error } = await supabase
        .from('tasks')
        .insert(taskData)

      if (error) {
        console.error('Create task error:', error)
        return
      }

      setShowCreateModal(false)
      resetForm()
      loadTasks()
    } catch (error) {
      console.error('Error creating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTask = async () => {
    if (!selectedTask || !formData.title.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          ...formData,
          due_date: formData.due_date || null
        })
        .eq('id', selectedTask.id)

      if (error) {
        console.error('Update task error:', error)
        return
      }

      setShowEditModal(false)
      setSelectedTask(null)
      resetForm()
      loadTasks()
    } catch (error) {
      console.error('Error updating task:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)

      if (error) {
        console.error('Delete task error:', error)
        return
      }

      loadTasks()
    } catch (error) {
      console.error('Error deleting task:', error)
    }
  }

  const handlePublishTask = async (taskId: string, publish: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null
        })
        .eq('id', taskId)

      if (error) {
        console.error('Publish task error:', error)
        return
      }

      loadTasks()
    } catch (error) {
      console.error('Error publishing task:', error)
    }
  }

  const handleBulkAction = async (action: 'publish' | 'unpublish' | 'delete') => {
    if (selectedTasks.length === 0) return

    const confirmMessage = action === 'delete' 
      ? 'Are you sure you want to delete the selected tasks? This action cannot be undone.'
      : `Are you sure you want to ${action} the selected tasks?`

    if (!confirm(confirmMessage)) return

    try {
      if (action === 'delete') {
        await supabase
          .from('tasks')
          .delete()
          .in('id', selectedTasks)
      } else {
        await supabase
          .from('tasks')
          .update({
            is_published: action === 'publish',
            published_at: action === 'publish' ? new Date().toISOString() : null
          })
          .in('id', selectedTasks)
      }

      setSelectedTasks([])
      loadTasks()
    } catch (error) {
      console.error('Error performing bulk action:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'assignment',
      priority: 'medium',
      due_date: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (task: Task) => {
    setSelectedTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    })
    setShowEditModal(true)
  }

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    )
  }

  const toggleSelectAll = () => {
    const filteredTasks = getFilteredTasks()
    if (selectedTasks.length === filteredTasks.length) {
      setSelectedTasks([])
    } else {
      setSelectedTasks(filteredTasks.map(task => task.id))
    }
  }

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (filter === 'published') return task.is_published
      if (filter === 'draft') return !task.is_published
      return true
    })
  }

  const getTaskStats = (task: Task) => {
    const submissions = task.task_submissions || []
    const submitted = submissions.filter((s: any) => s.status === 'submitted').length
    return { submitted, total: submissions.length }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredTasks = getFilteredTasks()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Task Management</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Task Management</h2>
          <Button onClick={openCreateModal}>
            Create New Task
          </Button>
        </div>
        
        {/* Filters and Bulk Actions */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {['all', 'published', 'draft'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption as any)}
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                  filter === filterOption
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {filterOption}
              </button>
            ))}
          </div>
          
          {selectedTasks.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedTasks.length} selected</span>
              <Button
                size="sm"
                onClick={() => handleBulkAction('publish')}
                className="bg-green-600 hover:bg-green-700"
              >
                Publish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('unpublish')}
              >
                Unpublish
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkAction('delete')}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-6">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p>No tasks found for the selected filter.</p>
            <Button onClick={openCreateModal} className="mt-4">
              Create Your First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All Checkbox */}
            <div className="flex items-center pb-2 border-b">
              <input
                type="checkbox"
                checked={selectedTasks.length === filteredTasks.length && filteredTasks.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-600">
                Select all ({filteredTasks.length} tasks)
              </label>
            </div>

            {filteredTasks.map((task) => {
              const stats = getTaskStats(task)
              return (
                <div key={task.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedTasks.includes(task.id)}
                      onChange={() => toggleTaskSelection(task.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            task.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {task.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
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
                          <span className="flex items-center">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {stats.submitted} submissions
                          </span>
                        </div>
                        
                        <div className="space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(task)}
                          >
                            Edit
                          </Button>
                          {!task.is_published ? (
                            <Button
                              size="sm"
                              onClick={() => handlePublishTask(task.id, true)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Publish
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishTask(task.id, false)}
                            >
                              Unpublish
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Task"
        className="max-w-2xl"
      >
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateTask}
          isSubmitting={isSubmitting}
          submitLabel="Create Task"
        />
      </Modal>

      {/* Edit Task Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        className="max-w-2xl"
      >
        <TaskForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditTask}
          isSubmitting={isSubmitting}
          submitLabel="Update Task"
        />
      </Modal>
    </div>
  )
}

// Task Form Component
function TaskForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isSubmitting, 
  submitLabel 
}: {
  formData: TaskFormData
  setFormData: (data: TaskFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
  submitLabel: string
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Task Title *
        </label>
        <Input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter task description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="assignment">Assignment</option>
            <option value="project">Project</option>
            <option value="quiz">Quiz</option>
            <option value="exam">Exam</option>
            <option value="lab">Lab Work</option>
            <option value="presentation">Presentation</option>
            <option value="reading">Reading</option>
            <option value="other">Other</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <Select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Due Date (Optional)
        </label>
        <Input
          type="datetime-local"
          name="due_date"
          value={formData.due_date}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !formData.title.trim()}
        >
          {isSubmitting ? 'Processing...' : submitLabel}
        </Button>
      </div>
    </div>
  )
}