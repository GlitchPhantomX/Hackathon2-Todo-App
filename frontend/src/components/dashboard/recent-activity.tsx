'use client'

import { Card } from '@/components/ui/Card'
import { CheckCircle2, Clock, AlertCircle, Edit3 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const activities = [
  {
    type: 'completed',
    task: 'Complete project proposal',
    time: new Date(Date.now() - 1000 * 60 * 15),
    icon: CheckCircle2,
    color: 'text-success-600 dark:text-success-400',
  },
  {
    type: 'created',
    task: 'Review team feedback',
    time: new Date(Date.now() - 1000 * 60 * 45),
    icon: Clock,
    color: 'text-primary-600 dark:text-primary-400',
  },
  {
    type: 'updated',
    task: 'Update design mockups',
    time: new Date(Date.now() - 1000 * 60 * 120),
    icon: Edit3,
    color: 'text-warning-600 dark:text-warning-400',
  },
  {
    type: 'overdue',
    task: 'Submit quarterly report',
    time: new Date(Date.now() - 1000 * 60 * 180),
    icon: AlertCircle,
    color: 'text-error-600 dark:text-error-400',
  },
]

export function RecentActivity() {
  return (
    <Card className="p-6 animate-slideUp animation-delay-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Recent Activity
        </h3>
        <button className="text-body-sm text-primary-600 dark:text-primary-400 hover:underline">
          View All
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors animate-slideUp"
            style={{ animationDelay: `${700 + index * 100}ms` }}
          >
            <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${activity.color}`}>
              <activity.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                {activity.task}
              </p>
              <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-0.5">
                {formatDistanceToNow(activity.time, { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}