import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Student Dashboard | University Task Management System',
  description: 'Manage your academic tasks, view schedules, track progress, and stay organized with your coursework. Access assignments, quizzes, projects, and deadlines all in one place.',
  keywords: 'student dashboard, task management, academic tasks, assignments, university, education, deadline tracking, course management',
  openGraph: {
    title: 'Student Dashboard | University Task Management',
    description: 'Manage your academic tasks and stay organized with your coursework',
    type: 'website',
  },
  robots: {
    index: false, // Private dashboard should not be indexed
    follow: false,
  }
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}



