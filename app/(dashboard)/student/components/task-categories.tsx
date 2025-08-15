"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  PenSquare,
  Presentation,
  Beaker,
  Microscope,
  ListTodo,
  FileText,
  Users,
  Building,
  Activity,
  Folder,
  PencilRuler,
  GraduationCap,
  MoreHorizontal
} from "lucide-react"
import { memo, useMemo } from "react"

type TaskCategory =
  | 'presentation'
  | 'assignment'
  | 'quiz'
  | 'lab-report'
  | 'lab-final'
  | 'lab-performance'
  | 'task'
  | 'documents'
  | 'blc'
  | 'groups'
  | 'project'
  | 'midterm'
  | 'final-exam'
  | 'others'

interface TaskCategoriesProps {
  onCategorySelect: (category: TaskCategory | null) => void
  selectedCategory: TaskCategory | null
  categoryCounts: Record<string, number>
}

// Optimized category configuration with proper icons and colors
const categoryConfig = {
  'task': { label: 'Task', icon: BookOpen, color: 'text-blue-600 dark:text-blue-400' },
  'presentation': { label: 'Presentation', icon: Presentation, color: 'text-red-600 dark:text-red-400' },
  'project': { label: 'Project', icon: Folder, color: 'text-indigo-600 dark:text-indigo-400' },
  'assignment': { label: 'Assignment', icon: PenSquare, color: 'text-orange-600 dark:text-orange-400' },
  'quiz': { label: 'Quiz', icon: BookOpen, color: 'text-purple-600 dark:text-purple-400' },
  'lab-report': { label: 'Lab Report', icon: Beaker, color: 'text-green-600 dark:text-green-400' },
  'lab-final': { label: 'Lab Final', icon: Microscope, color: 'text-purple-600 dark:text-purple-400' },
  'lab-performance': { label: 'Lab Performance', icon: Activity, color: 'text-pink-600 dark:text-pink-400' },
  'documents': { label: 'Documents', icon: FileText, color: 'text-yellow-600 dark:text-yellow-400' },
  'blc': { label: 'BLC', icon: Building, color: 'text-cyan-600 dark:text-cyan-400' },
  'groups': { label: 'Groups', icon: Users, color: 'text-teal-600 dark:text-teal-400' },
  'midterm': { label: 'Midterms', icon: GraduationCap, color: 'text-amber-600 dark:text-amber-400' },
  'final-exam': { label: 'Final Exams', icon: GraduationCap, color: 'text-rose-600 dark:text-rose-400' },
  'others': { label: 'Others', icon: MoreHorizontal, color: 'text-gray-600 dark:text-gray-400' }
} as const

const TaskCategories = memo(function TaskCategories({
  onCategorySelect,
  selectedCategory,
  categoryCounts
}: TaskCategoriesProps) {
  // Calculate total tasks from all categories
  const totalTasks = useMemo(() =>
    Object.values(categoryCounts).reduce((sum, count) => sum + count, 0),
    [categoryCounts]
  )

  // Memoize all categories including total
  const allCategories = useMemo(() => [
    { id: null, label: 'Total Tasks', icon: ListTodo, count: totalTasks },
    ...Object.entries(categoryConfig).map(([id, config]) => ({
      id: id as TaskCategory,
      label: config.label,
      icon: config.icon,
      count: categoryCounts[id] || 0,
      color: config.color
    }))
  ], [categoryCounts, totalTasks])

  return (
    <div className="mb-3 sm:mb-4">
      <div className="mb-3 sm:mb-4 px-3 xs:px-4 sm:px-0">
        <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          Tasks
        </h2>
      </div>

      {/* Mobile: Fully scrollable categories */}
      <div className="block sm:hidden">
        <div className="flex gap-2 xs:gap-3 overflow-x-auto pb-3 px-3 xs:px-4 scrollbar-hide">
          {allCategories.map(({ id, label, count }) => (
            <button
              key={id || 'total'}
              onClick={() => onCategorySelect(id)}
              className={`
                flex-shrink-0 px-2.5 xs:px-3 py-2 xs:py-2.5 rounded-full
                text-sm font-medium whitespace-nowrap
                min-h-[44px] transition-all duration-200
                ${selectedCategory === id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
            >
              {id === null ? 'All' : label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:block">
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {allCategories.map(({ id, label, icon: Icon, count, color }) => (
              <button
                key={id || 'total'}
                onClick={() => onCategorySelect(id)}
                className={`
                  group flex items-center gap-2 p-3 sm:p-4 rounded-xl transition-all duration-200
                  ${selectedCategory === id
                    ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                    : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 ${count === 0 ? 'opacity-60 hover:opacity-100' : ''}`
                  }
                  hover:shadow-md hover:-translate-y-0.5
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors duration-200 flex-shrink-0
                  ${selectedCategory === id
                    ? 'bg-blue-500/20'
                    : 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  }
                `}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${selectedCategory === id ? 'text-white' : color || 'text-blue-600 dark:text-blue-400'}`} />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">{label}</div>
                  <div className={`text-xs ${selectedCategory === id ? 'opacity-80' : (count === 0 ? 'opacity-60 group-hover:opacity-80' : 'opacity-80')}`}>
                    {count} task{count !== 1 ? 's' : ''}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
})

export default TaskCategories
