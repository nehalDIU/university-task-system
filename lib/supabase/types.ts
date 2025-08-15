export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      departments: {
        Row: {
          id: string
          name: string
          code: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      batches: {
        Row: {
          id: string
          name: string
          department_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          department_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          department_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      sections: {
        Row: {
          id: string
          name: string
          batch_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          batch_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          batch_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          student_id: string | null
          role: 'user' | 'section_admin' | 'super_admin'
          department_id: string | null
          batch_id: string | null
          section_id: string | null
          avatar_url: string | null
          phone: string | null
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          student_id?: string | null
          role?: 'user' | 'section_admin' | 'super_admin'
          department_id?: string | null
          batch_id?: string | null
          section_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          student_id?: string | null
          role?: 'user' | 'section_admin' | 'super_admin'
          department_id?: string | null
          batch_id?: string | null
          section_id?: string | null
          avatar_url?: string | null
          phone?: string | null
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          files: Json
          due_date: string | null
          category: string
          status: 'pending' | 'in_progress' | 'completed' | 'overdue'
          priority: 'low' | 'medium' | 'high'
          section_id: string
          created_by: string
          assigned_to: string[]
          is_published: boolean
          published_at: string | null
          completed_count: number
          total_assigned: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          files?: Json
          due_date?: string | null
          category?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
          priority?: 'low' | 'medium' | 'high'
          section_id: string
          created_by: string
          assigned_to?: string[]
          is_published?: boolean
          published_at?: string | null
          completed_count?: number
          total_assigned?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          files?: Json
          due_date?: string | null
          category?: string
          status?: 'pending' | 'in_progress' | 'completed' | 'overdue'
          priority?: 'low' | 'medium' | 'high'
          section_id?: string
          created_by?: string
          assigned_to?: string[]
          is_published?: boolean
          published_at?: string | null
          completed_count?: number
          total_assigned?: number
          created_at?: string
          updated_at?: string
        }
      }
      task_submissions: {
        Row: {
          id: string
          task_id: string
          user_id: string
          status: 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected'
          submission_text: string | null
          files: Json
          submitted_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          feedback: string | null
          grade: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          status?: 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected'
          submission_text?: string | null
          files?: Json
          submitted_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          feedback?: string | null
          grade?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          status?: 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected'
          submission_text?: string | null
          files?: Json
          submitted_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          feedback?: string | null
          grade?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          title: string
          description: string | null
          section_id: string
          day_of_week: number
          start_time: string
          end_time: string
          room: string | null
          subject: string | null
          instructor_name: string | null
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          section_id: string
          day_of_week: number
          start_time: string
          end_time: string
          room?: string | null
          subject?: string | null
          instructor_name?: string | null
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          section_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          room?: string | null
          subject?: string | null
          instructor_name?: string | null
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          user_email: string | null
          action: string
          resource_type: string
          resource_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          user_email?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'success' | 'warning' | 'error'
          is_read: boolean
          action_url: string | null
          metadata: Json
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          action_url?: string | null
          metadata?: Json
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'success' | 'warning' | 'error'
          is_read?: boolean
          action_url?: string | null
          metadata?: Json
          created_at?: string
          read_at?: string | null
        }
      }
    }
    Views: {
      index_usage_stats: {
        Row: {
          schemaname: string | null
          tablename: string | null
          indexname: string | null
          idx_tup_read: number | null
          idx_tup_fetch: number | null
          idx_scan: number | null
        }
      }
      unused_indexes: {
        Row: {
          schemaname: string | null
          tablename: string | null
          indexname: string | null
          index_size: string | null
        }
      }
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_section_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_section_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_department_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      update_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_table_statistics: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: 'user' | 'section_admin' | 'super_admin'
      task_status: 'pending' | 'in_progress' | 'completed' | 'overdue'
      task_priority: 'low' | 'medium' | 'high'
      submission_status: 'pending' | 'submitted' | 'reviewed' | 'approved' | 'rejected'
      notification_type: 'info' | 'success' | 'warning' | 'error'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific type exports for common usage
export type Department = Tables<'departments'>
export type Batch = Tables<'batches'>
export type Section = Tables<'sections'>
export type User = Tables<'users'>
export type Task = Tables<'tasks'>
export type TaskSubmission = Tables<'task_submissions'>
export type Routine = Tables<'routines'>
export type AuditLog = Tables<'audit_logs'>
export type Notification = Tables<'notifications'>

export type UserRole = Enums<'user_role'>
export type TaskStatus = Enums<'task_status'>
export type TaskPriority = Enums<'task_priority'>
export type SubmissionStatus = Enums<'submission_status'>
export type NotificationType = Enums<'notification_type'>

// Insert types
export type DepartmentInsert = TablesInsert<'departments'>
export type BatchInsert = TablesInsert<'batches'>
export type SectionInsert = TablesInsert<'sections'>
export type UserInsert = TablesInsert<'users'>
export type TaskInsert = TablesInsert<'tasks'>
export type TaskSubmissionInsert = TablesInsert<'task_submissions'>
export type RoutineInsert = TablesInsert<'routines'>
export type NotificationInsert = TablesInsert<'notifications'>

// Update types
export type DepartmentUpdate = TablesUpdate<'departments'>
export type BatchUpdate = TablesUpdate<'batches'>
export type SectionUpdate = TablesUpdate<'sections'>
export type UserUpdate = TablesUpdate<'users'>
export type TaskUpdate = TablesUpdate<'tasks'>
export type TaskSubmissionUpdate = TablesUpdate<'task_submissions'>
export type RoutineUpdate = TablesUpdate<'routines'>
export type NotificationUpdate = TablesUpdate<'notifications'>
