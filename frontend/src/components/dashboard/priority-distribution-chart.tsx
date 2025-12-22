'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { useDashboard } from '@/contexts/DashboardContext'
import { groupTasksByPriority } from '@/lib/task-utils'
import { ChartSkeleton } from './skeletons'
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

const COLORS = {
  high: '#ef4444',    // Bright red for dark mode
  medium: '#f59e0b',  // Bright amber for dark mode  
  low: '#10b981',     // Bright green for dark mode
}

export function PriorityDistributionChart() {
  const { tasks, loading } = useDashboard()
  const [chartData, setChartData] = useState([])

  useEffect(() => {
    if (tasks && tasks.length >= 0) {
      const grouped = groupTasksByPriority(tasks)
      const processed = [
        { name: 'High', value: grouped.high, color: COLORS.high },
        { name: 'Medium', value: grouped.medium, color: COLORS.medium },
        { name: 'Low', value: grouped.low, color: COLORS.low },
      ]
      setChartData(processed)
    }
  }, [tasks])

  if (loading) {
    return <ChartSkeleton />
  }

  return (
    <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-6">
        Priority Distribution
      </h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgb(31, 41, 55)',
                border: '1px solid rgb(55, 65, 81)',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {chartData.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-gray-600 dark:text-gray-300">{item.name}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}