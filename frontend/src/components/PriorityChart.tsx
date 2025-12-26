'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const PriorityChart = () => {
  const { stats } = useDashboard();

  // Prepare data for the pie chart
  const data = [
    { name: 'High Priority', value: stats.byPriority.high, color: 'hsl(var(--chart-4))' }, // Red from Tailwind palette
    { name: 'Medium Priority', value: stats.byPriority.medium, color: 'hsl(var(--chart-3))' }, // Amber from Tailwind palette
    { name: 'Low Priority', value: stats.byPriority.low, color: 'hsl(var(--chart-1))' }, // Blue from Tailwind palette
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Priority Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row">
          <div className="h-[300px] w-full md:w-2/3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              >
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  animationBegin={0}
                  animationDuration={800}
                  animationEasing="ease-in-out"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      name={entry.name}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [value, 'Tasks']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                />
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    paddingLeft: '20px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriorityChart;