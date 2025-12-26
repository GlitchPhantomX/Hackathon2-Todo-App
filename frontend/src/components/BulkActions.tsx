'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useDashboard } from '@/contexts/DashboardContext';

interface BulkActionsProps {
  selectedTaskIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onActionComplete?: () => void;
}

const BulkActions = ({ selectedTaskIds, onSelectionChange, onActionComplete }: BulkActionsProps) => {
  const {
    tasks,
    updateTask,
    deleteTask,
    toggleTaskCompletion
  } = useDashboard();

  if (selectedTaskIds.length === 0) {
    return null;
  }

  const handleStatusChange = async (status: 'pending' | 'completed') => {
    try {
      for (const taskId of selectedTaskIds) {
        await updateTask(taskId, { status });
      }
      onActionComplete?.();
    } catch (error) {
      console.error('Error updating tasks:', error);
    }
  };

  const handlePriorityChange = async (priority: 'high' | 'medium' | 'low') => {
    try {
      for (const taskId of selectedTaskIds) {
        await updateTask(taskId, { priority });
      }
      onActionComplete?.();
    } catch (error) {
      console.error('Error updating task priorities:', error);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      for (const taskId of selectedTaskIds) {
        await deleteTask(taskId);
      }
      onSelectionChange([]);
      onActionComplete?.();
    } catch (error) {
      console.error('Error deleting tasks:', error);
    }
  };

  const handleMarkComplete = async () => {
    try {
      for (const taskId of selectedTaskIds) {
        await toggleTaskCompletion(taskId);
      }
      onActionComplete?.();
    } catch (error) {
      console.error('Error toggling task completion:', error);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedTaskIds.length} selected
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectionChange([])}
          >
            Clear selection
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mark as Complete/Pending */}
          <Select onValueChange={(value: 'pending' | 'completed') => handleStatusChange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Mark as..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Mark as Complete</SelectItem>
              <SelectItem value="pending">Mark as Pending</SelectItem>
            </SelectContent>
          </Select>

          {/* Change Priority */}
          <Select onValueChange={(value: 'high' | 'medium' | 'low') => handlePriorityChange(value)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Change Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High Priority</SelectItem>
              <SelectItem value="medium">Medium Priority</SelectItem>
              <SelectItem value="low">Low Priority</SelectItem>
            </SelectContent>
          </Select>

          {/* Delete Selected */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDeleteSelected}
          >
            Delete Selected
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;