'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { createBrowserClient } from '@/lib/supabase/client'
import type { User } from '@/lib/supabase/types'

export default function SectionMembers() {
  const [members, setMembers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<User | null>(null)

  const supabase = createBrowserClient()

  useEffect(() => {
    loadSectionMembers()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('section_members_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          loadSectionMembers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadSectionMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get admin's section
      const { data: adminData } = await supabase
        .from('users')
        .select('section_id')
        .eq('id', user.id)
        .single()

      if (!adminData?.section_id) return

      const { data } = await supabase
        .from('users')
        .select(`
          *,
          task_submissions (
            id,
            status,
            submitted_at
          )
        `)
        .eq('section_id', adminData.section_id)
        .neq('id', user.id) // Exclude current admin
        .order('name')

      setMembers(data || [])
    } catch (error) {
      console.error('Error loading section members:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from this section? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          is_active: false,
          section_id: null,
          batch_id: null 
        })
        .eq('id', memberId)

      if (error) {
        console.error('Delete member error:', error)
        return
      }

      loadSectionMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
    }
  }

  const handlePromoteMember = async () => {
    if (!selectedMember) return

    try {
      const { error } = await supabase
        .from('users')
        .update({ 
          role: 'section_admin'
        })
        .eq('id', selectedMember.id)

      if (error) {
        console.error('Promote member error:', error)
        return
      }

      setShowPromoteModal(false)
      setSelectedMember(null)
      loadSectionMembers()
    } catch (error) {
      console.error('Error promoting member:', error)
    }
  }

  const getMemberStats = (member: User) => {
    const submissions = member.task_submissions || []
    const completedSubmissions = submissions.filter((s: any) => s.status === 'submitted').length
    const totalSubmissions = submissions.length
    const completionRate = totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0
    
    return {
      completed: completedSubmissions,
      total: totalSubmissions,
      rate: completionRate
    }
  }

  const getLastActivity = (member: User) => {
    if (!member.last_login_at) return 'Never logged in'
    
    const lastLogin = new Date(member.last_login_at)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - lastLogin.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.student_id && member.student_id.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Section Members</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
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
          <h2 className="text-xl font-semibold">Section Members ({members.length})</h2>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Search members by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="p-6">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>No members found</p>
            {searchTerm && (
              <p className="text-sm">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMembers.map((member) => {
              const stats = getMemberStats(member)
              const initials = member.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2)
              
              return (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    {member.avatar_url ? (
                      <img
                        src={member.avatar_url}
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {initials}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{member.name}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                          member.role === 'section_admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.role === 'user' ? 'Student' : member.role.replace('_', ' ')}
                        </span>
                        {!member.is_active && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      <p className="text-xs text-gray-500">ID: {member.student_id || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    {/* Performance Stats */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Completion Rate</p>
                      <p className={`text-sm font-semibold ${
                        stats.rate >= 80 ? 'text-green-600' :
                        stats.rate >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {stats.rate}%
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">Submissions</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {stats.completed}/{stats.total}
                      </p>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">Last Active</p>
                      <p className="text-sm font-medium text-gray-600">
                        {getLastActivity(member)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {member.role === 'user' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedMember(member)
                            setShowPromoteModal(true)
                          }}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          Promote
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteMember(member.id, member.name)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Promote Member Modal */}
      <Modal
        isOpen={showPromoteModal}
        onClose={() => setShowPromoteModal(false)}
        title="Promote to Section Admin"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="text-amber-800 font-medium">Important Notice</h4>
                <p className="text-amber-700 text-sm mt-1">
                  Promoting a student to Section Admin will give them the ability to manage tasks, view all student data, 
                  and perform administrative functions. This action cannot be undone easily.
                </p>
              </div>
            </div>
          </div>

          {selectedMember && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Member Details</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {selectedMember.name}</p>
                <p><strong>Email:</strong> {selectedMember.email}</p>
                <p><strong>Student ID:</strong> {selectedMember.student_id}</p>
                <p><strong>Current Role:</strong> Student</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPromoteModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePromoteMember}
              className="bg-green-600 hover:bg-green-700"
            >
              Promote to Admin
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}



