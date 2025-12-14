import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: boolean;
  rounded?: boolean;
  className?: string;
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = true,
  rounded = true,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'border border-gray-200',
        paddingClasses[padding],
        {
          'shadow-sm': shadow,
          'rounded-lg': rounded,
        },
        className
      )}
    >
      {children}
    </div>
  );
};

export { Card };