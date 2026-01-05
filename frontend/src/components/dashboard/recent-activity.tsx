'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { getRecentActivity } from '@/lib/task-utils'
import { Task } from '../../types/task.types'
import { TaskListSkeleton } from './skeletons'

export function RecentActivity() {
  const [activities, setActivities] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [errorState, setErrorState] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const userId = await getCurrentUserId()
        const tasks = await taskService.getTasks(userId)
        const recent = getRecentActivity(tasks, 5)
        setActivities(recent)
      } catch (error) {
        console.error('Failed to fetch activity:', error)
        setErrorState(error as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchActivity, 30000)
    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (task: Task) => {
    if (task.completed) return CheckCircle2
    if (task.dueDate && new Date(task.dueDate) < new Date()) return AlertCircle
    return Clock
  }

  const getActivityColor = (task: Task) => {
    if (task.completed) return 'text-success-600 dark:text-success-400'
    if (task.dueDate && new Date(task.dueDate) < new Date()) return 'text-error-600 dark:text-error-400'
    return 'text-primary-600 dark:text-primary-400'
  }

  if (loading) {
    return <Card className="p-6"><TaskListSkeleton /></Card>
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No recent activity
          </p>
        ) : (
          activities.map((task) => {
            const Icon = getActivityIcon(task)
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getActivityColor(task)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                    {task.title}
                  </p>
                  <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-0.5">
                    {formatDistanceToNow(new Date(task.updatedAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}