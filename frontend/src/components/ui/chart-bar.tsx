'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartContainer } from './chart';

// --------------------------
// 1️⃣ Define ChartConfig
// --------------------------
export interface ChartConfig {
  width?: number;
  height?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  // add any additional chart configuration you need
}

// Define the expected chart config type for recharts compatibility
interface RechartsConfig {
  [k: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
}

// --------------------------
// 2️⃣ Default config
// --------------------------
const defaultChartConfig: RechartsConfig = {};

// --------------------------
// 3️⃣ Props type
// --------------------------
type BarChartWrapperProps = {
  data: Record<string, any>[];
  children: React.ReactNode;
  className?: string;
  config?: RechartsConfig;
} & Omit<React.ComponentProps<typeof BarChart>, 'data'>;

// --------------------------
// 4️⃣ Wrapper component
// --------------------------
const BarChartWrapper = ({
  data,
  children,
  className,
  config = defaultChartConfig,
  ...barChartProps
}: BarChartWrapperProps) => {
  return (
    <ChartContainer className={className} config={config}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} {...barChartProps}>
          {children}
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

// --------------------------
// 5️⃣ Export Bar component separately
// --------------------------
const BarChartComponent = Bar;

export { BarChartWrapper as BarChart, BarChartComponent as Bar };