'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import type { Task, Routine } from '@/lib/supabase/types'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time?: string
  type: 'task' | 'routine' | 'deadline'
  priority?: string
  status?: string
}

export default function CalendarView() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCalendarEvents()
  }, [currentWeek])

  const loadCalendarEvents = async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get user's section
      const { data: userData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', user.id)
        .single()

      if (!userData?.section_id) return

      // Get week range
      const startOfWeek = new Date(currentWeek)
      startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      // Load tasks with deadlines in this week
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .eq('section_id', userData.section_id)
        .eq('is_published', true)
        .not('due_date', 'is', null)
        .gte('due_date', startOfWeek.toISOString())
        .lte('due_date', endOfWeek.toISOString())

      // Load routines for this week
      const { data: routines } = await supabase
        .from('routines')
        .select('*')
        .eq('section_id', userData.section_id)
        .eq('is_active', true)

      const calendarEvents: CalendarEvent[] = []

      // Add task deadlines
      if (tasks) {
        tasks.forEach(task => {
          if (task.due_date) {
            calendarEvents.push({
              id: `task-${task.id}`,
              title: task.title,
              date: task.due_date.split('T')[0],
              time: new Date(task.due_date).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              type: 'deadline',
              priority: task.priority,
              status: task.status
            })
          }
        })
      }

      // Add routines for each day of the week
      if (routines) {
        routines.forEach(routine => {
          const routineDate = new Date(startOfWeek)
          routineDate.setDate(startOfWeek.getDate() + routine.day_of_week)
          
          calendarEvents.push({
            id: `routine-${routine.id}-${routineDate.toISOString().split('T')[0]}`,
            title: routine.title,
            date: routineDate.toISOString().split('T')[0],
            time: routine.start_time.substring(0, 5),
            type: 'routine'
          })
        })
      }

      setEvents(calendarEvents)
    } catch (error) {
      console.error('Error loading calendar events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getWeekDays = () => {
    const startOfWeek = new Date(currentWeek)
    startOfWeek.setDate(currentWeek.getDate() - currentWeek.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateStr)
  }

  const getEventTypeColor = (type: string, priority?: string) => {
    switch (type) {
      case 'deadline':
        return priority === 'high' 
          ? 'bg-red-100 text-red-800 border-red-200' 
          : priority === 'medium'
          ? 'bg-orange-100 text-orange-800 border-orange-200'
          : 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'routine':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatDateHeader = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Weekly Calendar</h3>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded"></div>
              ))}
            </div>
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
            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Weekly Calendar
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateWeek('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToToday}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {getWeekDays().map((date, index) => {
            const dayEvents = getEventsForDate(date)
            const today = isToday(date)
            
            return (
              <div
                key={index}
                className={`min-h-24 p-1 border rounded-lg ${
                  today 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  today ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded border ${getEventTypeColor(event.type, event.priority)}`}
                      title={`${event.title} ${event.time ? `at ${event.time}` : ''}`}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.time && (
                        <div className="opacity-75">{event.time}</div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded mr-1"></div>
              <span>Classes</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded mr-1"></div>
              <span>High Priority</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded mr-1"></div>
              <span>Deadlines</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}