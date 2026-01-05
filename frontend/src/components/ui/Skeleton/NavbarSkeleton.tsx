import React from 'react';
import { Skeleton } from '../skeleton';

export const NavbarSkeleton = () => {
  return (
    <div className="h-16 flex items-center justify-between px-6 border-b">
      <div className="flex items-center space-x-8">
        <Skeleton className="h-8 w-32" />
        <div className="hidden md:flex space-x-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-16" />
          ))}
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </div>
  );
};