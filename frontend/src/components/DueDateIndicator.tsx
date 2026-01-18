import React from 'react';
import { Task } from '../types/task.types';

interface DueDateIndicatorProps {
  task: Task;
}

const DueDateIndicator: React.FC<DueDateIndicatorProps> = ({ task }) => {
  if (!task.dueDate) {
    return null;
  }

  const dueDate = new Date(task.dueDate);
  const now = new Date();
  const timeDiff = dueDate.getTime() - now.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  let badgeColor = 'bg-gray-100 text-gray-800';
  let textColor = 'text-gray-800';

  if (daysDiff < 0) {
    // Overdue
    badgeColor = 'bg-red-100 text-red-800';
    textColor = 'text-red-800';
  } else if (daysDiff === 0) {
    // Due today
    badgeColor = 'bg-orange-100 text-orange-800';
    textColor = 'text-orange-800';
  } else if (daysDiff === 1) {
    // Due tomorrow
    badgeColor = 'bg-yellow-100 text-yellow-800';
    textColor = 'text-yellow-800';
  } else if (daysDiff <= 3) {
    // Due in 2-3 days
    badgeColor = 'bg-blue-100 text-blue-800';
    textColor = 'text-blue-800';
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      {daysDiff < 0 ? `Overdue (${formatDate(dueDate)})` :
       daysDiff === 0 ? `Today (${formatDate(dueDate)})` :
       daysDiff === 1 ? `Tomorrow (${formatDate(dueDate)})` :
       `Due ${formatDate(dueDate)}`}
    </div>
  );
};

export default DueDateIndicator;