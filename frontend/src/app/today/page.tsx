'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const TodayPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only those due today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && task.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Today's Tasks"
        description="Tasks that are due today"
      />

      <DashboardStats />

      {todayTasks.length > 0 ? (
        <TaskList tasks={todayTasks} />
      ) : (
        <EmptyState
          title="No tasks for today"
          description="You have no tasks due today. Enjoy your free time!"
          icon="☀️"
        />
      )}
    </div>
  );
};

export default TodayPage;