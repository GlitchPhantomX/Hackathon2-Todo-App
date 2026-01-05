import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Project } from '@/types/types';
import { Briefcase, Home, BookOpen, Palette } from 'lucide-react';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (projectData: Omit<Project, 'id'>) => Promise<void>;
  project?: Project | null;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose, onSubmit, project }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [color, setColor] = useState(project?.color || '#3B82F6');
  const [icon, setIcon] = useState(project?.icon || 'Briefcase');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const iconOptions = [
    { value: 'Briefcase', label: 'Briefcase', icon: <Briefcase className="h-4 w-4" /> },
    { value: 'Home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { value: 'BookOpen', label: 'BookOpen', icon: <BookOpen className="h-4 w-4" /> },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (project) {
        // Update existing project - only pass the updatable fields
        await onSubmit({
          name,
          description,
          color,
          icon,
          userId: project.userId, // Keep the original userId
          createdAt: project.createdAt, // Keep the original createdAt
          updatedAt: new Date().toISOString(), // Update the timestamp
        });
      } else {
        // Create new project
        await onSubmit({
          name,
          description,
          color,
          icon,
          userId: '', // Will be filled by backend
          createdAt: new Date().toISOString(), // Will be set by backend
          updatedAt: new Date().toISOString(), // Will be set by backend
        });
      }
      onClose();
      // Reset form
      setName('');
      setDescription('');
      setColor('#3B82F6');
      setIcon('Briefcase');
    } catch (error) {
      console.error('Error saving project:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{project ? 'Edit Project' : 'Create Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex space-x-2">
              {iconOptions.map((iconOpt) => (
                <Button
                  key={iconOpt.value}
                  type="button"
                  variant={icon === iconOpt.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setIcon(iconOpt.value)}
                >
                  {iconOpt.icon}
                  <span className="ml-1">{iconOpt.label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-1">
                <Palette className="h-4 w-4" />
                <span className="text-sm">{color}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : project ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectModal;