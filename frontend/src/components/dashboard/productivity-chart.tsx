'use client'

import { Card } from '@/components/ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

const data = [
  { day: 'Mon', completed: 12, created: 15 },
  { day: 'Tue', completed: 19, created: 18 },
  { day: 'Wed', completed: 15, created: 20 },
  { day: 'Thu', completed: 22, created: 19 },
  { day: 'Fri', completed: 18, created: 16 },
  { day: 'Sat', completed: 8, created: 10 },
  { day: 'Sun', completed: 6, created: 8 },
]

export function ProductivityChart() {
  return (
    <Card className="p-6 animate-slideUp animation-delay-400">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
            Productivity This Week
          </h3>
          <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
            Tasks completed vs created
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success-500" />
            <span className="text-body-sm text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary-500" />
            <span className="text-body-sm text-gray-600 dark:text-gray-400">Created</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
            <XAxis
              dataKey="day"
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
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="completed"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#completedGradient)"
              animationDuration={1500}
            />
            <Area
              type="monotone"
              dataKey="created"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#createdGradient)"
              animationDuration={1500}
              animationBegin={200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}