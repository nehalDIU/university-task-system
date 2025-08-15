export default function SectionAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900">Section Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage your section's tasks, schedules, and student progress.
        </p>
      </div>
      {children}
    </div>
  )
}



