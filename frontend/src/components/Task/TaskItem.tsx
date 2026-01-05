'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';

interface TaskItemProps {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onEdit: (id: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  id,
  title,
  completed,
  description,
  dueDate,
  priority,
  onToggle,
  onDelete,
  onEdit
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(id), 300); // Match animation duration
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <AnimatePresence>
      {!isDeleting && (
        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className={`p-4 border rounded-lg flex items-start space-x-4 ${
            completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
          }`}
        >
          <motion.div
            animate={{ scale: completed ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Checkbox
              checked={completed}
              onCheckedChange={() => onToggle(id)}
              className="mt-1"
            />
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`font-medium truncate ${completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {title}
              </h3>
              {priority && (
                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(priority)} bg-gray-100`}>
                  {priority}
                </span>
              )}
            </div>
            {description && (
              <p className="text-sm text-gray-600 mt-1 truncate">{description}</p>
            )}
            {dueDate && (
              <p className="text-xs text-gray-500 mt-1">Due: {dueDate}</p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(id)}
              aria-label="Edit task"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              aria-label="Delete task"
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};