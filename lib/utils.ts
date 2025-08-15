import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Enhanced date utilities for task management
export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function formatUpcomingDueDate(dueDate: string): string {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    const overdueDays = Math.abs(diffDays)
    return overdueDays === 1 ? 'Due yesterday' : `Due ${overdueDays} days ago`
  }
  
  if (diffDays === 0) {
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60))
    if (diffHours <= 0) return 'Due now'
    return diffHours === 1 ? 'Due in 1 hour' : `Due in ${diffHours} hours`
  }
  
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  
  return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function getTimeRemaining(dueDate: string): {
  days: number
  hours: number
  minutes: number
  isOverdue: boolean
} {
  const now = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - now.getTime()
  
  if (diffTime < 0) {
    const overdueDiff = Math.abs(diffTime)
    return {
      days: Math.floor(overdueDiff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((overdueDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((overdueDiff % (1000 * 60 * 60)) / (1000 * 60)),
      isOverdue: true
    }
  }
  
  return {
    days: Math.floor(diffTime / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60)),
    isOverdue: false
  }
}



