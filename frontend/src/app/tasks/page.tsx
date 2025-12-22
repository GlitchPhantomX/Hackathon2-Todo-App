'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { Spinner } from '@/components/ui/Spinner';
import { useAuth } from '@/contexts/AuthContext';
import { getTasks, deleteTask, toggleTaskCompletion } from '@/services/taskService';
import { Task, TaskFilter as TaskFilterType } from '@/types/task.types';
import { Plus, RefreshCw } from 'lucide-react';

// Dynamically import heavy components
const TaskFilter = React.lazy(() => import('@/components/tasks/TaskFilter'));
const TaskList = React.lazy(() => import('@/components/tasks/TaskList'));

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<TaskFilterType>({
    status: 'all',
    search: '',
    allCount: 0,
    activeCount: 0,
    completedCount: 0,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filter.search, filter.status]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await getTasks();
      setTasks(tasksData);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Calculate counts first
    const allCount = tasks.length;
    const activeCount = tasks.filter(task => !task.completed).length;
    const completedCount = tasks.filter(task => task.completed).length;

    // Update filter with counts
    setFilter(prev => ({
      ...prev,
      allCount,
      activeCount,
      completedCount
    }));

    let result = [...tasks];

    // Apply search filter first
    if (filter.search) {
      const searchTerm = filter.search.toLowerCase();
      result = result.filter(
        task =>
          task.title.toLowerCase().includes(searchTerm) ||
          (task.description && task.description.toLowerCase().includes(searchTerm)) ||
          (task.dueDate && task.dueDate.toLowerCase().includes(searchTerm))
      );
    }

    // Apply status filter
    if (filter.status === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter.status === 'completed') {
      result = result.filter(task => task.completed);
    }

    setFilteredTasks(result);
  };

  const handleFilterChange = (newFilter: TaskFilterType) => {
    setFilter(newFilter);
  };

  const handleRefresh = () => {
    fetchTasks();
  };

  const handleToggleTask = async (id: string, completed: boolean) => {
    try {
      const updatedTask = await toggleTaskCompletion(id);
      // Update the task in the local state
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? updatedTask : task
        )
      );
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const handleEditTask = (id: string) => {
    // Navigate to the edit page - this would be handled by the router in a real implementation
    window.location.href = `/tasks/edit/${id}`;
  };

  const handleDeleteTask = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      } catch (err: any) {
        setError(err.message || 'Failed to delete task');
      }
    }
  };

  const activeTasksCount = tasks.filter(task => !task.completed).length;
  const completedTasksCount = tasks.filter(task => task.completed).length;
  const totalTasksCount = tasks.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your tasks ({totalTasksCount} total, {activeTasksCount} active, {completedTasksCount} completed)
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/tasks/create">
            <Button variant="primary" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              New Task
            </Button>
          </Link>
        </div>
      </div>

      {error && <Alert variant="error" onClose={() => setError(null)}>{error}</Alert>}

      <Suspense fallback={<div className="p-4"><Spinner size="md" /></div>}>
        <TaskFilter
          filter={filter}
          onFilterChange={handleFilterChange}
          onRefresh={handleRefresh}
        />
      </Suspense>

      <Card className="p-0">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            {filter.status === 'all'
              ? 'All Tasks'
              : filter.status === 'active'
                ? 'Active Tasks'
                : 'Completed Tasks'}
            <span className="text-gray-500 ml-2">({filteredTasks.length})</span>
          </h2>
        </div>
        <div className="p-4">
          <Suspense fallback={<div className="flex justify-center py-8"><Spinner size="lg" /></div>}>
            <TaskList
              tasks={filteredTasks}
              onTaskUpdate={handleToggleTask}
              onToggle={handleToggleTask}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              loading={loading}
            />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}