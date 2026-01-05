'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import { ChartContainer } from '@/components/ui/chart';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip  // Recharts ka Tooltip explicitly import karo
} from 'recharts';
import { useTheme } from 'next-themes';

const ProductivityChart = () => {
  const { stats } = useDashboard();
  const { theme } = useTheme();
  
  // Theme-aware colors
  const isDark = theme === 'dark';
  const primaryBlue = isDark ? '#3b82f6' : '#2563eb';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  // Real-time data processing
  const [data, setData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    if (stats.productivityTrend && stats.productivityTrend.length > 0) {
      setData(stats.productivityTrend.map(item => ({
        date: item.date,
        score: item.score || 0,
        completed: item.completed || 0,
        total: item.created || 0
      })));
    } else {
      // Fallback data
      const fallbackData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const completed = Math.floor(Math.random() * 8) + 2;
        const total = completed + Math.floor(Math.random() * 5);
        const score = Math.round((completed / total) * 100);

        fallbackData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          score,
          completed,
          total
        });
      }

      setData(fallbackData);
    }
  }, [stats.productivityTrend]);

  interface ChartData {
    date: string;
    score: number;
    completed: number;
    total: number;
  }

  interface TooltipPayload {
    payload: ChartData[];
    value: number;
    name: string;
    dataKey: string;
  }

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (active && payload && payload.length) {
      const firstPayload = payload[0];
      if (firstPayload && firstPayload.payload && firstPayload.payload.length > 0 && firstPayload.payload[0]) {
        const chartData = firstPayload.payload[0];
        return (
          <div className={`rounded-lg border p-3 shadow-lg ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
          }`}>
            <p className={`font-semibold mb-2 ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}>
              {chartData.date || 'N/A'}
            </p>
            <div className="space-y-1">
              <p className="text-sm flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: primaryBlue }} />
                <span className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  Productivity: <span className="font-semibold">{firstPayload.value}%</span>
                </span>
              </p>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Completed: {chartData.completed || 0} / {chartData.total || 0}
              </p>
            </div>
          </div>
        );
      }
    }
    return null;
  };

  const config = {
    score: {
      label: "Productivity Score",
      color: primaryBlue
    }
  };

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className="w-1 h-6 rounded-full" style={{ backgroundColor: primaryBlue }} />
          Productivity Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ChartContainer config={config}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryBlue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={primaryBlue} stopOpacity={0} />
                  </linearGradient>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={gridColor}
                  vertical={false}
                />
                
                <XAxis
                  dataKey="date"
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                
                <YAxis
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                
                {/* Recharts ka Tooltip explicitly use karo */}
                <RechartsTooltip content={<CustomTooltip />} />
                
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke={primaryBlue}
                  strokeWidth={2.5}
                  fill="url(#blueGradient)"
                  animationDuration={800}
                  dot={{ 
                    fill: primaryBlue, 
                    strokeWidth: 2, 
                    r: 4,
                    stroke: isDark ? '#0f172a' : '#ffffff'
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: primaryBlue,
                    stroke: isDark ? '#0f172a' : '#ffffff',
                    strokeWidth: 3
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Summary */}
        <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
          <div>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Average
            </p>
            <p className="font-semibold text-lg" style={{ color: primaryBlue }}>
              {Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length)}%
            </p>
          </div>
          <div>
            <p className={isDark ? 'text-slate-400' : 'text-slate-500'}>
              Peak
            </p>
            <p className="font-semibold text-lg" style={{ color: primaryBlue }}>
              {Math.max(...data.map(d => d.score))}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductivityChart;