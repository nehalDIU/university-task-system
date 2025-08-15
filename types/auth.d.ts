export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  role: 'student' | 'section-admin' | 'super-admin'
  departmentId: string
  batchId?: string
  sectionId?: string
}

export interface ResetPasswordData {
  email: string
}

export interface User {
  id: string
  email: string
  fullName?: string
  role: 'student' | 'section-admin' | 'super-admin'
  departmentId?: string
  batchId?: string
  sectionId?: string
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}



