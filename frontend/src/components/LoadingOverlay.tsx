'use client';

import React from 'react';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading = false,
  children,
  className
}) => {
  if (isLoading) {
    return (
      <div className={cn("fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center", className)}>
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-12 w-12" />
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return children as React.ReactElement;
};

export default LoadingOverlay;