import React from 'react';
import { Task } from '../../types/task.types';

interface RecurringTaskBadgeProps {
  task: Task;
}

const RecurringTaskBadge: React.FC<RecurringTaskBadgeProps> = ({ task }) => {
  if (!task.isRecurring) {
    return null;
  }

  const getFrequencyLabel = (frequency: string | undefined) => {
    if (!frequency) return '';
    return frequency.charAt(0).toUpperCase() + frequency.slice(1);
  };

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      {getFrequencyLabel(task.frequency)}
    </div>
  );
};

export default RecurringTaskBadge;