'use client'

import { Card } from '@/components/ui/Card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const data = [
  { name: 'High', value: 28, color: '#ef4444' },
  { name: 'Medium', value: 45, color: '#f59e0b' },
  { name: 'Low', value: 27, color: '#6b7280' },
]

export function PriorityDistributionChart() {
  return (
    <Card className="p-6 animate-slideUp animation-delay-600">
      {/* Header */}
      <div className="mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Priority Distribution
        </h3>
        <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-1">
          Current task priorities
        </p>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-body-sm text-gray-600 dark:text-gray-400">{item.name}</span>
            </div>
            <div className="font-heading text-h4 text-gray-900 dark:text-gray-50">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}