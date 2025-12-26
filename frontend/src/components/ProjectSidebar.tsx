import React, { useState, useEffect } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase,
  Home,
  BookOpen,
  Plus,
  MoreHorizontal,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Project } from '@/types/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ProjectSidebarProps {
  selectedProjectId: string | null;
  onProjectSelect: (projectId: string | null) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ selectedProjectId, onProjectSelect }) => {
  const { projects, loading, error } = useProjects();
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});
  const [defaultProjects] = useState<Project[]>([
    {
      id: 'default-work',
      name: 'Work',
      description: 'Work-related tasks',
      color: '#3B82F6',
      icon: 'Briefcase',
      userId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-personal',
      name: 'Personal',
      description: 'Personal tasks',
      color: '#10B981',
      icon: 'Home',
      userId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'default-study',
      name: 'Study',
      description: 'Study and learning tasks',
      color: '#8B5CF6',
      icon: 'BookOpen',
      userId: 'default',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  // Toggle project expansion
  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }));
  };

  // Get icon component based on icon name
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="h-4 w-4 mr-2" />;
      case 'Home':
        return <Home className="h-4 w-4 mr-2" />;
      case 'BookOpen':
        return <BookOpen className="h-4 w-4 mr-2" />;
      default:
        return <Briefcase className="h-4 w-4 mr-2" />;
    }
  };

  // Get icon element for default projects
  const getDefaultIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="h-4 w-4 mr-2" />;
      case 'Home':
        return <Home className="h-4 w-4 mr-2" />;
      case 'BookOpen':
        return <BookOpen className="h-4 w-4 mr-2" />;
      default:
        return <Briefcase className="h-4 w-4 mr-2" />;
    }
  };

  if (loading) {
    return <div className="p-2">Loading projects...</div>;
  }

  if (error) {
    return <div className="p-2 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-muted-foreground">Projects</h3>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Default projects */}
      {defaultProjects.map((project) => (
        <div key={project.id} className="space-y-1">
          <div
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${
              selectedProjectId === project.id ? 'bg-accent' : ''
            }`}
            onClick={() => onProjectSelect(project.id)}
          >
            <div className="flex items-center">
              {getDefaultIcon(project.icon)}
              <span className="text-sm">{project.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {projects.filter(t => t.projectId === project.id).length}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}

      {/* User projects */}
      {projects.map((project) => (
        <div key={project.id} className="space-y-1">
          <div
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${
              selectedProjectId === project.id ? 'bg-accent' : ''
            }`}
            onClick={() => onProjectSelect(project.id)}
          >
            <div className="flex items-center">
              {getIcon(project.icon || 'Briefcase')}
              <span className="text-sm">{project.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {projects.filter(t => t.projectId === project.id).length}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectSidebar;