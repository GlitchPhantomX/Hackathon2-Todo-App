'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flag } from 'lucide-react'
import { format } from 'date-fns'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { getUpcomingTasks } from '@/lib/task-utils'
import { Task } from '../../types/task.types'
import { TaskListSkeleton } from './skeletons'

type Priority = 'high' | 'medium' | 'low'

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  high: { color: 'bg-error-500', label: 'High' },
  medium: { color: 'bg-warning-500', label: 'Medium' },
  low: { color: 'bg-gray-400 dark:bg-gray-600', label: 'Low' },
}

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTasks() {
      try {
        const userId = await getCurrentUserId()
        const allTasks = await taskService.getTasks(userId)
        const upcoming = getUpcomingTasks(allTasks, 3)
        setTasks(upcoming)
      } catch (error) {
        console.error('Failed to fetch upcoming tasks:', error)
        setErrorState(error as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
    const interval = setInterval(fetchTasks, 30000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="p-6">
        <TaskListSkeleton />
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Upcoming Tasks
        </h3>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No upcoming tasks
          </p>
        ) : (
          tasks.map((task) => {
            const priority: Priority = task.priority ?? 'medium'

            return (
              <div
                key={task.id}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50 flex-1">
                    {task.title}
                  </p>

                  <Badge
                    variant="secondary"
                    className={`${priorityConfig[priority].color} text-white gap-1`}
                  >
                    <Flag className="w-3 h-3 fill-current" />
                    {priorityConfig[priority].label}
                  </Badge>
                </div>

                {task.dueDate && (
                  <div className="flex items-center gap-2 text-body-xs text-gray-500 dark:text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {format(new Date(task.dueDate), 'MMM d, h:mm a')}
                    </span>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
