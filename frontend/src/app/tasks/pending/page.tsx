'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React from 'react';
import { useTaskSync } from '@/contexts/TaskSyncContext'; // ← switched from useDashboard
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';
import { Task as ChatTask } from '@/types/chat.types';
import { Task } from '@/types/types';

// Convert chat.types.Task to app Task type
const convertChatTaskToTask = (chatTask: ChatTask): Task => {
  const baseTask: Task = {
    id: chatTask.id,
    title: chatTask.title,
    description: chatTask.description,
    completed: chatTask.status === 'completed',
    status: chatTask.status === 'in_progress' ? 'pending' : chatTask.status as 'pending' | 'completed',
    createdAt: chatTask.created_at,
    updatedAt: chatTask.updated_at,
    userId: chatTask.user_id,
    priority: chatTask.priority === 'urgent' ? 'high' : (chatTask.priority as 'low' | 'medium' | 'high'),
  };

  // Add optional fields if they exist and are not null
  if (chatTask.due_date) {
    baseTask.dueDate = chatTask.due_date;
  }

  if (chatTask.projectId) {
    baseTask.projectId = chatTask.projectId;
  }

  return baseTask;
};

const PendingTasksPage = () => {
  const { tasks } = useTaskSync();

  // Convert tasks to app Task type
  const convertedTasks: Task[] = tasks.map(convertChatTaskToTask);

  // Filter only pending tasks
  const pendingTasks = convertedTasks.filter(task => task.status === 'pending');

  return (
    <div className="space-y-6">
      <PageHeader title="Pending Tasks" description="Tasks that require your attention" />
      <DashboardStats />
      {pendingTasks.length > 0 ? (
        <TaskList tasks={pendingTasks} />
      ) : (
        <EmptyState title="No pending tasks" description="Great job! You're all caught up." icon="🎉" />
      )}
    </div>
  );
};

export default PendingTasksPage;
