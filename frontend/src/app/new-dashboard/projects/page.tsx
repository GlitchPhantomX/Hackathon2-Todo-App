'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, MoreHorizontalIcon } from 'lucide-react';
import { Project } from '@/types/types';
import TaskList from '@/components/TaskList';
import ProjectModal from '@/components/ProjectModal';

const ProjectsPage = () => {
  const { stats, projects, createProject, updateProject, deleteProject } = useDashboard();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const handleCreateProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleProjectSubmit = async (projectData: Omit<Project, 'id'>) => {
    if (editingProject) {
      // Create a base object with potentially undefined values
      const baseUpdates = {
        name: projectData.name !== editingProject.name ? projectData.name : undefined,
        description: projectData.description !== editingProject.description ? projectData.description : undefined,
        color: projectData.color !== editingProject.color ? projectData.color : undefined,
        icon: projectData.icon !== editingProject.icon ? projectData.icon : undefined,
      };

      // Filter out undefined values to create the final updates object
      const updates = Object.fromEntries(
        Object.entries(baseUpdates).filter(([_, value]) => value !== undefined)
      ) as Partial<Project>;

      await updateProject(editingProject.id, updates);
    } else {
      await createProject(projectData);
    }
    setIsProjectModalOpen(false);
  };

  // Calculate task counts for each project
  const projectWithTaskCounts = projects.map(project => {
    const taskCount = stats.total; // In a real app, this would be calculated based on tasks with projectId
    return { ...project, taskCount };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Projects"
          description="Manage your projects and organize your tasks"
        />
        <Button
          onClick={handleCreateProject}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Projects sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projectWithTaskCounts.map((project) => (
                  <div
                    key={project.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedProject === project.id
                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProject(project);
                        }}
                      >
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 text-xs text-gray-500">
                      {project.taskCount || 0} tasks
                    </div>
                  </div>
                ))}

                {projectWithTaskCounts.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No projects found. Create your first project to get started.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Tasks for selected project */}
        <div className="lg:w-3/4 space-y-6">
          {selectedProject ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  Tasks in {projects.find(p => p.id === selectedProject)?.name}
                </h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  <TaskList filter={{ project: selectedProject }} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                <p>Select a project to view its tasks</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
        project={editingProject}
      />
    </div>
  );
};

export default ProjectsPage;