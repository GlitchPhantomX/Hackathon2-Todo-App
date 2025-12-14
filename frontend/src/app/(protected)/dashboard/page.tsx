import { Suspense } from 'react'
import { Calendar, TrendingUp, CheckCircle, Clock, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ProductivityChart } from '@/components/dashboard/productivity-chart'
import { TasksOverTimeChart } from '@/components/dashboard/tasks-over-time-chart'
import { PriorityDistributionChart } from '@/components/dashboard/priority-distribution-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks'
import { QuickActions } from '@/components/dashboard/quick-actions'

export default async function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slideDown">
          <div>
            <h1 className="font-heading text-h1 text-gray-900 dark:text-gray-50 mb-2">
              Good morning, Alex! 👋
            </h1>
            <p className="text-body-md text-gray-600 dark:text-gray-400">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <Button size="lg" className="gap-2 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            New Task
          </Button>
        </div>

        {/* Stats Cards */}
        <DashboardStats />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Suspense fallback={<div>Loading chart...</div>}>
            <ProductivityChart />
          </Suspense>
          <Suspense fallback={<div>Loading chart...</div>}>
            <TasksOverTimeChart />
          </Suspense>
        </div>

        {/* Secondary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Suspense fallback={<div>Loading chart...</div>}>
            <PriorityDistributionChart />
          </Suspense>
          <Suspense fallback={<div>Loading activity...</div>}>
            <RecentActivity />
          </Suspense>
          <Suspense fallback={<div>Loading tasks...</div>}>
            <UpcomingTasks />
          </Suspense>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}