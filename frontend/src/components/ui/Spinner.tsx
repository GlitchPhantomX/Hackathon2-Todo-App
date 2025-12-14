'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
  color = 'currentColor'
}) => {
  const spinnerClasses = cn(
    'animate-spin rounded-full border-2 border-t-current border-r-current border-b-transparent border-l-transparent',
    sizeClasses[size],
    className
  );

  return (
    <span
      className={spinnerClasses}
      style={{ borderColor: color }}
    />
  );
};

export { Spinner };