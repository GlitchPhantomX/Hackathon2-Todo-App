'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const WorkProjectPage = () => {
  const { tasks, projects } = useDashboard();

  // Filter tasks to show only work-related ones (you might need to adjust this based on your data structure)
  const workTasks = tasks.filter(task =>
    task.tags?.includes('work') ||
    (task.projectId && projects.some(project =>
      project.id === task.projectId &&
      project.name.toLowerCase().includes('work')
    )) ||
    task.title.toLowerCase().includes('work') ||
    task.description?.toLowerCase().includes('work')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Projects"
        description="Tasks related to your work responsibilities"
      />

      <DashboardStats />

      {workTasks.length > 0 ? (
        <TaskList tasks={workTasks} />
      ) : (
        <EmptyState
          title="No work tasks found"
          description="Tasks tagged as work will appear here"
          icon="💼"
        />
      )}
    </div>
  );
};

export default WorkProjectPage;