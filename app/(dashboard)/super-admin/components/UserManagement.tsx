'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User, Department, Batch, Section } from '@/lib/supabase/types'

interface UserWithDetails extends User {
  departments?: Department
  batches?: Batch
  sections?: Section
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'section_admin' | 'super_admin'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)
  const [pendingApprovals, setPendingApprovals] = useState<UserWithDetails[]>([])

  const supabase = createBrowserClient()

  useEffect(() => {
    loadUsers()
    loadPendingApprovals()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('super_admin_users_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          loadUsers()
          loadPendingApprovals()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select(`
          *,
          departments (name, code),
          batches (name),
          sections (name)
        `)
        .order('created_at', { ascending: false })

      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPendingApprovals = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select(`
          *,
          departments (name, code),
          batches (name),
          sections (name)
        `)
        .eq('role', 'section_admin')
        .eq('is_active', false)
        .order('created_at', { ascending: false })

      setPendingApprovals(data || [])
    } catch (error) {
      console.error('Error loading pending approvals:', error)
    }
  }

  const handleUpdateUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId)

      if (error) {
        console.error('Update user status error:', error)
        return
      }

      loadUsers()
      loadPendingApprovals()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleUpdateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) {
        console.error('Update user role error:', error)
        return
      }

      loadUsers()
      setShowEditModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${userName}? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      if (error) {
        console.error('Delete user error:', error)
        return
      }

      loadUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleApproveUser = async (userId: string) => {
    await handleUpdateUserStatus(userId, true)
    setShowApprovalModal(false)
    setSelectedUser(null)
  }

  const handleRejectUser = async (userId: string) => {
    if (!confirm('Are you sure you want to reject this application? The user account will be deleted.')) {
      return
    }

    try {
      await supabase
        .from('users')
        .delete()
        .eq('id', userId)

      loadUsers()
      loadPendingApprovals()
      setShowApprovalModal(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error rejecting user:', error)
    }
  }

  const getFilteredUsers = () => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.student_id && user.student_id.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesRole = roleFilter === 'all' || user.role === roleFilter

      let matchesStatus = true
      if (statusFilter === 'active') matchesStatus = user.is_active
      else if (statusFilter === 'inactive') matchesStatus = !user.is_active && user.role !== 'section_admin'
      else if (statusFilter === 'pending') matchesStatus = !user.is_active && user.role === 'section_admin'

      return matchesSearch && matchesRole && matchesStatus
    })
  }

  const getUserStats = () => {
    const total = users.length
    const active = users.filter(u => u.is_active).length
    const admins = users.filter(u => u.role === 'section_admin' || u.role === 'super_admin').length
    const pending = pendingApprovals.length

    return { total, active, admins, pending }
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-100 text-red-800'
      case 'section_admin':
        return 'bg-purple-100 text-purple-800'
      case 'user':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredUsers = getFilteredUsers()
  const stats = getUserStats()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">User Management</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">User Management</h2>
          {pendingApprovals.length > 0 && (
            <Button
              onClick={() => setShowApprovalModal(true)}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {pendingApprovals.length} Pending Approvals
            </Button>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
            <p className="text-blue-600 text-sm">Total Users</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-green-600 text-sm">Active Users</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-700">{stats.admins}</p>
            <p className="text-purple-600 text-sm">Administrators</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
            <p className="text-orange-600 text-sm">Pending Approval</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <Input
              type="text"
              placeholder="Search users by name, email, or student ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="all">All Roles</option>
            <option value="user">Students</option>
            <option value="section_admin">Section Admins</option>
            <option value="super_admin">Super Admins</option>
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending Approval</option>
          </Select>
        </div>
      </div>
      
      <div className="p-6">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No users found matching your criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const initials = user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
                  
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {initials}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.student_id && (
                              <div className="text-xs text-gray-400">ID: {user.student_id}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getRoleColor(user.role)}`}>
                          {user.role === 'user' ? 'Student' : user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{user.departments?.name || 'N/A'}</div>
                          {user.batches?.name && user.sections?.name && (
                            <div className="text-xs text-gray-500">
                              {user.batches.name} - {user.sections.name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : user.role === 'section_admin' 
                              ? 'bg-orange-100 text-orange-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : user.role === 'section_admin' ? 'Pending' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatLastLogin(user.last_login_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setShowEditModal(true)
                            }}
                          >
                            Edit
                          </Button>
                          {user.is_active ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateUserStatus(user.id, false)}
                              className="text-orange-600 border-orange-600 hover:bg-orange-50"
                            >
                              Deactivate
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateUserStatus(user.id, true)}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                            >
                              Activate
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">User Information</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Student ID:</strong> {selectedUser.student_id}</p>
                <p><strong>Current Role:</strong> {selectedUser.role}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Change Role
              </label>
              <Select
                value={selectedUser.role}
                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })}
              >
                <option value="user">Student</option>
                <option value="section_admin">Section Admin</option>
                <option value="super_admin">Super Admin</option>
              </Select>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleUpdateUserRole(selectedUser.id, selectedUser.role)}
              >
                Update Role
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Pending Approvals Modal */}
      <Modal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        title="Pending Section Admin Approvals"
        className="max-w-4xl"
      >
        <div className="space-y-4">
          {pendingApprovals.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No pending approvals</p>
          ) : (
            <div className="space-y-4">
              {pendingApprovals.map((user) => (
                <div key={user.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{user.name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-sm text-gray-500">
                        {user.departments?.name} - {user.batches?.name} - {user.sections?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Applied: {new Date(user.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApproveUser(user.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectUser(user.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}