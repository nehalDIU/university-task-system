import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .refine((email) => email.endsWith('@diu.edu.bd'), {
      message: 'Email must be from @diu.edu.bd domain'
    }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const signupSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .refine((email) => email.endsWith('@diu.edu.bd'), {
      message: 'Email must be from @diu.edu.bd domain'
    }),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  studentId: z.string().min(5, 'Student ID must be at least 5 characters'),
  role: z.enum(['user', 'section_admin'], {
    required_error: 'Please select a role',
  }),
  departmentId: z.string().min(1, 'Please select a department'),
  batchId: z.string().min(1, 'Please select a batch'),
  sectionId: z.string().min(1, 'Please select a section'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const resetPasswordSchema = z.object({
  email: z.string()
    .email('Invalid email address')
    .refine((email) => email.endsWith('@diu.edu.bd'), {
      message: 'Email must be from @diu.edu.bd domain'
    }),
})

export type LoginData = z.infer<typeof loginSchema>
export type SignupData = z.infer<typeof signupSchema>
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>
