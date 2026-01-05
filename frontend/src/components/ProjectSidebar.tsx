import React, { useState } from 'react';
import { useProjects } from '@/contexts/ProjectsContext';
import { useTaskSync } from '@/contexts/TaskSyncContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Briefcase,
  Home,
  BookOpen,
  Plus,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectSidebarProps {
  selectedProjectId?: string | null;
  onProjectSelect?: (projectId: string | null) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ selectedProjectId, onProjectSelect }) => {
  const { projects, loading, error, createProject } = useProjects();
  const { tasks } = useTaskSync();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [newProjectIcon, setNewProjectIcon] = useState('Briefcase');


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

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      await createProject({
        name: newProjectName.trim(),
        color: newProjectColor,
        icon: newProjectIcon,
        description: `Project: ${newProjectName.trim()}`
      });
      setNewProjectName('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Error creating project:', err);
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
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* User projects */}
      {projects.map((project) => (
        <div key={project.id} className="space-y-1">
          <div
            className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-accent ${
              selectedProjectId === project.id ? 'bg-accent' : ''
            }`}
            onClick={() => onProjectSelect?.(project.id)}
          >
            <div className="flex items-center">
              {getIcon(project.icon || 'Briefcase')}
              <span className="text-sm">{project.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="secondary" className="text-xs">
                {tasks.filter(task => task.projectId === project.id).length}
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

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <Input
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Enter project name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={newProjectColor}
                    onChange={(e) => setNewProjectColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <span className="text-sm">{newProjectColor}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Icon</label>
                <Select value={newProjectIcon} onValueChange={setNewProjectIcon}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Briefcase">Briefcase</SelectItem>
                    <SelectItem value="Home">Home</SelectItem>
                    <SelectItem value="BookOpen">Book</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateProject}>
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar;