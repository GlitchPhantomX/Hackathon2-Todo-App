'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskSync } from '@/contexts/TaskSyncContext';
import { MoreHorizontalIcon, EditIcon, TrashIcon, CopyIcon, FolderOpenIcon, WifiIcon, WifiOffIcon } from 'lucide-react';
import { Task } from '@/types/types';
import { format, isToday, isPast } from 'date-fns';

interface TaskItemProps {
  task: Task;
  onEditClick?: (task: Task) => void;
  onDeleteClick?: (taskId: string) => void;
  onDuplicateClick?: (task: Task) => void;
  onMoveToProjectClick?: (task: Task) => void;
}

const TaskItem = ({
  task,
  onEditClick,
  onDeleteClick,
  onDuplicateClick,
  onMoveToProjectClick
}: TaskItemProps) => {
  const { updateTask, deleteTask: deleteTaskSync, websocketStatus } = useTaskSync();
  const [isHovered, setIsHovered] = useState(false);

  const handleCompletionToggle = async () => {
    await updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      if (onDeleteClick) {
        onDeleteClick(task.id);
      } else {
        await deleteTaskSync(task.id);
      }
    }
  };

  const handleEdit = () => {
    if (onEditClick) {
      onEditClick(task);
    }
  };

  const handleDuplicate = () => {
    if (onDuplicateClick) {
      onDuplicateClick(task);
    }
  };

  const handleMoveToProject = () => {
    if (onMoveToProjectClick) {
      onMoveToProjectClick(task);
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      default:
        return 'None';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  const getDueDateStatus = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isPast(date) && new Date(dateString).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      return 'overdue';
    } else if (isToday(date)) {
      return 'today';
    }
    return 'upcoming';
  };

  const dueDateStatus = getDueDateStatus(task.dueDate);

  // WebSocket status indicator - only show when connected
  const renderWebSocketStatus = () => {
    if (websocketStatus === 'connected') {
      return (
        <div className="flex items-center gap-1 text-green-600 text-xs">
          <WifiIcon className="h-3 w-3" />
          <span>Synced</span>
        </div>
      );
    }
    // Don't show offline/error status indicators - only show when connected
    return null;
  };

  return (
    <Card
      className={`transition-all duration-200 ${
        isHovered ? 'shadow-md -translate-y-0.5 border-primary' : 'shadow-sm'
      } ${
        task.status === 'completed' ? 'bg-muted/30' : 'bg-card'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={task.status === 'completed'}
              onCheckedChange={handleCompletionToggle}
              className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            />
          </div>

          {/* Task content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3
                className={`font-medium truncate ${
                  task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                }`}
              >
                {task.title}
              </h3>

              <div className="flex items-center gap-2">
                {/* WebSocket status indicator */}
                {renderWebSocketStatus()}

                {/* Visible edit and delete buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={handleEdit}
                    title="Edit task"
                  >
                    <EditIcon className="h-4 w-4" />
                    <span className="sr-only">Edit task</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-600 hover:text-red-700"
                    onClick={handleDelete}
                    title="Delete task"
                  >
                    <TrashIcon className="h-4 w-4" />
                    <span className="sr-only">Delete task</span>
                  </Button>
                </div>

                {/* Menu dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontalIcon className="h-4 w-4" />
                      <span className="sr-only">Task menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <CopyIcon className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleMoveToProject}>
                      <FolderOpenIcon className="mr-2 h-4 w-4" />
                      Move to Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-3">
              {/* Priority indicator */}
              {task.priority && (
                <Badge variant="outline" className="capitalize flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></div>
                  {getPriorityLabel(task.priority)}
                </Badge>
              )}

              {/* Tags */}
              {task.tags && task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="capitalize">
                  {tag}
                </Badge>
              ))}

              {/* Due date */}
              {task.dueDate && (
                <Badge
                  variant={dueDateStatus === 'overdue' ? 'destructive' : 'outline'}
                  className={`flex items-center gap-1 ${
                    dueDateStatus === 'today' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''
                  }`}
                >
                  <span>{formatDate(task.dueDate)}</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;