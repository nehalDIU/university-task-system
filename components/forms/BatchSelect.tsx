'use client'

import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'

interface BatchSelectProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  departmentId: string
  error?: string
  required?: boolean
}

interface Batch {
  id: string
  name: string
  departmentId: string
}

const mockBatches: Batch[] = [
  { id: '2024-cs', name: '2024', departmentId: 'cs' },
  { id: '2023-cs', name: '2023', departmentId: 'cs' },
  { id: '2024-ee', name: '2024', departmentId: 'ee' },
  { id: '2023-ee', name: '2023', departmentId: 'ee' },
  { id: '2024-me', name: '2024', departmentId: 'me' },
  { id: '2023-me', name: '2023', departmentId: 'me' },
]

export function BatchSelect({ name, value, onChange, departmentId, error, required }: BatchSelectProps) {
  const [batches, setBatches] = useState<Batch[]>([])

  useEffect(() => {
    if (departmentId) {
      const filteredBatches = mockBatches.filter(batch => batch.departmentId === departmentId)
      setBatches(filteredBatches)
    } else {
      setBatches([])
    }
  }, [departmentId])

  return (
    <Select
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={!departmentId}
    >
      <option value="">Select Batch</option>
      {batches.map((batch) => (
        <option key={batch.id} value={batch.id}>
          {batch.name}
        </option>
      ))}
    </Select>
  )
}



