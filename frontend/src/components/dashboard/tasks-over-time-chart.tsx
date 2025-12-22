'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { groupTasksByMonth } from '@/lib/task-utils'
import { ChartSkeleton } from './skeletons'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function TasksOverTimeChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = await getCurrentUserId()
        const tasks = await taskService.getTasks(userId)

        // Process tasks into chart data
        const processed = groupTasksByMonth(tasks, 6)
        setChartData(processed)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <Card className="p-6">
      <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50 mb-6">
        Tasks Over Time
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
            <XAxis
              dataKey="month"
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <YAxis
              stroke="hsl(var(--foreground))"
              tick={{ fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '0.5rem'
              }}
            />
            <Bar
              dataKey="tasks"
              fill="#3b82f6"  // Bright blue as specified in requirements
              name="Completed Tasks"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}