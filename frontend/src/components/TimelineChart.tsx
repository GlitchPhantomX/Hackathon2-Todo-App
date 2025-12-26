'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const TimelineChart = () => {
  const { stats } = useDashboard();

  // Generate sample data for the last 30 days
  // In a real implementation, this would come from the productivity_trend data
  const generateSampleData = () => {
    const data = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Generate random data for demonstration
      const created = Math.floor(Math.random() * 10);
      const completed = Math.floor(Math.random() * 10);

      data.push({
        date: date.toISOString().split('T')[0],
        created,
        completed
      });
    }

    return data;
  };

  const data = stats.productivityTrend && stats.productivityTrend.length > 0
    ? stats.productivityTrend.map(item => ({
        date: item.date,
        created: item.created,
        completed: item.completed
      }))
    : generateSampleData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-in-out"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [
                  value,
                  name === 'created' ? 'Created' : 'Completed'
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 'var(--radius)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="created"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="url(#createdGradient)"
                name="Created"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Area
                type="monotone"
                dataKey="completed"
                stackId="1"
                stroke="hsl(var(--chart-2))"
                fill="url(#completedGradient)"
                name="Completed"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <defs>
                <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;