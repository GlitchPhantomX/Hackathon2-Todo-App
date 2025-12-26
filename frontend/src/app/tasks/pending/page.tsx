'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const PendingTasksPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only pending ones
  const pendingTasks = tasks.filter(task => task.status === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pending Tasks"
        description="Tasks that require your attention"
      />

      <DashboardStats />

      {pendingTasks.length > 0 ? (
        <TaskList tasks={pendingTasks} />
      ) : (
        <EmptyState
          title="No pending tasks"
          description="Great job! You're all caught up."
          icon="🎉"
        />
      )}
    </div>
  );
};

export default PendingTasksPage;