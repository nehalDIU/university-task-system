import { Suspense } from 'react'
import SystemOverview from './components/SystemOverview'
import UserManagement from './components/UserManagement'
import DepartmentManager from './components/DepartmentManager'
import SystemAnalytics from './components/SystemAnalytics'
import AuditLogs from './components/AuditLogs'
import TaskOverview from './components/TaskOverview'
import { Loader } from '@/components/ui/Loader'

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-purple-100">
          Complete system oversight and management. Monitor all departments, users, and activities across the platform.
        </p>
      </div>

      {/* System Overview */}
      <Suspense fallback={<Loader />}>
        <SystemOverview />
      </Suspense>

      {/* Main Management Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - User & Department Management */}
        <div className="xl:col-span-2 space-y-6">
          <Suspense fallback={<Loader />}>
            <UserManagement />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <TaskOverview />
          </Suspense>
        </div>
        
        {/* Right Column - Analytics & Monitoring */}
        <div className="space-y-6">
          <Suspense fallback={<Loader />}>
            <SystemAnalytics />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <DepartmentManager />
          </Suspense>
        </div>
      </div>

      {/* Full Width - Audit Logs */}
      <Suspense fallback={<Loader />}>
        <AuditLogs />
      </Suspense>
    </div>
  )
}