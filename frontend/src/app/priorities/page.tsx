'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const PrioritiesPage = () => {
  const { tasks } = useDashboard();

  // Group tasks by priority
  const highPriorityTasks = tasks.filter(task => task.priority === 'high');
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium');
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low');

  const priorityGroups = [
    { name: 'High Priority', tasks: highPriorityTasks, color: 'red', icon: '🚨' },
    { name: 'Medium Priority', tasks: mediumPriorityTasks, color: 'yellow', icon: '⚠️' },
    { name: 'Low Priority', tasks: lowPriorityTasks, color: 'blue', icon: '🔽' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Priorities"
        description="Organize and manage your tasks by priority level"
      />

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {priorityGroups.map((group, index) => (
          <div key={index} className="space-y-4">
            <div className={`p-4 rounded-lg border-l-4 ${
  group.color === 'red' ? 'border-red-500' :
  group.color === 'yellow' ? 'border-yellow-500' :
  'border-blue-500'
} bg-card`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{group.icon}</span>
                <h2 className="text-lg font-semibold">{group.name}</h2>
                <span className="ml-auto bg-muted px-2 py-1 rounded-full text-sm">
                  {group.tasks.length}
                </span>
              </div>
            </div>

            {group.tasks.length > 0 ? (
              <TaskList tasks={group.tasks.slice(0, 5)} /> // Show first 5 tasks
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>No tasks in this priority</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <EmptyState
          title="No tasks found"
          description="Create tasks to see them organized by priority"
          icon="📋"
        />
      )}
    </div>
  );
};

export default PrioritiesPage;