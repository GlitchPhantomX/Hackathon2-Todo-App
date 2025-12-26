'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const TagsPage = () => {
  const { tasks } = useDashboard();

  // Get all unique tags from tasks
  const allTags = Array.from(
    new Set(
      tasks.flatMap(task => task.tags || [])
    )
  );

  // For demonstration, let's show tasks for the first tag if any exist
  const firstTag = allTags.length > 0 ? allTags[0] : null;
  const tagTasks = firstTag
    ? tasks.filter(task => task.tags?.includes(firstTag))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tags"
        description="Manage and organize your tasks with tags"
      />

      <DashboardStats />

      {allTags.length > 0 ? (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Your Tags</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {tagTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Tasks with tag: #{firstTag}</h3>
              <TaskList tasks={tagTasks} />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No tags created yet"
          description="Add tags to your tasks to organize them by category"
          icon="🏷️"
        />
      )}
    </div>
  );
};

export default TagsPage;