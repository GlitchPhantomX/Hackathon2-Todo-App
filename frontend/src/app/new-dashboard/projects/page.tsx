'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon, MoreHorizontalIcon, Edit2, Trash2, FolderIcon } from 'lucide-react';
import { Project } from '@/types/types';
import TaskList from '@/components/TaskList';
import ProjectModal from '@/components/ProjectModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const handleDeleteProject = async (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? All tasks in this project will be unassigned.')) {
      await deleteProject(projectId);
      if (selectedProject === projectId) {
        setSelectedProject(null);
      }
    }
  };

  const handleProjectSubmit = async (projectData: Omit<Project, 'id'>) => {
    if (editingProject) {
      const baseUpdates = {
        name: projectData.name !== editingProject.name ? projectData.name : undefined,
        description: projectData.description !== editingProject.description ? projectData.description : undefined,
        color: projectData.color !== editingProject.color ? projectData.color : undefined,
        icon: projectData.icon !== editingProject.icon ? projectData.icon : undefined,
      };

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
    const taskCount = stats.total;
    return { ...project, taskCount };
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20">
      <div className="mx-auto max-w-[1800px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Projects"
            description="Manage your projects and organize your tasks"
          />
          <Button
            onClick={handleCreateProject}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Projects (4 cols) */}
          <aside className="lg:col-span-4 space-y-4">
            <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Your Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                <div className="space-y-3">
                  {projectWithTaskCounts.map((project) => (
                    <div
                      key={project.id}
                      className={`group border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedProject === project.id
                          ? 'bg-blue-50 border-blue-300 dark:bg-blue-950/30 dark:border-blue-700 shadow-md'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedProject(project.id === selectedProject ? null : project.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${project.color}20` }}
                          >
                            <FolderIcon
                              className="h-5 w-5"
                              style={{ color: project.color }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100 truncate">
                              {project.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                              {project.description || 'No description'}
                            </p>
                            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {project.taskCount || 0} tasks
                            </div>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleEditProject(project);
                            }}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProject(project.id);
                              }}
                              className="text-red-600 dark:text-red-400 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                  {projectWithTaskCounts.length === 0 && (
                    <div className="text-center py-12">
                      <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                        <FolderIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                        No projects found
                      </p>
                      <Button
                        onClick={handleCreateProject}
                        variant="outline"
                        size="sm"
                        className="text-blue-600 hover:text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-950/30"
                      >
                        <PlusIcon className="h-4 w-4 mr-1.5" />
                        Create your first project
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content - Tasks (8 cols) */}
          <main className="lg:col-span-8 space-y-6">
            {selectedProject ? (
              <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Tasks in {projects.find(p => p.id === selectedProject)?.name}
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      View and manage all tasks in this project
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <TaskList filter={{ project: selectedProject }} />
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm">
                <CardContent className="p-12 text-center">
                  <div className="rounded-full bg-gray-100 dark:bg-gray-800 p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <FolderIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    No Project Selected
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a project from the sidebar to view its tasks
                  </p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Project Modal */}
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