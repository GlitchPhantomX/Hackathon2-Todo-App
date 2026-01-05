'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboard } from '@/contexts/DashboardContext';
import { ChartContainer } from '@/components/ui/chart';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  Cell
} from 'recharts';
import { useTheme } from 'next-themes';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface ChartData {
  date: string;
  created: number;
  completed: number;
}

interface TimelineTooltipPayload {
  payload: ChartData;
  value: number;
  name: string;
  dataKey: string;
}

const TimelineChart = () => {
  const { stats } = useDashboard();
  const { theme } = useTheme();
  
  const isDark = theme === 'dark';
  const createdColor = isDark ? '#8b5cf6' : '#7c3aed'; // Purple
  const completedColor = isDark ? '#10b981' : '#059669'; // Green
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
  const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

  const [data, setData] = React.useState<ChartData[]>([]);

  React.useEffect(() => {
    if (stats.productivityTrend && stats.productivityTrend.length > 0) {
      setData(stats.productivityTrend.slice(-7).map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        created: item.created || 0,
        completed: item.completed || 0
      })));
    } else {
      // Fallback data - last 7 days
      const fallbackData = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const created = Math.floor(Math.random() * 12) + 3;
        const completed = Math.floor(Math.random() * created);

        fallbackData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          created,
          completed
        });
      }

      setData(fallbackData);
    }
  }, [stats.productivityTrend]);

  // Calculate stats
  const totalCreated = data.reduce((sum, item) => sum + item.created, 0);
  const totalCompleted = data.reduce((sum, item) => sum + item.completed, 0);
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;
  const avgDaily = Math.round(totalCreated / data.length);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TimelineTooltipPayload[] }) => {
    if (active && payload && payload.length && payload[0] && payload[0].payload) {
      const created = payload[0]?.value || 0;
      const completed = payload[1]?.value || 0;
      const rate = created > 0 ? Math.round((completed / created) * 100) : 0;
      const date = payload[0].payload.date || 'N/A';

      return (
        <div className={`rounded-lg border p-3 shadow-xl ${
          isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
        }`}>
          <p className={`font-semibold mb-2 ${
            isDark ? 'text-slate-200' : 'text-slate-900'
          }`}>
            {date}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: createdColor }} />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Created: <span className="font-semibold">{created}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded" style={{ backgroundColor: completedColor }} />
              <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Completed: <span className="font-semibold">{completed}</span>
              </span>
            </div>
            <div className={`text-xs pt-1 border-t ${
              isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'
            }`}>
              Completion Rate: {rate}%
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = () => (
    <div className="flex justify-center gap-6 mt-4">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: createdColor }} />
        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Created
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded" style={{ backgroundColor: completedColor }} />
        <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
          Completed
        </span>
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-green-500" />
            Tasks Timeline
          </CardTitle>
          <div className={`flex items-center gap-1 text-sm ${
            completionRate >= 70 ? 'text-green-500' : 'text-amber-500'
          }`}>
            {completionRate >= 70 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span className="font-semibold">{completionRate}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ChartContainer config={{
            created: { label: "Created", color: createdColor },
            completed: { label: "Completed", color: completedColor }
          }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
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
                />
                
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }} />
                
                <RechartsLegend content={<CustomLegend />} />
                
                <Bar 
                  dataKey="created" 
                  fill={createdColor}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-created-${index}`} 
                      fill={createdColor}
                      opacity={0.8}
                    />
                  ))}
                </Bar>
                
                <Bar 
                  dataKey="completed" 
                  fill={completedColor}
                  radius={[4, 4, 0, 0]}
                  animationDuration={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-completed-${index}`} 
                      fill={completedColor}
                      opacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
          <div className="text-center">
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Created
            </p>
            <p className="font-semibold text-lg mt-1" style={{ color: createdColor }}>
              {totalCreated}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Completed
            </p>
            <p className="font-semibold text-lg mt-1" style={{ color: completedColor }}>
              {totalCompleted}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Avg Daily
            </p>
            <p className={`font-semibold text-lg mt-1 ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}>
              {avgDaily}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimelineChart;