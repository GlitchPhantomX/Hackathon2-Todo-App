'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const MediumPriorityPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only medium priority ones
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medium Priority Tasks"
        description="Tasks that need attention but aren't urgent"
      />

      <DashboardStats />

      {mediumPriorityTasks.length > 0 ? (
        <TaskList tasks={mediumPriorityTasks} />
      ) : (
        <EmptyState
          title="No medium priority tasks"
          description="You're all caught up on medium priority tasks"
          icon="📋"
        />
      )}
    </div>
  );
};

export default MediumPriorityPage;