"use client"

import { useState, memo, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { TaskCard } from "./task-card"
import { Task, transformDatabaseTask, DatabaseTask } from "@/types/task"

interface EnhancedTaskListProps {
  tasks: DatabaseTask[]
  showDeleteButton?: boolean
}

// Task selection handler for modal or navigation
const handleTaskSelect = (task: Task) => {
  // For now, navigate to edit page - can be extended for modal
  window.location.href = `/tasks/${task.id}`
}

const EnhancedTaskList = memo(function EnhancedTaskList({
  tasks,
  showDeleteButton = true
}: EnhancedTaskListProps) {
  // Transform database tasks to application tasks
  const transformedTasks = useMemo(() =>
    tasks.map(task => transformDatabaseTask(task)),
    [tasks]
  )

  if (transformedTasks.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent className="pt-6">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You don't have any tasks matching the current filters.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile: Single column grid */}
      <div className="block sm:hidden space-y-4">
        {transformedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onSelect={handleTaskSelect}
          />
        ))}
      </div>

      {/* Desktop: Multi-column grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {transformedTasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            index={index}
            onSelect={handleTaskSelect}
          />
        ))}
      </div>
    </div>
  )
})

export default EnhancedTaskList
