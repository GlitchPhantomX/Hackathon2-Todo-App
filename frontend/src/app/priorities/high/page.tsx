'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic'; // ✅ Ensure this is a client component

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const HighPriorityPage = () => {
  const { tasks } = useDashboard(); // ✅ Safe now, because provider is in layout

  // Filter tasks to show only high priority ones
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');

  return (
    <div className="space-y-6">
      <PageHeader
        title="High Priority Tasks"
        description="Urgent tasks that require immediate attention"
      />

      <DashboardStats />

      {highPriorityTasks.length > 0 ? (
        <TaskList tasks={highPriorityTasks} />
      ) : (
        <EmptyState
          title="No high priority tasks"
          description="You're all caught up on urgent tasks"
          icon="🚨"
        />
      )}
    </div>
  );
};

export default HighPriorityPage;
