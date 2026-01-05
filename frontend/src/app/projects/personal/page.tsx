'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const PersonalProjectPage = () => {
  const { tasks, projects } = useDashboard();

  // Filter tasks to show only personal ones
  const personalTasks = tasks.filter(task =>
    task.tags?.includes('personal') ||
    (task.projectId && projects.some(project =>
      project.id === task.projectId &&
      project.name.toLowerCase().includes('personal')
    )) ||
    task.title.toLowerCase().includes('personal') ||
    task.description?.toLowerCase().includes('personal')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Personal Projects"
        description="Tasks related to your personal goals"
      />

      <DashboardStats />

      {personalTasks.length > 0 ? (
        <TaskList tasks={personalTasks} />
      ) : (
        <EmptyState
          title="No personal tasks found"
          description="Tasks tagged as personal will appear here"
          icon="🏠"
        />
      )}
    </div>
  );
};

export default PersonalProjectPage;