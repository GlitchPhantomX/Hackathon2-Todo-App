'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const UpcomingPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only upcoming tasks (due in the future, not completed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() > today.getTime() && task.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upcoming Tasks"
        description="Tasks due in the future"
      />

      <DashboardStats />

      {upcomingTasks.length > 0 ? (
        <TaskList tasks={upcomingTasks} />
      ) : (
        <EmptyState
          title="No upcoming tasks"
          description="You have no tasks scheduled for the future"
          icon="📅"
        />
      )}
    </div>
  );
};

export default UpcomingPage;