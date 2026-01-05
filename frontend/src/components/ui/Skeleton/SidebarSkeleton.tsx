import React from 'react';
import { Skeleton } from '../skeleton';

export const SidebarSkeleton = () => {
  return (
    <div className="w-64 p-4 space-y-6 border-r">
      <Skeleton className="h-10 w-3/4 mb-8" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
};