'use client'

import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'

interface DepartmentSelectProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  error?: string
  required?: boolean
}

interface Department {
  id: string
  name: string
}

const mockDepartments: Department[] = [
  { id: 'cs', name: 'Computer Science' },
  { id: 'ee', name: 'Electrical Engineering' },
  { id: 'me', name: 'Mechanical Engineering' },
  { id: 'ce', name: 'Civil Engineering' },
  { id: 'chem', name: 'Chemical Engineering' },
]

export function DepartmentSelect({ name, value, onChange, error, required }: DepartmentSelectProps) {
  const [departments] = useState<Department[]>(mockDepartments)

  return (
    <Select
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
    >
      <option value="">Select Department</option>
      {departments.map((department) => (
        <option key={department.id} value={department.id}>
          {department.name}
        </option>
      ))}
    </Select>
  )
}



