'use client'

import { Button } from '@/components/ui/Button'

export default function DepartmentManager() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Department Management</h2>
          <Button>Add Department</Button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <h4 className="font-medium">Computer Science</h4>
              <p className="text-sm text-gray-600">150 Students, 12 Admins</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
            <div>
              <h4 className="font-medium">Electrical Engineering</h4>
              <p className="text-sm text-gray-600">120 Students, 8 Admins</p>
            </div>
            <Button variant="outline" size="sm">Manage</Button>
          </div>
        </div>
      </div>
    </div>
  )
}



