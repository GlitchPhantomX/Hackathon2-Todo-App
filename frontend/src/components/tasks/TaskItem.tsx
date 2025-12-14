'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Task } from '@/types/task.types';
import { CheckCircle, Circle, Edit, Trash2 } from 'lucide-react';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleLoading?: boolean;
  onDeleteLoading?: boolean;
}

const TaskItemComponent: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
  onToggleLoading = false,
  onDeleteLoading = false
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggle = () => {
    if (!onToggleLoading) {
      onToggle(task.id, !task.completed);
    }
  };

  const handleDelete = () => {
    if (!onDeleteLoading) {
      onDelete(task.id);
    }
  };

  const handleConfirmDelete = () => {
    setError(null);
    try {
      handleDelete();
      setShowDeleteConfirm(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      {error && (
        <div className="mb-3">
          <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleToggle}
            disabled={onToggleLoading}
            className="flex-shrink-0"
            aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
          >
            {onToggleLoading ? (
              <div className="h-5 w-5 flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            ) : task.completed ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-medium ${
                task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {task.description}
              </p>
            )}
            <div className="flex items-center text-xs text-gray-500 mt-1 space-x-2">
              {task.dueDate && (
                <span>
                  Due: {formatDate(task.dueDate)}
                </span>
              )}
              <span>
                Created: {formatDate(task.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(task.id)}
            aria-label="Edit task"
            disabled={onToggleLoading || onDeleteLoading}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete task"
            className="text-red-600 hover:text-red-800"
            disabled={onToggleLoading || onDeleteLoading}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-red-700">Are you sure you want to delete this task?</span>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={onDeleteLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDelete}
                disabled={onDeleteLoading}
              >
                {onDeleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

const MemoizedTaskItem = React.memo(TaskItemComponent);
export default MemoizedTaskItem;