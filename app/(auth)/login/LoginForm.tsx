'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createBrowserClient } from '@/lib/supabase/client'
import { loginSchema } from '@/lib/validators/authSchemas'
import type { LoginData } from '@/types/auth'

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Partial<LoginData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = loginSchema.parse(formData)
      
      // Create Supabase client
      const supabase = createBrowserClient()
      
      // Attempt to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        // Redirect based on user role
        // This would need to be implemented based on user metadata
        router.push('/student') // Default redirect
      }
    } catch (error: any) {
      if (error.issues) {
        // Zod validation errors
        const fieldErrors: Partial<LoginData> = {}
        error.issues.forEach((issue: any) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof LoginData] = issue.message
          }
        })
        setErrors(fieldErrors)
      } else {
        // Authentication errors
        setErrors({ email: error.message })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof LoginData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
              <div>
          <Input
            type="email"
            name="email"
            placeholder="yourname@diu.edu.bd"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />
        </div>
      
              <div>
          <Input
            type="password"
            name="password"
            placeholder="Password (minimum 8 characters)"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
          />
        </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  )
}
