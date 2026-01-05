import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText = 'Get Started',
  onAction,
  showAction = true,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-6 mb-6">
        <div className="bg-gray-200 dark:bg-gray-700 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{description}</p>
      {showAction && onAction && (
        <Button onClick={onAction}>
          {actionText}
          {actionText === 'Add Task' && <Plus className="ml-2 h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};