import { z } from 'zod'

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select a priority level',
  }),
  assignedTo: z.array(z.string()).min(1, 'At least one assignee is required'),
})

export const updateTaskSchema = taskSchema.partial().extend({
  id: z.string().min(1, 'Task ID is required'),
  status: z.enum(['pending', 'in-progress', 'completed', 'overdue']).optional(),
})

export const createTaskSchema = taskSchema

export type TaskData = z.infer<typeof taskSchema>
export type UpdateTaskData = z.infer<typeof updateTaskSchema>
export type CreateTaskData = z.infer<typeof createTaskSchema>



