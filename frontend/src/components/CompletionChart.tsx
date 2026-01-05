"use client"

import React, { useState } from 'react';
// import { TrendingUp } from "lucide-react"
import { Pie, PieChart, Label, Cell } from "recharts"
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

const CompletionChart = () => {
  const { stats } = useDashboard();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Calculate completion percentage
  const completionPercentage = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Prepare data for the pie chart with manual colors
  const chartData = [
    { 
      status: "completed", 
      tasks: stats.completed, 
      fill: "#3b82f6", // Blue color for completed
      hoverFill: "#60a5fa" // Lighter blue on hover
    },
    { 
      status: "pending", 
      tasks: stats.pending, 
      fill: "#a855f7", // Purple color for pending
      hoverFill: "#c084fc" // Lighter purple on hover
    },
  ];

  const chartConfig = {
    tasks: {
      label: "Tasks",
    },
    completed: {
      label: "Completed",
      color: "#3b82f6",
    },
    pending: {
      label: "Pending",
      color: "#a855f7",
    },
  } satisfies ChartConfig;

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Task Completion</CardTitle>
        <CardDescription>Your task progress overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="tasks"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
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
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {completionPercentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Complete
                        </tspan>
                      </text>
                    )
                  }
                  return null; // Return null when condition is not met
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          {stats.completed} of {stats.total} tasks completed
        </div>
        <div className="leading-none text-muted-foreground">
          {stats.pending} tasks remaining
        </div>
      </CardFooter>
    </Card>
  );
};

export default CompletionChart;