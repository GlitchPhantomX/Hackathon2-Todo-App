'use client'

import { Card } from '@/components/ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const data = [
  { month: 'Jan', tasks: 45 },
  { month: 'Feb', tasks: 52 },
  { month: 'Mar', tasks: 61 },
  { month: 'Apr', tasks: 58 },
  { month: 'May', tasks: 67 },
  { month: 'Jun', tasks: 71 },
]

export function TasksOverTimeChart() {
  return (
    <Card className="p-6 animate-slideUp animation-delay-500">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Tasks Completed
        </h3>
        <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
          Monthly completion trend
        </p>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis
              dataKey="month"
              className="text-body-sm text-gray-600 dark:text-gray-400"
              stroke="currentColor"
            />
            <YAxis
              className="text-body-sm text-gray-600 dark:text-gray-400"
              stroke="currentColor"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Bar
              dataKey="tasks"
              fill="hsl(var(--primary))"
              radius={[8, 8, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}