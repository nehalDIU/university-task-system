export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  createdBy: string
  assignedTo: string[]
  createdAt: string
  updatedAt: string
}

export interface CreateTaskData {
  title: string
  description?: string
  dueDate?: string
  priority: 'low' | 'medium' | 'high'
  assignedTo: string[]
}

export interface UpdateTaskData {
  id: string
  title?: string
  description?: string
  dueDate?: string
  status?: 'pending' | 'in-progress' | 'completed' | 'overdue'
  priority?: 'low' | 'medium' | 'high'
  assignedTo?: string[]
}

export interface TaskFilter {
  status?: 'pending' | 'in-progress' | 'completed' | 'overdue' | 'all'
  priority?: 'low' | 'medium' | 'high' | 'all'
  assignedTo?: string
  createdBy?: string
  search?: string
}

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  overdue: number
}



