'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import EmptyState from '@/components/EmptyState';

const ProjectsPage = () => {
  const { tasks } = useDashboard();

  // Get all unique projects from tasks
  const allProjects = Array.from(
    new Set(
      tasks
        .filter(task => task.projectId)
        .map(task => task.projectId)
        .filter(Boolean) as string[]
    )
  );

  // For demonstration, let's show tasks for the first project if any exist
  const firstProject = allProjects.length > 0 ? allProjects[0] : null;
  const projectTasks = firstProject
    ? tasks.filter(task => task.projectId === firstProject)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Organize your tasks by project"
      />

      <DashboardStats />

      {allProjects.length > 0 ? (
        <div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Your Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allProjects.map((project, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                >
                  <h3 className="font-semibold">{project}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tasks.filter(t => t.projectId === project).length} tasks
                  </p>
                </div>
              ))}
            </div>
          </div>

          {projectTasks.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Tasks in: {firstProject}</h3>
              <TaskList tasks={projectTasks} />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          title="No projects created yet"
          description="Group your tasks by projects for better organization"
          icon="📁"
        />
      )}
    </div>
  );
};

export default ProjectsPage;