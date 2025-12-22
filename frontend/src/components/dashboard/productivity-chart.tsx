'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useDashboard } from '@/contexts/DashboardContext'
import { groupTasksByDay } from '@/lib/task-utils'
import { ChartSkeleton } from './skeletons'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function ProductivityChart() {
  const { tasks, loading } = useDashboard()
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (tasks && tasks.length >= 0) {
      const processed = groupTasksByDay(tasks, 7)
      setChartData(processed)
    }
  }, [tasks])

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-6">
        Productivity Chart
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis
              dataKey="day"
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(31, 41, 55)',
                border: '1px solid rgb(55, 65, 81)',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#completedGradient)"
              name="Completed"
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#createdGradient)"
              name="Created"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}