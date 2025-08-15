'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { createBrowserClient } from '@/lib/supabase/client'
import { signupSchema } from '@/lib/validators/authSchemas'
import type { SignupData } from '@/lib/validators/authSchemas'
import type { Department, Batch, Section } from '@/lib/supabase/types'

export default function SignupForm() {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    studentId: '',
    role: 'user',
    departmentId: '',
    batchId: '',
    sectionId: '',
  })
  const [errors, setErrors] = useState<Partial<SignupData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [batches, setBatches] = useState<Batch[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loadingBatches, setLoadingBatches] = useState(false)
  const [loadingSections, setLoadingSections] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient()

  // Load departments on mount
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select('*')
          .order('name')

        if (error) {
          console.error('Error loading departments:', error)
          return
        }

        setDepartments(data || [])
      } catch (error) {
        console.error('Error loading departments:', error)
      }
    }

    loadDepartments()
  }, [supabase])

  // Load batches when department changes
  useEffect(() => {
    const loadBatches = async () => {
      if (!formData.departmentId) {
        setBatches([])
        setSections([])
        setFormData(prev => ({ ...prev, batchId: '', sectionId: '' }))
        return
      }

      setLoadingBatches(true)
      try {
        const { data, error } = await supabase
          .from('batches')
          .select('*')
          .eq('department_id', formData.departmentId)
          .order('name')

        if (error) {
          console.error('Error loading batches:', error)
          return
        }

        setBatches(data || [])
        setSections([])
        setFormData(prev => ({ ...prev, batchId: '', sectionId: '' }))
      } catch (error) {
        console.error('Error loading batches:', error)
      } finally {
        setLoadingBatches(false)
      }
    }

    loadBatches()
  }, [formData.departmentId, supabase])

  // Load sections when batch changes
  useEffect(() => {
    const loadSections = async () => {
      if (!formData.batchId) {
        setSections([])
        setFormData(prev => ({ ...prev, sectionId: '' }))
        return
      }

      setLoadingSections(true)
      try {
        const { data, error } = await supabase
          .from('sections')
          .select('*')
          .eq('batch_id', formData.batchId)
          .order('name')

        if (error) {
          console.error('Error loading sections:', error)
          return
        }

        setSections(data || [])
        setFormData(prev => ({ ...prev, sectionId: '' }))
      } catch (error) {
        console.error('Error loading sections:', error)
      } finally {
        setLoadingSections(false)
      }
    }

    loadSections()
  }, [formData.batchId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = signupSchema.parse(formData)
      
      // Check if student ID already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('student_id')
        .eq('student_id', validatedData.studentId)
        .single()

      if (existingUser && !checkError) {
        setErrors({ studentId: 'Student ID already exists' })
        return
      }

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            name: validatedData.name,
            student_id: validatedData.studentId,
            role: validatedData.role,
            department_id: validatedData.departmentId,
            batch_id: validatedData.batchId,
            section_id: validatedData.sectionId,
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (authData.user) {
        // Insert user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: validatedData.email,
            name: validatedData.name,
            student_id: validatedData.studentId,
            role: validatedData.role,
            department_id: validatedData.departmentId,
            batch_id: validatedData.batchId,
            section_id: validatedData.sectionId,
            is_active: validatedData.role === 'user', // Section admin needs approval
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Show appropriate message based on role
        if (validatedData.role === 'section_admin') {
          router.push('/login?message=Account created successfully! Please wait for admin approval before logging in.')
        } else {
          router.push('/login?message=Account created successfully! Please check your email to verify your account.')
        }
      }
    } catch (error: any) {
      if (error.issues) {
        // Zod validation errors
        const fieldErrors: Partial<SignupData> = {}
        error.issues.forEach((issue: any) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof SignupData] = issue.message
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof SignupData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">
          Join NestTask - University Task Management System
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              name="email"
              placeholder="yourname@diu.edu.bd"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Must use your university email (@diu.edu.bd)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Student ID <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              name="studentId"
              placeholder="e.g., CSE-2024-001"
              value={formData.studentId}
              onChange={handleChange}
              error={errors.studentId}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Your unique student identification number</p>
          </div>
        </div>

        {/* Academic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              required
            >
              <option value="user">Student</option>
              <option value="section_admin">Section Admin (Requires Approval)</option>
            </Select>
            {formData.role === 'section_admin' && (
              <p className="text-xs text-amber-600 mt-1 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Section admin accounts require approval from a super admin
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department <span className="text-red-500">*</span>
            </label>
            <Select
              name="departmentId"
              value={formData.departmentId}
              onChange={handleChange}
              error={errors.departmentId}
              required
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name} ({department.code})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Batch <span className="text-red-500">*</span>
            </label>
            <Select
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              error={errors.batchId}
              disabled={!formData.departmentId || loadingBatches}
              required
            >
              <option value="">
                {loadingBatches ? 'Loading batches...' : 'Select Batch'}
              </option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section <span className="text-red-500">*</span>
            </label>
            <Select
              name="sectionId"
              value={formData.sectionId}
              onChange={handleChange}
              error={errors.sectionId}
              disabled={!formData.batchId || loadingSections}
              required
            >
              <option value="">
                {loadingSections ? 'Loading sections...' : 'Select Section'}
              </option>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Security</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </div>
  )
}