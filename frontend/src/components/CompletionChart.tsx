'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

const CompletionChart = () => {
  const { stats } = useDashboard();

  // Calculate completion percentage
  const completionPercentage = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Prepare data for the radial bar chart
  const data = [
    {
      name: 'Completion',
      value: completionPercentage,
      fill: 'hsl(var(--chart-2))', // Green color for success from Tailwind palette
    },
    {
      name: 'Remaining',
      value: 100 - completionPercentage,
      fill: 'hsl(var(--chart-5))', // Purple color for remaining from Tailwind palette
    },
  ];

  return (
    <Card className="h-[300px]">
      <CardHeader>
        <CardTitle>Task Completion Rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="30%"
              outerRadius="100%"
              barSize={16}
              data={data}
              startAngle={180}
              endAngle={0}
              animationBegin={0}
              animationDuration={1000}
              animationEasing="ease-in-out"
            >
              <RadialBar
                minAngle={15}
                background
                dataKey="value"
                cornerRadius={10}
                animationBegin={0}
                animationDuration={1000}
                animationEasing="ease-in-out"
              />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-2xl font-bold fill-gray-800 dark:fill-gray-200"
              >
                {completionPercentage}%
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletionChart;