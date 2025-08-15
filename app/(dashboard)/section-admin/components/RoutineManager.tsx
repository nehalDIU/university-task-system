'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Routine } from '@/lib/supabase/types'

interface RoutineFormData {
  title: string
  description: string
  day_of_week: number
  start_time: string
  end_time: string
  room: string
  subject: string
  instructor_name: string
}

export default function RoutineManager() {
  const [routines, setRoutines] = useState<Routine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null)
  const [formData, setFormData] = useState<RoutineFormData>({
    title: '',
    description: '',
    day_of_week: 1,
    start_time: '',
    end_time: '',
    room: '',
    subject: '',
    instructor_name: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserClient()

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  useEffect(() => {
    loadRoutines()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('routines_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'routines'
        },
        () => {
          loadRoutines()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadRoutines = async () => {
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
        .from('routines')
        .select('*')
        .eq('section_id', adminData.section_id)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time')

      setRoutines(data || [])
    } catch (error) {
      console.error('Error loading routines:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRoutine = async () => {
    if (!formData.title.trim() || !formData.start_time || !formData.end_time) return

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

      const routineData = {
        ...formData,
        section_id: adminData.section_id,
        created_by: user.id
      }

      const { error } = await supabase
        .from('routines')
        .insert(routineData)

      if (error) {
        console.error('Create routine error:', error)
        return
      }

      setShowCreateModal(false)
      resetForm()
      loadRoutines()
    } catch (error) {
      console.error('Error creating routine:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditRoutine = async () => {
    if (!selectedRoutine || !formData.title.trim() || !formData.start_time || !formData.end_time) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('routines')
        .update(formData)
        .eq('id', selectedRoutine.id)

      if (error) {
        console.error('Update routine error:', error)
        return
      }

      setShowEditModal(false)
      setSelectedRoutine(null)
      resetForm()
      loadRoutines()
    } catch (error) {
      console.error('Error updating routine:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRoutine = async (routineId: string) => {
    if (!confirm('Are you sure you want to delete this routine? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('routines')
        .update({ is_active: false })
        .eq('id', routineId)

      if (error) {
        console.error('Delete routine error:', error)
        return
      }

      loadRoutines()
    } catch (error) {
      console.error('Error deleting routine:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      day_of_week: 1,
      start_time: '',
      end_time: '',
      room: '',
      subject: '',
      instructor_name: ''
    })
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (routine: Routine) => {
    setSelectedRoutine(routine)
    setFormData({
      title: routine.title,
      description: routine.description || '',
      day_of_week: routine.day_of_week,
      start_time: routine.start_time,
      end_time: routine.end_time,
      room: routine.room || '',
      subject: routine.subject || '',
      instructor_name: routine.instructor_name || ''
    })
    setShowEditModal(true)
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDayName = (dayOfWeek: number) => {
    return daysOfWeek.find(day => day.value === dayOfWeek)?.label || 'Unknown'
  }

  const getRoutinesByDay = () => {
    const routinesByDay: { [key: number]: Routine[] } = {}
    routines.forEach(routine => {
      if (!routinesByDay[routine.day_of_week]) {
        routinesByDay[routine.day_of_week] = []
      }
      routinesByDay[routine.day_of_week].push(routine)
    })
    return routinesByDay
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Class Routines</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const routinesByDay = getRoutinesByDay()

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Class Routines
          </h3>
          <Button onClick={openCreateModal} size="sm">
            Add Schedule
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        {routines.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>No class schedules yet</p>
            <Button onClick={openCreateModal} className="mt-4">
              Create First Schedule
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {daysOfWeek.map(day => {
              const dayRoutines = routinesByDay[day.value] || []
              if (dayRoutines.length === 0) return null

              return (
                <div key={day.value} className="border rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full mr-2"></div>
                    {day.label}
                  </h4>
                  <div className="space-y-2">
                    {dayRoutines.map((routine) => (
                      <div key={routine.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{routine.title}</h5>
                              {routine.subject && (
                                <p className="text-sm text-gray-600">{routine.subject}</p>
                              )}
                              {routine.description && (
                                <p className="text-xs text-gray-500">{routine.description}</p>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {formatTime(routine.start_time)} - {formatTime(routine.end_time)}
                              </div>
                              {routine.room && (
                                <div className="flex items-center mt-1">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {routine.room}
                                </div>
                              )}
                              {routine.instructor_name && (
                                <div className="flex items-center mt-1">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {routine.instructor_name}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="ml-4 flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(routine)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Routine Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Class Schedule"
        className="max-w-2xl"
      >
        <RoutineForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateRoutine}
          isSubmitting={isSubmitting}
          submitLabel="Add Schedule"
          daysOfWeek={daysOfWeek}
        />
      </Modal>

      {/* Edit Routine Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Class Schedule"
        className="max-w-2xl"
      >
        <RoutineForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleEditRoutine}
          isSubmitting={isSubmitting}
          submitLabel="Update Schedule"
          daysOfWeek={daysOfWeek}
        />
      </Modal>
    </div>
  )
}

// Routine Form Component
function RoutineForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  isSubmitting, 
  submitLabel,
  daysOfWeek 
}: {
  formData: RoutineFormData
  setFormData: (data: RoutineFormData) => void
  onSubmit: () => void
  isSubmitting: boolean
  submitLabel: string
  daysOfWeek: { value: number, label: string }[]
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'day_of_week' ? parseInt(value) : value 
    }))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Title *
          </label>
          <Input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Advanced Programming"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Additional details about the class"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Day of Week *
          </label>
          <Select
            name="day_of_week"
            value={formData.day_of_week.toString()}
            onChange={handleChange}
            required
          >
            {daysOfWeek.map(day => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Time *
          </label>
          <Input
            type="time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Time *
          </label>
          <Input
            type="time"
            name="end_time"
            value={formData.end_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Room/Location
          </label>
          <Input
            type="text"
            name="room"
            value={formData.room}
            onChange={handleChange}
            placeholder="e.g., Room 301, Lab A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructor Name
          </label>
          <Input
            type="text"
            name="instructor_name"
            value={formData.instructor_name}
            onChange={handleChange}
            placeholder="e.g., Dr. John Smith"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => {}}>
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || !formData.title.trim() || !formData.start_time || !formData.end_time}
        >
          {isSubmitting ? 'Processing...' : submitLabel}
        </Button>
      </div>
    </div>
  )
}