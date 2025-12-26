'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const StudyProjectPage = () => {
  const { tasks } = useDashboard();

  // Filter tasks to show only study-related ones
  const studyTasks = tasks.filter(task =>
    task.tags?.includes('study') ||
    task.project?.toLowerCase().includes('study') ||
    task.title.toLowerCase().includes('study') ||
    task.description?.toLowerCase().includes('study')
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Study Projects"
        description="Tasks related to your learning and education"
      />

      <DashboardStats />

      {studyTasks.length > 0 ? (
        <TaskList tasks={studyTasks} />
      ) : (
        <EmptyState
          title="No study tasks found"
          description="Tasks tagged as study will appear here"
          icon="📚"
        />
      )}
    </div>
  );
};

export default StudyProjectPage;