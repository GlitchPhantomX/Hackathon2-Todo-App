'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FilterIcon,
  GridIcon,
  ListIcon,
} from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { useTaskSync } from '@/contexts/TaskSyncContext';
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
  onTaskClick?: (task: Task) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  filter?: FilterOptions;
}

const TaskList: React.FC<TaskListProps> = ({ 
  tasks: propTasks, 
  onEditTask, 
  onTaskClick,
  onSelectionChange,
  filter 
}) => {
  const {
    tasks: dashboardTasks,
    filters,
    setFilter,
    setSortBy: setContextSortBy,
    sortBy,
    tags
  } = useDashboard();
  const { tasks: syncTasks } = useTaskSync();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // ✅ Use propTasks if provided, otherwise dashboardTasks
  const allTasks: Task[] = useMemo(() => {
    return propTasks || dashboardTasks || [];
  }, [propTasks, dashboardTasks]);

  console.log('📋 TaskList render:', {
    propTasks: propTasks?.length || 0,
    syncTasks: syncTasks?.length || 0,
    dashboardTasks: dashboardTasks?.length || 0,
    allTasks: allTasks.length,
    filters,
    sortBy
  });

  // ✅ Helper: Check if date matches filter
  const matchesDateFilter = (task: Task, dateFilter: string): boolean => {
    if (!task.dueDate) return false;

    const taskDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);

    const taskTime = taskDate.getTime();
    const todayTime = today.getTime();

    if (dateFilter === 'today') {
      return taskTime === todayTime;
    }

    if (dateFilter === 'upcoming') {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return taskTime > todayTime && taskTime <= nextWeek.getTime();
    }

    if (dateFilter === 'overdue') {
      return taskTime < todayTime;
    }

    return true;
  };

  // ✅ Filter and sort tasks
  const filteredTasks: Task[] = useMemo(() => {
    let result = [...allTasks];

    // 1. Apply prop filter (if provided)
    if (filter) {
      if (filter.status) {
        result = result.filter(task => task.status === filter.status);
      }
      if (filter.priority) {
        result = result.filter(task => task.priority === filter.priority);
      }
      if (filter.dueDate) {
        result = result.filter(task => matchesDateFilter(task, filter.dueDate!));
      }
      if (filter.project) {
        result = result.filter(task => task.projectId === filter.project);
      }
      if (filter.tag) {
        result = result.filter(task => task.tags?.includes(filter.tag!));
      }
    }

    // 2. Apply context filters (only if no prop filter)
    if (!filter && filters) {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        result = result.filter(task => task.status === filters.status);
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'all') {
        result = result.filter(task => task.priority === filters.priority);
      }

      // Project filter
      if (filters.project && filters.project !== 'all') {
        result = result.filter(task => task.projectId === filters.project);
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        result = result.filter(task => 
          task.tags?.some(tag => filters.tags?.includes(tag))
        );
      }
    }

    // 3. Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task => {
        const titleMatch = task.title?.toLowerCase().includes(query);
        const descriptionMatch = task.description?.toLowerCase().includes(query);
        const tagsMatch = task.tags?.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || descriptionMatch || tagsMatch;
      });
    }

    // 4. Sort tasks
    const currentSort = sortBy || 'date';
    result.sort((a, b) => {
      if (currentSort === 'priority') {
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority || 'low'] || 0;
        const bPriority = priorityOrder[b.priority || 'low'] || 0;
        return bPriority - aPriority;
      }

      if (currentSort === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }

      // Default: sort by date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

    return result;
  }, [allTasks, filter, filters, searchQuery, sortBy]);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        {/* Filter and Sort Bar */}
        {!filter && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <FilterIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value: string) => setFilter('status', value)}
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
              value={filters.priority || 'all'}
              onValueChange={(value: string) => setFilter('priority', value)}
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

            <Select
              value={sortBy || 'date'}
              onValueChange={(value: string) => setContextSortBy(value as 'date' | 'priority' | 'title')}
            >
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

        {/* Task List with Scroll */}
        <ScrollArea className="h-[600px] pr-4">
          <div className={`space-y-3 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : ''}`}>
            {filteredTasks.map((task: Task) => (
              <TaskItem
                key={task.id}
                task={task}
                onEditClick={(task: Task) => {
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
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TaskList;