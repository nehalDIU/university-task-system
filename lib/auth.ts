import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'student' | 'section-admin' | 'super-admin'

export interface AuthUser extends User {
  role?: UserRole
  departmentId?: string
  batchId?: string
  sectionId?: string
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = createServerSupabaseClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      ...user,
      role: user.user_metadata?.role as UserRole,
      departmentId: user.user_metadata?.department_id,
      batchId: user.user_metadata?.batch_id,
      sectionId: user.user_metadata?.section_id,
    }
  } catch (error) {
    return null
  }
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<AuthUser> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    redirect('/unauthorized')
  }

  return user
}

export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  return user?.role === role
}

export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  return user?.role ? roles.includes(user.role) : false
}

export function canAccessRoute(user: AuthUser | null, requiredRoles: UserRole[]): boolean {
  if (!user || !user.role) return false
  return requiredRoles.includes(user.role)
}

export function getRedirectPath(user: AuthUser): string {
  switch (user.role) {
    case 'student':
      return '/student'
    case 'section-admin':
      return '/section-admin'
    case 'super-admin':
      return '/super-admin'
    default:
      return '/student'
  }
}



