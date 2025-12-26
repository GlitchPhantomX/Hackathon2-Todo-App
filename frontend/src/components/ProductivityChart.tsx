'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

const ProductivityChart = () => {
  const { stats } = useDashboard();

  // Generate sample data for the last 30 days
  // In a real implementation, this would come from the productivity_trend data
  const generateSampleData = () => {
    const data = [];
    const today = new Date();

    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Calculate productivity score (completed/total) for the day
      const completed = Math.floor(Math.random() * 5);
      const total = Math.floor(Math.random() * 10) + 1; // Ensure at least 1 task
      const productivityScore = total > 0 ? Math.round((completed / total) * 100) : 0;

      data.push({
        date: date.toISOString().split('T')[0],
        productivity: productivityScore,
        completed,
        total
      });
    }

    return data;
  };

  const data = stats.productivityTrend && stats.productivityTrend.length > 0
    ? stats.productivityTrend.map(item => ({
        date: item.date,
        productivity: item.score,
        completed: item.completed,
        total: item.created
      }))
    : generateSampleData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Productivity Trend</CardTitle>
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
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value, name) => [
                  `${value}%`,
                  name === 'productivity' ? 'Productivity Score' : name
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
                dataKey="productivity"
                stroke="hsl(var(--chart-2))"
                fill="url(#productivityGradient)"
                name="Productivity Score"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                dot={false}
                name="Productivity Trend"
                animationBegin={0}
                animationDuration={800}
                animationEasing="ease-in-out"
              />
              <defs>
                <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
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

export default ProductivityChart;