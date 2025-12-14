'use client';

import React from 'react';
import TaskItem from '@/components/tasks/TaskItem';
import { Task } from '@/types/task.types';

interface TaskListProps {
  tasks: Task[];
  onTaskUpdate?: (id: string, completed: boolean) => void;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const TaskListComponent: React.FC<TaskListProps> = ({
  tasks,
  onTaskUpdate,
  onToggle,
  onEdit,
  onDelete,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks</h3>
        <p className="text-gray-500">Get started by creating a new task.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export const TaskList = React.memo(TaskListComponent, (prevProps, nextProps) => {
  // Only re-render if tasks array reference changes or loading state changes
  return (
    prevProps.loading === nextProps.loading &&
    prevProps.tasks.length === nextProps.tasks.length &&
    prevProps.tasks.every((task, index) =>
      nextProps.tasks[index] &&
      task.id === nextProps.tasks[index].id &&
      task.completed === nextProps.tasks[index].completed &&
      task.title === nextProps.tasks[index].title &&
      task.description === nextProps.tasks[index].description &&
      task.dueDate === nextProps.tasks[index].dueDate &&
      task.createdAt === nextProps.tasks[index].createdAt
    )
  );
});

export default TaskList;