'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useDashboard } from '@/contexts/DashboardContext'
import { calculateStats } from '@/lib/task-utils'
import { StatsCardsSkeleton } from './skeletons'

const colorConfig = {
  primary: {
    bg: 'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700',
    icon: 'text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    cardBg: 'bg-blue-50/50 dark:bg-blue-900/10',
  },
  success: {
    bg: 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700',
    icon: 'text-green-600 dark:text-green-400',
    badge: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
    cardBg: 'bg-green-50/50 dark:bg-green-900/10',
  },
  warning: {
    bg: 'from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700',
    icon: 'text-amber-600 dark:text-amber-400',
    badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    cardBg: 'bg-amber-50/50 dark:bg-amber-900/10',
  },
  error: {
    bg: 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700',
    icon: 'text-red-600 dark:text-red-400',
    badge: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
    cardBg: 'bg-red-50/50 dark:bg-red-900/10',
  },
}

export function DashboardStats() {
  const { tasks, loading, error } = useDashboard()
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  })

  useEffect(() => {
    if (tasks && tasks.length >= 0) {
      const calculated = calculateStats(tasks)
      setStats(calculated)
    }
  }, [tasks])

  if (loading) {
    return <StatsCardsSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        <p>{error.message || 'Failed to load stats'}</p>
        <button
          className="mt-2 text-blue-500 dark:text-blue-400 hover:underline"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  const statItems = [
    {
      label: 'Total Tasks',
      value: stats.total,
      change: 0,
      changeLabel: 'vs last week',
      icon: Target,
      color: 'primary' as const,
    },
    {
      label: 'Completed',
      value: stats.completed,
      change: 0,
      changeLabel: 'vs last week',
      icon: CheckCircle2,
      color: 'success' as const,
    },
    {
      label: 'Pending',
      value: stats.pending,
      change: 0,
      changeLabel: 'vs last week',
      icon: Clock,
      color: 'warning' as const,
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      change: 0,
      changeLabel: 'vs last week',
      icon: AlertCircle,
      color: 'error' as const,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat) => (
        <Card
          key={stat.label}
          className={cn(
            "relative overflow-hidden group hover:shadow-2xl transition-all duration-300 border-gray-200 dark:border-gray-700",
            colorConfig[stat.color].cardBg
          )}
        >
          {/* Background Gradient */}
          <div className={cn(
            "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 dark:opacity-30 transition-opacity group-hover:opacity-30 dark:group-hover:opacity-40",
            `bg-gradient-to-br ${colorConfig[stat.color].bg}`
          )} />

          <div className="relative p-6">
            {/* Icon & Badge */}
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg',
                `bg-gradient-to-br ${colorConfig[stat.color].bg}`
              )}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                colorConfig[stat.color].badge
              )}>
                {stat.change >= 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" />
                    <span>+{stat.change}%</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-3 h-3" />
                    <span>{stat.change}%</span>
                  </>
                )}
              </div>
            </div>

            {/* Value */}
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {stat.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {stat.changeLabel}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}