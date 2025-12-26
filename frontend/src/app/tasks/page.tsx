'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import TaskListSkeleton from '@/components/ui/Skeleton/TaskListSkeleton';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const TasksPage = () => {
  const { tasks, loading } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Tasks"
        description="Manage and organize all your tasks in one place"
      />

      <DashboardStats />

      {loading.tasks ? (
        <TaskListSkeleton />
      ) : tasks.length > 0 ? (
        <TaskList tasks={tasks} />
      ) : (
        <EmptyState
          title="No tasks yet"
          description="Create your first task to get started"
          icon="📋"
        />
      )}
    </div>
  );
};

export default TasksPage;