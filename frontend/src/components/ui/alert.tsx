'use client';

import React, { ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  title?: string;
  showIcon?: boolean;
  className?: string;
}

export interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    iconColor: 'text-green-500',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    iconColor: 'text-red-500',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-800',
    iconColor: 'text-yellow-500',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    iconColor: 'text-blue-500',
  },
};

const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  onClose,
  title,
  showIcon = true,
  className = '',
}) => {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-md border p-4 relative',
        config.bgColor,
        config.borderColor,
        className
      )}
    >
      <div className="flex">
        {showIcon && (
          <div className={`flex-shrink-0 mr-3 ${config.iconColor}`}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        )}
        <div className="flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${config.textColor}`}>{title}</h3>
          )}
          <div className={`mt-1 text-sm ${config.textColor}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="flex-shrink-0 ml-4">
            <button
              type="button"
              className={`inline-flex rounded-md ${config.iconColor} hover:${config.iconColor.replace('text-', 'text-')} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ AlertDescription component
const AlertDescription: React.FC<AlertDescriptionProps> = ({
  children,
  className = '',
}) => {
  return (
    <div className={cn('text-sm', className)}>
      {children}
    </div>
  );
};

// ✅ EXPORTS
export { Alert, AlertDescription };