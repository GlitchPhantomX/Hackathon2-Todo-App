import React from 'react';
import { Task } from '../../types/task.types';

interface ReminderBadgeProps {
  task: Task;
}

const ReminderBadge: React.FC<ReminderBadgeProps> = ({ task }) => {
  if (!task.reminderEnabled) {
    return null;
  }

  const getReminderLabel = (timing: string | undefined) => {
    if (!timing) return '';
    switch (timing) {
      case '15min':
        return '15 min';
      case '1hr':
        return '1 hr';
      case '1day':
        return '1 day';
      default:
        return timing;
    }
  };

  return (
    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Reminder: {getReminderLabel(task.reminderTiming)}
    </div>
  );
};

export default ReminderBadge;