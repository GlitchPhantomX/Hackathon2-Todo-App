'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const CompletedTasksPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only completed ones
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Completed Tasks"
        description="Tasks you've successfully completed"
      />

      <DashboardStats />

      {completedTasks.length > 0 ? (
        <TaskList tasks={completedTasks} />
      ) : (
        <EmptyState
          title="No completed tasks yet"
          description="Completed tasks will appear here"
          icon="✅"
        />
      )}
    </div>
  );
};

export default CompletedTasksPage;