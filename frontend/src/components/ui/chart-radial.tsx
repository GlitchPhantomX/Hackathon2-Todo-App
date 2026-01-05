'use client';

import * as React from 'react';
import { RadialBar, RadialBarChart, type RadialBarProps, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './chart';

type RadialChartProps = React.ComponentProps<typeof ChartContainer> & {
  data: Record<string, any>[];
  children: React.ReactNode;
};

const RadialChartWrapper = ({ data, children, className, config, ...props }: RadialChartProps) => {
  return (
    <ChartContainer className={className} config={config}>
      <ResponsiveContainer>
        <RadialBarChart data={data} {...(props as any)}>
          {children}
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const RadialBarComponent = RadialBar;

export { RadialChartWrapper as RadialChart, RadialBarComponent as RadialBar };