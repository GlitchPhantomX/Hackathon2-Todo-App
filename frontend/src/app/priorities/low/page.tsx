'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const LowPriorityPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only low priority ones
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Low Priority Tasks"
        description="Tasks that can be handled when you have time"
      />

      <DashboardStats />

      {lowPriorityTasks.length > 0 ? (
        <TaskList tasks={lowPriorityTasks} />
      ) : (
        <EmptyState
          title="No low priority tasks"
          description="You're all caught up on low priority tasks"
          icon="✅"
        />
      )}
    </div>
  );
};

export default LowPriorityPage;