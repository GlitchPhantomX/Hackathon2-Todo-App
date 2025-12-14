'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className={cn({ 'w-full': fullWidth })}>
        {label && (
          <label
            htmlFor={props.id}
            className={cn(
              'block text-sm font-medium mb-1',
              hasError ? 'text-red-600' : 'text-gray-700'
            )}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'block w-full rounded-md border shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
            {
              'border-gray-300': !hasError,
              'border-red-300': hasError,
              'p-2': !label, // Add padding if no label
              'py-2 px-3': label, // Different padding if label exists
              'w-full': fullWidth,
            },
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {!hasError && helperText && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };