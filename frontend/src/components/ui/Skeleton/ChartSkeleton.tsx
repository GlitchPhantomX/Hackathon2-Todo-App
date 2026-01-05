import React from 'react';
import { Skeleton } from '../skeleton';

export const ChartSkeleton = () => {
  const [heights, setHeights] = React.useState<number[]>([]);

  React.useEffect(() => {
    const newHeights = Array.from({ length: 7 }, () => Math.floor(Math.random() * 40) + 20);
    setHeights(newHeights);
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Skeleton className="h-8 w-1/4 mb-6" />
      <div className="flex items-end justify-between h-64">
        {heights.map((height, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="w-8" style={{ height: `${height}%` }} />
            <Skeleton className="h-3 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
};