'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/contexts/DashboardContext';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, EditIcon, TrashIcon, CopyIcon, ShareIcon, CheckIcon, XIcon } from 'lucide-react';
import { Task } from '@/types/types';

interface TaskDetailProps {
  task: Task;
  onClose?: () => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onDuplicate?: (task: Task) => void;
}

const TaskDetail = ({ task, onClose, onEdit, onDelete, onDuplicate }: TaskDetailProps) => {
  const { updateTask, deleteTask, toggleTaskCompletion } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({
    title: task.title,
    description: task.description || '',
    dueDate: task.dueDate || '',
    priority: task.priority || 'medium',
    status: task.status,
    projectId: task.projectId || '',
    tags: task.tags || [],
  });
  const [newTag, setNewTag] = useState('');

  const handleSave = async () => {
    try {
      await updateTask(task.id, {
        title: editedTask.title,
        description: editedTask.description,
        dueDate: editedTask.dueDate || undefined,
        priority: editedTask.priority,
        status: editedTask.status,
        projectId: editedTask.projectId || undefined,
        tags: editedTask.tags,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleCancel = () => {
    setEditedTask({
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priority || 'medium',
      status: task.status,
      projectId: task.projectId || '',
      tags: task.tags || [],
    });
    setIsEditing(false);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(task);
    } else {
      setIsEditing(true);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(task.id);
    } else {
      await deleteTask(task.id);
      onClose?.();
    }
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(task);
    }
  };

  const handleStatusToggle = async () => {
    await toggleTaskCompletion(task.id);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editedTask.tags.includes(newTag.trim())) {
      setEditedTask({
        ...editedTask,
        tags: [...editedTask.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTask({
      ...editedTask,
      tags: editedTask.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const getPriorityColor = (priority: string) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No due date';
    return format(parseISO(dateString), 'MMM dd, yyyy');
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {isEditing ? (
              <Input
                value={editedTask.title}
                onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
                className="text-xl font-bold mb-2"
              />
            ) : (
              <CardTitle className="text-xl font-bold">{task.title}</CardTitle>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleStatusToggle}>
              {task.status === 'completed' ? (
                <>
                  <XIcon className="h-4 w-4 mr-1" />
                  Mark Pending
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Mark Complete
                </>
              )}
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={handleEditClick}>
                  <EditIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDuplicate}>
                  <CopyIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <ShareIcon className="h-4 w-4" />
                </Button>
                {onClose && (
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Close
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h3 className="font-medium mb-1">Description</h3>
            {isEditing ? (
              <Textarea
                value={editedTask.description}
                onChange={(e) => setEditedTask({...editedTask, description: e.target.value})}
                rows={4}
              />
            ) : (
              <p className="text-muted-foreground">
                {task.description || 'No description provided'}
              </p>
            )}
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-1">Priority</h3>
              {isEditing ? (
                <Select value={editedTask.priority} onValueChange={(value: 'high' | 'medium' | 'low') => setEditedTask({...editedTask, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="outline" className="capitalize flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority || 'medium')}`}></div>
                  {task.priority || 'medium'}
                </Badge>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-1">Due Date</h3>
              {isEditing ? (
                <Input
                  type="date"
                  value={editedTask.dueDate}
                  onChange={(e) => setEditedTask({...editedTask, dueDate: e.target.value})}
                  className="w-full"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-medium mb-1">Status</h3>
              <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                {task.status}
              </Badge>
            </div>

            <div>
              <h3 className="font-medium mb-1">Project</h3>
              {task.projectId ? (
                <span className="text-muted-foreground">
                  {task.projectId} {/* In a real app, this would show the project name */}
                </span>
              ) : (
                <span className="text-muted-foreground italic">No project assigned</span>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="font-medium mb-1">Tags</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedTask.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-xs"
                    >
                      ×
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
            )}
          </div>

          {/* Created/Modified Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <h3 className="font-medium mb-1">Created</h3>
              <p className="text-sm text-muted-foreground">
                {task.createdAt ? format(parseISO(task.createdAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
              </p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Last Modified</h3>
              <p className="text-sm text-muted-foreground">
                {task.updatedAt ? format(parseISO(task.updatedAt), 'MMM dd, yyyy HH:mm') : 'Unknown'}
              </p>
            </div>
          </div>

          {/* Activity Log */}
          <div>
            <h3 className="font-medium mb-2">Activity Log</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>All changes to this task will appear here.</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p className="text-xs">
                  {task.userId && (
                    <>
                      <span className="font-medium">{task.userId}</span>
                      {' '}
                      {task.status === 'completed' ? 'completed' : 'modified'}
                      {' this task '}
                      {task.updatedAt && format(parseISO(task.updatedAt), 'hh:mm a')}
                    </>
                  )}
                  {!task.userId && 'No activity recorded yet'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskDetail;