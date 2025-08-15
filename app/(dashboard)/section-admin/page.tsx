import { Suspense } from 'react'
import AdminOverview from './components/AdminOverview'
import TaskManager from './components/TaskManager'
import SectionMembers from './components/SectionMembers'
import RoutineManager from './components/RoutineManager'
import TaskAnalytics from './components/TaskAnalytics'
import RecentActivity from './components/RecentActivity'
import { Loader } from '@/components/ui/Loader'

export default function SectionAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Section Admin Dashboard</h1>
        <p className="text-indigo-100">
          Manage your section's tasks, schedules, and students. Monitor progress and ensure academic success.
        </p>
      </div>

      {/* Overview Cards */}
      <Suspense fallback={<Loader />}>
        <AdminOverview />
      </Suspense>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Primary Management */}
        <div className="xl:col-span-2 space-y-6">
          <Suspense fallback={<Loader />}>
            <TaskManager />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <SectionMembers />
          </Suspense>
        </div>
        
        {/* Right Column - Analytics & Tools */}
        <div className="space-y-6">
          <Suspense fallback={<Loader />}>
            <TaskAnalytics />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <RoutineManager />
          </Suspense>
          
          <Suspense fallback={<Loader />}>
            <RecentActivity />
          </Suspense>
        </div>
      </div>
    </div>
  )
}