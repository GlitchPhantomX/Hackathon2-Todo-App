"use client"

import React, { useState } from 'react';
import { Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useDashboard } from '@/contexts/DashboardContext';

const PriorityChart = () => {
  const { stats } = useDashboard();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Prepare data for the pie chart with manual colors
  const chartData = [
    { 
      priority: "high", 
      tasks: stats.byPriority.high, 
      fill: "#ef4444", // Red for high priority
      hoverFill: "#f87171" // Lighter red on hover
    },
    { 
      priority: "medium", 
      tasks: stats.byPriority.medium, 
      fill: "#f59e0b", // Amber for medium priority
      hoverFill: "#fbbf24" // Lighter amber on hover
    },
    { 
      priority: "low", 
      tasks: stats.byPriority.low, 
      fill: "#3b82f6", // Blue for low priority
      hoverFill: "#60a5fa" // Lighter blue on hover
    },
  ];

  const chartConfig = {
    tasks: {
      label: "Tasks",
    },
    high: {
      label: "High Priority",
      color: "#ef4444",
    },
    medium: {
      label: "Medium Priority",
      color: "#f59e0b",
    },
    low: {
      label: "Low Priority",
      color: "#3b82f6",
    },
  } satisfies ChartConfig;

  const totalPriorityTasks = stats.byPriority.high + stats.byPriority.medium + stats.byPriority.low;

  const onPieEnter = (_: unknown, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Priority Distribution</CardTitle>
        <CardDescription>Tasks organized by priority level</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie 
              data={chartData} 
              dataKey="tasks" 
              label 
              nameKey="priority"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={activeIndex === index ? entry.hoverFill : entry.fill}
                  style={{ 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Total {totalPriorityTasks} tasks across all priorities
        </div>
        <div className="leading-none text-muted-foreground">
          High: {stats.byPriority.high} • Medium: {stats.byPriority.medium} • Low: {stats.byPriority.low}
        </div>
      </CardFooter>
    </Card>
  );
};

export default PriorityChart;