'use client'

import { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'

interface SectionSelectProps {
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  batchId: string
  error?: string
  required?: boolean
}

interface Section {
  id: string
  name: string
  batchId: string
}

const mockSections: Section[] = [
  { id: 'a-2024-cs', name: 'Section A', batchId: '2024-cs' },
  { id: 'b-2024-cs', name: 'Section B', batchId: '2024-cs' },
  { id: 'a-2023-cs', name: 'Section A', batchId: '2023-cs' },
  { id: 'b-2023-cs', name: 'Section B', batchId: '2023-cs' },
  { id: 'a-2024-ee', name: 'Section A', batchId: '2024-ee' },
  { id: 'b-2024-ee', name: 'Section B', batchId: '2024-ee' },
]

export function SectionSelect({ name, value, onChange, batchId, error, required }: SectionSelectProps) {
  const [sections, setSections] = useState<Section[]>([])

  useEffect(() => {
    if (batchId) {
      const filteredSections = mockSections.filter(section => section.batchId === batchId)
      setSections(filteredSections)
    } else {
      setSections([])
    }
  }, [batchId])

  return (
    <Select
      name={name}
      value={value}
      onChange={onChange}
      error={error}
      required={required}
      disabled={!batchId}
    >
      <option value="">Select Section</option>
      {sections.map((section) => (
        <option key={section.id} value={section.id}>
          {section.name}
        </option>
      ))}
    </Select>
  )
}



