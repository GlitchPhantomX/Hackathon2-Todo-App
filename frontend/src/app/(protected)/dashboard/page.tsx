'use client'

import { useState } from 'react'
import { DashboardProvider } from '@/contexts/DashboardContext'
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { ProductivityChart } from '@/components/dashboard/productivity-chart'
import { TasksOverTimeChart } from '@/components/dashboard/tasks-over-time-chart'
import { PriorityDistributionChart } from '@/components/dashboard/priority-distribution-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { UpcomingTasks } from '@/components/dashboard/upcoming-tasks'
import { TaskManagementPanel } from '@/components/dashboard/TaskManagementPanel'

export default function DashboardPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  return (
    <DashboardProvider>
      <DashboardErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <DashboardNavbar onSearch={handleSearch} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <DashboardStats />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ProductivityChart />
              <TasksOverTimeChart />
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <PriorityDistributionChart />
              <RecentActivity />
              <UpcomingTasks />
            </div>

            {/* Task Management */}
            <TaskManagementPanel searchQuery={searchQuery} />
          </div>
        </div>
      </DashboardErrorBoundary>
    </DashboardProvider>
  )
}