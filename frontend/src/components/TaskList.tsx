'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  FilterIcon,
  PlusIcon,
  GridIcon,
  ListIcon,
  CalendarIcon,
  MoreHorizontalIcon,
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { Task } from '@/types/types';
import TaskItem from '@/components/TaskItem';

interface FilterOptions {
  status?: 'pending' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  dueDate?: 'today' | 'upcoming' | 'overdue';
  project?: string;
  tag?: string;
}

interface TaskListProps {
  tasks?: Task[];
  onEditTask?: (task: Task) => void;
  filter?: FilterOptions;
}

const TaskList = ({ tasks: propTasks, onEditTask, filter }: TaskListProps = {}) => {
  const { tasks, toggleTaskCompletion, filters, setFilter, setSortBy: setContextSortBy, tags } = useDashboard();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // Use prop tasks if provided, otherwise use context tasks
  const allTasks = propTasks || tasks;

  // Filter tasks based on criteria
  const filteredTasks = allTasks
    .filter(task => {
      // Apply filter prop first if provided
      if (filter) {
        if (filter.status && task.status !== filter.status) {
          return false;
        }

        if (filter.priority && task.priority !== filter.priority) {
          return false;
        }

        if (filter.dueDate) {
          const taskDate = task.dueDate ? new Date(task.dueDate) : null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          switch (filter.dueDate) {
            case 'today':
              if (!taskDate || taskDate.toDateString() !== today.toDateString()) {
                return false;
              }
              break;
            case 'upcoming':
              if (!taskDate || taskDate < today) {
                return false;
              }
              // Only upcoming tasks (next 7 days for example)
              const nextWeek = new Date();
              nextWeek.setDate(today.getDate() + 7);
              if (taskDate > nextWeek) {
                return false;
              }
              break;
            case 'overdue':
              if (!taskDate || taskDate >= today) {
                return false;
              }
              break;
          }
        }

        if (filter.project && task.projectId !== filter.project) {
          return false;
        }

        if (filter.tag && task.tags && !task.tags.includes(filter.tag)) {
          return false;
        }
      }

      // Apply context filters from DashboardContext
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }

      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      if (filters.project && task.projectId !== filters.project) {
        return false;
      }

      if (filters.tags.length > 0 && task.tags) {
        return filters.tags.some(tag => task.tags?.includes(tag));
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !task.title.toLowerCase().includes(query) &&
          !task.description.toLowerCase().includes(query) &&
          !(task.tags && task.tags.some(tag => tag.toLowerCase().includes(query)))
        ) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort tasks based on selected sort option
      switch (filters.sortBy || 'date') {
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority || 'low'] || 0) - (priorityOrder[a.priority || 'low'] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'date':
        default:
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          } else if (a.dueDate) {
            return -1;
          } else if (b.dueDate) {
            return 1;
          }
          return 0;
      }
    });

  // Get tags from context
  const allTags = Array.from(
    new Set(
      tags.map(tag => tag.name)
    )
  );

  // Priority color mapping
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

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get due date status
  const getDueDateStatus = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return 'overdue';
    } else if (date.toDateString() === today.toDateString()) {
      return 'today';
    }
    return '';
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        {/* Filter and Sort Bar - Only show if no filter prop is provided */}
        {!filter && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <FilterIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <Select
              value={filters.status}
              onValueChange={(value: any) => setFilter('status', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(value: any) => setFilter('priority', value)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy} onValueChange={(value: any) => setContextSortBy(value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Due Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setViewMode('list')}
              >
                <ListIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'outline'}
                size="icon"
                onClick={() => setViewMode('grid')}
              >
                <GridIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className={`space-y-3 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
          {filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onEditClick={(task) => {
                if (onEditTask) {
                  onEditTask(task);
                }
              }}
            />
          ))}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found. Create a new task to get started!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskList;