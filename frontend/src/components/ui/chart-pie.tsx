'use client';

import * as React from 'react';
import { Pie, PieChart, type PieProps, Cell, ResponsiveContainer } from 'recharts';

import { cn } from '@/lib/utils';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from './chart';

type PieChartProps = React.ComponentProps<typeof ChartContainer> & {
  data: Record<string, any>[];
  children: React.ReactNode;
};

const PieChartWrapper = ({ data, children, className, config, ...props }: PieChartProps) => {
  return (
    <ChartContainer className={className} config={config}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} {...(props as any)}>
            {children}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
          <ChartLegend content={<ChartLegendContent payload={[]} />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

const PieChartComponent = Pie;
const CellComponent = Cell;

export { PieChartWrapper as PieChart, PieChartComponent as Pie, CellComponent as Cell };