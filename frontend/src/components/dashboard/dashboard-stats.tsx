'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: number
  change: number
  changeLabel: string
  icon: React.ElementType
  color: 'primary' | 'success' | 'warning' | 'error'
}

const colorConfig = {
  primary: {
    bg: 'from-primary-500 to-primary-600',
    icon: 'text-primary-600 dark:text-primary-400',
    badge: 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300',
  },
  success: {
    bg: 'from-success-500 to-success-600',
    icon: 'text-success-600 dark:text-success-400',
    badge: 'bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-300',
  },
  warning: {
    bg: 'from-warning-500 to-warning-600',
    icon: 'text-warning-600 dark:text-warning-400',
    badge: 'bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-300',
  },
  error: {
    bg: 'from-error-500 to-error-600',
    icon: 'text-error-600 dark:text-error-400',
    badge: 'bg-error-100 dark:bg-error-950 text-error-700 dark:text-error-300',
  },
}

export function DashboardStats() {
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({})

  const stats: Stat[] = [
    {
      label: 'Total Tasks',
      value: 156,
      change: 12,
      changeLabel: 'vs last week',
      icon: CheckCircle2,
      color: 'primary',
    },
    {
      label: 'Completed',
      value: 124,
      change: 8,
      changeLabel: 'vs last week',
      icon: TrendingUp,
      color: 'success',
    },
    {
      label: 'In Progress',
      value: 23,
      change: -3,
      changeLabel: 'vs last week',
      icon: Clock,
      color: 'warning',
    },
    {
      label: 'Overdue',
      value: 9,
      change: 2,
      changeLabel: 'vs last week',
      icon: AlertCircle,
      color: 'error',
    },
  ]

  // Animate numbers on mount
  useEffect(() => {
    stats.forEach((stat) => {
      let current = 0
      const increment = stat.value / 50
      const timer = setInterval(() => {
        current += increment
        if (current >= stat.value) {
          current = stat.value
          clearInterval(timer)
        }
        setAnimatedValues((prev) => ({ ...prev, [stat.label]: Math.floor(current) }))
      }, 20)
    })
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className="animate-slideUp"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Card
            className="relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          >
          {/* Background Gradient */}
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorConfig[stat.color].bg} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />

          <div className="relative p-6">
            {/* Icon */}
            <div className="flex items-center justify-between mb-4">
              <div className={cn('w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300', colorConfig[stat.color].bg)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', colorConfig[stat.color].badge)}>
                {stat.change > 0 ? (
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
              <div className="font-heading text-h1 text-gray-900 dark:text-gray-50">
                {animatedValues[stat.label] || 0}
              </div>
              <div className="text-body-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
              <div className="text-body-xs text-gray-500 dark:text-gray-500">
                {stat.changeLabel}
              </div>
            </div>
          </div>
        </Card>
        </div>
      ))}
    </div>
  )
}