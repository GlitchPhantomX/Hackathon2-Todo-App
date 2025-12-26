'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/Calendar'; // Fixed import path
import { CalendarIcon, XIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDashboard } from '@/contexts/DashboardContext';

interface TaskFiltersProps {
  onFilterChange?: (filters: any) => void;
}

const TaskFilters = ({ onFilterChange }: TaskFiltersProps) => {
  const { filters, setFilter, projects, tags } = useDashboard();

  const handleStatusChange = (value: string) => {
    setFilter('status', value);
  };

  const handlePriorityChange = (value: string) => {
    setFilter('priority', value);
  };

  const handleProjectChange = (value: string) => {
    setFilter('project', value === 'all' ? null : value);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    setFilter('tags', newTags);
  };

  const clearFilters = () => {
    setFilter('status', 'all');
    setFilter('priority', 'all');
    setFilter('tags', []);
    setFilter('project', null);
    setFilter('dateRange', { start: null, end: null });
  };

  // Notify parent when filters change
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(filters);
    }
  }, [filters, onFilterChange]);

  return (
    <div className="border rounded-lg p-4 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <Label>Status</Label>
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                  Pending
                </div>
              </SelectItem>
              <SelectItem value="completed">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  Completed
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <Label>Priority</Label>
          <Select value={filters.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2"></div>
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags Filter */}
        <div>
          <Label>Tags</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start">
                <span className="flex-1 text-left">Select tags</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4" align="start">
              <div className="grid gap-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tag-${tag.id}`}
                      checked={filters.tags.includes(tag.name)}
                      onChange={() => handleTagToggle(tag.name)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={`tag-${tag.id}`} className="ml-2 text-sm">
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Project Filter */}
        <div>
          <Label>Project</Label>
          <Select value={filters.project || 'all'} onValueChange={handleProjectChange}>
            <SelectTrigger>
              <SelectValue placeholder="All Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.tags.length > 0 ||
        filters.project !== null) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <button onClick={() => setFilter('status', 'all')} className="ml-1">
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {filters.priority}
              <button onClick={() => setFilter('priority', 'all')} className="ml-1">
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.tags.map((tag: string) => (
            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
              Tag: {tag}
              <button onClick={() => handleTagToggle(tag)} className="ml-1">
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {filters.project && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Project: {projects.find(p => p.id === filters.project)?.name || filters.project}
              <button onClick={() => setFilter('project', null)} className="ml-1">
                <XIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Clear Filters Button */}
      {(filters.status !== 'all' ||
        filters.priority !== 'all' ||
        filters.tags.length > 0 ||
        filters.project !== null) && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;