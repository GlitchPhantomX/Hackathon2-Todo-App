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
import { XIcon, Filter, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDashboard } from '@/contexts/DashboardContext';

interface FilterState {
  status: 'all' | 'pending' | 'completed';
  priority: 'all' | 'high' | 'medium' | 'low';
  tags: string[];
  dateRange: { start: Date | null; end: Date | null };
  project: string | null;
}

interface TaskFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
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

  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.tags.length > 0 ||
    filters.project !== null;

  return (
    <div className="space-y-4">
      {/* Status Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Status
        </Label>
        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span>Pending</span>
              </div>
            </SelectItem>
            <SelectItem value="completed">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Completed</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Priority
        </Label>
        <Select value={filters.priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>High</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
            </SelectItem>
            <SelectItem value="low">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Low</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Project Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Project
        </Label>
        <Select value={filters.project || 'all'} onValueChange={handleProjectChange}>
          <SelectTrigger className="w-full">
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

      {/* Tags Filter */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Tags
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between font-normal"
            >
              <span className="flex-1 text-left text-sm">
                {filters.tags.length > 0 
                  ? `${filters.tags.length} tag(s) selected` 
                  : 'Select tags'}
              </span>
              <Filter className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="start">
            <div className="space-y-2">
              <div className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                Select Tags
              </div>
              {tags.length > 0 ? (
                <div className="space-y-2 max-h-[250px] overflow-y-auto">
                  {tags.map((tag) => (
                    <label
                      key={tag.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.tags.includes(tag.name)}
                          onChange={() => handleTagToggle(tag.name)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        {filters.tags.includes(tag.name) && (
                          <Check className="h-3 w-3 absolute left-0.5 top-0.5 text-white pointer-events-none" />
                        )}
                      </div>
                      <Badge
                        style={{ 
                          backgroundColor: `${tag.color}15`, 
                          color: tag.color,
                          borderColor: `${tag.color}30`
                        }}
                        className="text-xs border flex-1"
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1.5 inline-block"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </Badge>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
                  No tags available
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Active Filters
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 pr-1"
              >
                <span className="text-xs">Status: {filters.status}</span>
                <button 
                  onClick={() => setFilter('status', 'all')} 
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.priority !== 'all' && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 pr-1"
              >
                <span className="text-xs">Priority: {filters.priority}</span>
                <button 
                  onClick={() => setFilter('priority', 'all')} 
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {filters.tags.map((tag: string) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="flex items-center gap-1.5 pr-1"
              >
                <span className="text-xs">{tag}</span>
                <button 
                  onClick={() => handleTagToggle(tag)} 
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            
            {filters.project && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1.5 pr-1"
              >
                <span className="text-xs">
                  {projects.find(p => p.id === filters.project)?.name || 'Project'}
                </span>
                <button 
                  onClick={() => setFilter('project', null)} 
                  className="hover:bg-gray-300 dark:hover:bg-gray-600 rounded p-0.5 transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskFilters;