'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const RemindersPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only overdue tasks (due in the past, not completed)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const reminderTasks = tasks.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() < today.getTime() && task.status !== 'completed';
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reminders"
        description="Tasks that are overdue and need attention"
      />

      <DashboardStats />

      {reminderTasks.length > 0 ? (
        <TaskList tasks={reminderTasks} />
      ) : (
        <EmptyState
          title="No reminders"
          description="You're all caught up! No overdue tasks."
          icon="✅"
        />
      )}
    </div>
  );
};

export default RemindersPage;