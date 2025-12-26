import React from 'react';
import { Skeleton } from '../Skeleton';

export const ChartSkeleton = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <Skeleton className="h-8 w-1/4 mb-6" />
      <div className="flex items-end justify-between h-64">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <Skeleton className="w-8" style={{ height: `${Math.floor(Math.random() * 40) + 20}%` }} />
            <Skeleton className="h-3 w-4" />
          </div>
        ))}
      </div>
    </div>
  );
};