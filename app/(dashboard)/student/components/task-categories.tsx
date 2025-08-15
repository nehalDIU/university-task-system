"use client"

import { Button } from "@/components/ui/Button"
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
    { id: null, label: 'Total Tasks', icon: ListTodo, count: totalTasks, color: 'text-blue-600 dark:text-blue-400' },
    ...Object.entries(categoryConfig).map(([id, config]) => ({
      id: id as TaskCategory,
      label: config.label,
      icon: config.icon,
      count: categoryCounts[id] || 0,
      color: config.color
    }))
  ], [categoryCounts, totalTasks])

  return (
    <div className="mb-6 sm:mb-8">
      <div className="mb-4 sm:mb-6 px-3 xs:px-4 sm:px-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Task Categories
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              {totalTasks} total
            </span>
          </div>
        </div>
      </div>

      {/* Mobile: Clean scrollable categories */}
      <div className="block sm:hidden">
        <div className="flex gap-2 overflow-x-auto pb-4 px-4 scrollbar-hide">
          {allCategories.map(({ id, label, count, icon: Icon, color }) => (
            <button
              key={id || 'total'}
              onClick={() => onCategorySelect(id)}
              className={`
                group flex-shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl
                text-sm font-medium whitespace-nowrap min-h-[44px] 
                transition-all duration-200 transform active:scale-95
                ${selectedCategory === id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                }
              `}
            >
              {Icon && (
                <Icon className={`w-4 h-4 flex-shrink-0 ${selectedCategory === id ? 'text-white' : color || 'text-gray-500'}`} />
              )}
              <span className="truncate">
                {id === null ? 'All Tasks' : label}
              </span>
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 text-xs font-bold rounded-full min-w-[20px] text-center
                  ${selectedCategory === id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: Compact Layout (Mobile-like) */}
      <div className="hidden sm:block">
        <div className="flex flex-wrap gap-3 lg:gap-4">
          {allCategories.map(({ id, label, icon: Icon, count, color }, index) => (
            <button
              key={id || 'total'}
              onClick={() => onCategorySelect(id)}
              className={`
                group flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-medium whitespace-nowrap
                transition-all duration-300 transform hover:scale-105 focus:scale-105 active:scale-95
                shadow-professional hover:shadow-professional-lg focus-ring
                animate-fade-in
                ${selectedCategory === id
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                  : `bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 ${count === 0 ? 'opacity-60 hover:opacity-100' : ''}`
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Icon */}
              <Icon className={`w-4 h-4 flex-shrink-0 transition-colors duration-300 ${
                selectedCategory === id ? 'text-white' : color || 'text-gray-500 dark:text-gray-400'
              }`} />
              
              {/* Label */}
              <span className="truncate">
                {id === null ? 'All Tasks' : label}
              </span>
              
              {/* Count Badge */}
              {count > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center
                  transition-all duration-300
                  ${selectedCategory === id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }
                `}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
})

export default TaskCategories