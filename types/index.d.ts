export * from './auth'
export * from './tasks'

export interface Department {
  id: string
  name: string
  code: string
  createdAt: string
  updatedAt: string
}

export interface Batch {
  id: string
  name: string
  departmentId: string
  year: number
  createdAt: string
  updatedAt: string
}

export interface Section {
  id: string
  name: string
  batchId: string
  createdAt: string
  updatedAt: string
}

export interface AuditLog {
  id: string
  action: string
  userId: string
  userEmail: string
  details?: Record<string, any>
  timestamp: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}



