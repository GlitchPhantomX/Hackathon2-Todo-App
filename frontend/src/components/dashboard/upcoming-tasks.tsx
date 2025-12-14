'use client'

import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Calendar, Flag } from 'lucide-react'
import { format } from 'date-fns'


type Priority = 'high' | 'medium' | 'low';

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  high: { color: 'bg-error-500', label: 'High' },
  medium: { color: 'bg-warning-500', label: 'Medium' },
  low: { color: 'bg-gray-400 dark:bg-gray-600', label: 'Low' },
}

interface Task {
  title: string;
  dueDate: Date;
  priority: Priority;
}

export function UpcomingTasks() {
  const upcomingTasks: Task[] = [
    {
      title: 'Team meeting preparation',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 2),
      priority: 'high',
    },
    {
      title: 'Code review for PR #234',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 5),
      priority: 'medium',
    },
    {
      title: 'Update documentation',
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
      priority: 'low',
    },
  ];

  return (
    <Card className="p-6 animate-slideUp animation-delay-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Upcoming Tasks
        </h3>
        <button className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {upcomingTasks.map((task, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors animate-slideUp"
            style={{ animationDelay: `${800 + index * 100}ms` }}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50 flex-1">
                {task.title}
              </p>
              <Badge
                variant="secondary"
                className={`${priorityConfig[task.priority].color} text-white gap-1`}
              >
                <Flag className="w-3 h-3 fill-current" />
                {priorityConfig[task.priority].label}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-body-xs text-gray-500 dark:text-gray-500">
              <Calendar className="w-3.5 h-3.5" />
              <span>{format(task.dueDate, 'MMM d, h:mm a')}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}