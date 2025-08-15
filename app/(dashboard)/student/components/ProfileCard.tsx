'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import type { User, Department, Batch, Section } from '@/lib/supabase/types'

interface UserWithDetails extends User {
  departments?: Department
  batches?: Batch
  sections?: Section
}

export default function ProfileCard() {
  const [user, setUser] = useState<UserWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadUserProfile()
  }, [])

  const loadUserProfile = async () => {
    try {
      const supabase = createBrowserClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (!authUser) return

      const { data } = await supabase
        .from('users')
        .select(`
          *,
          departments (name, code),
          batches (name),
          sections (name)
        `)
        .eq('id', authUser.id)
        .single()

      if (data) {
        setUser(data)
        setEditData({
          name: data.name || '',
          phone: data.phone || '',
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!user) return

    setIsUpdating(true)
    try {
      const supabase = createBrowserClient()
      
      const { error } = await supabase
        .from('users')
        .update({
          name: editData.name,
          phone: editData.phone,
        })
        .eq('id', user.id)

      if (error) {
        console.error('Update error:', error)
        return
      }

      await loadUserProfile()
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const formatLastLogin = (lastLogin: string | null) => {
    if (!lastLogin) return 'Never'
    return new Date(lastLogin).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded mb-2"></div>
          <div className="h-3 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-300 rounded"></div>
            <div className="h-3 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-gray-500">
          <p>Unable to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="text-center mb-6">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
            />
          ) : (
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg">
              {getInitials(user.name)}
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {user.name}
          </h3>
          
          <p className="text-gray-600 text-sm mb-2">
            {user.email}
          </p>

          <div className="flex items-center justify-center">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full capitalize">
              {user.role === 'user' ? 'Student' : user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
        
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Student ID</span>
              <span className="font-medium text-gray-900">{user.student_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Phone</span>
              <span className="font-medium text-gray-900">{user.phone || 'Not set'}</span>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Department:</span>
              <span className="font-medium text-gray-900">
                {user.departments?.code || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Batch:</span>
              <span className="font-medium text-gray-900">
                {user.batches?.name || 'N/A'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-500">Section:</span>
              <span className="font-medium text-gray-900">
                {user.sections?.name || 'N/A'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Last Login:</span>
              <span className="font-medium text-gray-900">
                {formatLastLogin(user.last_login_at)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${
                user.is_active ? 'text-green-600' : 'text-red-600'
              }`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={() => setShowEditModal(true)}
            className="w-full"
            variant="outline"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <Input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <Input
              type="tel"
              value={editData.phone}
              onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Academic Information</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Email:</strong> {user.email} (Cannot be changed)</p>
              <p><strong>Student ID:</strong> {user.student_id} (Cannot be changed)</p>
              <p><strong>Department:</strong> {user.departments?.name} (Cannot be changed)</p>
              <p><strong>Section:</strong> {user.batches?.name} - {user.sections?.name} (Cannot be changed)</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdating || !editData.name.trim()}
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}