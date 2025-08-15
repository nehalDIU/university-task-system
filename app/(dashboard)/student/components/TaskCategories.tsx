'use client'

import React from 'react'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type TaskCategory = 
  | 'task'
  | 'presentation' 
  | 'project'
  | 'assignment'
  | 'quiz'
  | 'lab-report'
  | 'lab-final'
  | 'lab-performance'
  | 'documents'
  | 'blc'
  | 'groups'
  | 'others'

interface TaskCategoriesProps {
  onCategorySelect: (category: TaskCategory | null) => void
  selectedCategory: TaskCategory | null
  categoryCounts: Record<TaskCategory, number>
}

export const TaskCategories: React.FC<TaskCategoriesProps> = ({
  onCategorySelect,
  selectedCategory,
  categoryCounts
}) => {
  // Calculate total tasks from all categories
  const totalTasks = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)

  const allCategories = [
    { 
      id: null, 
      label: 'All Tasks', 
      icon: ListTodo, 
      count: totalTasks,
      description: 'View all academic tasks and assignments'
    },
    { 
      id: 'task' as TaskCategory, 
      label: 'Task', 
      icon: BookOpen, 
      count: categoryCounts['task'] || 0,
      description: 'General academic tasks and activities'
    },
    { 
      id: 'presentation' as TaskCategory, 
      label: 'Presentation', 
      icon: Presentation, 
      count: categoryCounts['presentation'] || 0,
      description: 'Oral presentations and speaking assignments'
    },
    { 
      id: 'project' as TaskCategory, 
      label: 'Project', 
      icon: Folder, 
      count: categoryCounts['project'] || 0,
      description: 'Long-term projects and research work'
    },
    { 
      id: 'assignment' as TaskCategory, 
      label: 'Assignment', 
      icon: PenSquare, 
      count: categoryCounts['assignment'] || 0,
      description: 'Written assignments and homework'
    },
    { 
      id: 'quiz' as TaskCategory, 
      label: 'Quiz', 
      icon: GraduationCap, 
      count: categoryCounts['quiz'] || 0,
      description: 'Quizzes and short assessments'
    },
    { 
      id: 'lab-report' as TaskCategory, 
      label: 'Lab Report', 
      icon: Beaker, 
      count: categoryCounts['lab-report'] || 0,
      description: 'Laboratory reports and documentation'
    },
    { 
      id: 'lab-final' as TaskCategory, 
      label: 'Lab Final', 
      icon: Microscope, 
      count: categoryCounts['lab-final'] || 0,
      description: 'Final laboratory examinations'
    },
    { 
      id: 'lab-performance' as TaskCategory, 
      label: 'Lab Performance', 
      icon: Activity, 
      count: categoryCounts['lab-performance'] || 0,
      description: 'Laboratory performance evaluations'
    },
    { 
      id: 'documents' as TaskCategory, 
      label: 'Documents', 
      icon: FileText, 
      count: categoryCounts['documents'] || 0,
      description: 'Document submissions and paperwork'
    },
    { 
      id: 'blc' as TaskCategory, 
      label: 'BLC', 
      icon: Building, 
      count: categoryCounts['blc'] || 0,
      description: 'BLC related tasks and activities'
    },
    { 
      id: 'groups' as TaskCategory, 
      label: 'Groups', 
      icon: Users, 
      count: categoryCounts['groups'] || 0,
      description: 'Group work and collaborative projects'
    },
    { 
      id: 'others' as TaskCategory, 
      label: 'Others', 
      icon: MoreHorizontal, 
      count: categoryCounts['others'] || 0,
      description: 'Miscellaneous tasks and activities'
    },
  ]

  return (
    <section 
      className="mb-6"
      role="region"
      aria-labelledby="task-categories-heading"
    >
      {/* SEO-optimized heading */}
      <header className="mb-4">
        <h2 
          id="task-categories-heading"
          className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          Academic Task Categories
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 sr-only">
          Filter your academic tasks by category to better organize your studies and assignments
        </p>
      </header>

      {/* Mobile: Fully scrollable categories */}
      <div className="block sm:hidden">
        <nav 
          role="tablist"
          aria-label="Task category filters"
          className="flex gap-2 overflow-x-auto pb-3 px-3 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map(({ id, label, icon: Icon, count, description }) => (
            <button
              key={id || 'total'}
              role="tab"
              aria-selected={selectedCategory === id}
              aria-controls="task-list"
              aria-describedby={`category-${id || 'all'}-desc`}
              onClick={() => onCategorySelect(id)}
              className={cn(
                'flex-shrink-0 px-3 py-2.5 rounded-full',
                'text-sm font-medium whitespace-nowrap min-h-[44px]',
                'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500',
                selectedCategory === id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              <span className="sr-only" id={`category-${id || 'all'}-desc`}>
                {description}. {count} tasks available.
              </span>
              <span aria-hidden="true">
                {id === null ? 'All' : label}
                {count > 0 && (
                  <span className="ml-1 text-xs opacity-75">({count})</span>
                )}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:block">
        <nav 
          role="tablist"
          aria-label="Task category filters"
          className="space-y-3"
        >
          {/* Grid for categories */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {allCategories.map(({ id, label, icon: Icon, count, description }) => (
              <button
                key={id || 'total'}
                role="tab"
                aria-selected={selectedCategory === id}
                aria-controls="task-list"
                aria-describedby={`category-${id || 'all'}-desc`}
                onClick={() => onCategorySelect(id)}
                className={cn(
                  'group flex items-center gap-2 p-3 sm:p-4 rounded-xl transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                  'hover:shadow-md hover:-translate-y-0.5',
                  selectedCategory === id
                    ? 'bg-blue-600 text-white shadow-lg scale-[1.02]'
                    : cn(
                        'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                        'hover:bg-gray-50 dark:hover:bg-gray-700',
                        count === 0 ? 'opacity-60 hover:opacity-100' : ''
                      )
                )}
              >
                <div 
                  className={cn(
                    'p-2 rounded-lg transition-colors duration-200 flex-shrink-0',
                    selectedCategory === id
                      ? 'bg-blue-500/20'
                      : 'bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  )}
                  aria-hidden="true"
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="text-sm font-medium truncate">
                    {label}
                  </div>
                  <div 
                    className={cn(
                      'text-xs',
                      selectedCategory === id 
                        ? 'opacity-80' 
                        : (count === 0 ? 'opacity-60 group-hover:opacity-80' : 'opacity-80')
                    )}
                  >
                    {count} task{count !== 1 ? 's' : ''}
                  </div>
                </div>
                <span 
                  className="sr-only" 
                  id={`category-${id || 'all'}-desc`}
                >
                  {description}
                </span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Selected category indicator */}
      {selectedCategory && (
        <div 
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Showing {categoryCounts[selectedCategory] || 0} {
                allCategories.find(cat => cat.id === selectedCategory)?.label.toLowerCase() || 'tasks'
              }
            </span>
            <button
              onClick={() => onCategorySelect(null)}
              className="text-xs text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 px-2 py-1 rounded"
              aria-label="Clear category filter and show all tasks"
            >
              Clear filter
            </button>
          </div>
        </div>
      )}

      {/* Hidden schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": "Academic Task Categories",
            "description": "Categorized view of academic tasks and assignments",
            "numberOfItems": allCategories.length,
            "itemListElement": allCategories.map((category, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "name": category.label,
              "description": category.description,
              "url": `#category-${category.id || 'all'}`
            }))
          })
        }}
      />
    </section>
  )
}
