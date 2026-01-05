'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TaskFilter as TaskFilterState } from '@/types/task.types';

interface TaskFilterProps {
  filter: TaskFilterState;
  onFilterChange: (filter: TaskFilterState) => void;
  onRefresh: () => void;
}


export const TaskFilter: React.FC<TaskFilterProps> = ({
  filter,
  onFilterChange,
  onRefresh
}) => {
  const handleStatusChange = (status: 'all' | 'active' | 'completed') => {
    onFilterChange({
      ...filter,
      status
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      search: e.target.value
    });
  };

  const clearSearch = () => {
    onFilterChange({
      ...filter,
      search: ''
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter.status === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('all')}
          >
            All
            <span className="ml-1 bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {filter.allCount || 0}
            </span>
          </Button>
          <Button
            variant={filter.status === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('active')}
          >
            Active
            <span className="ml-1 bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {filter.activeCount || 0}
            </span>
          </Button>
          <Button
            variant={filter.status === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleStatusChange('completed')}
          >
            Completed
            <span className="ml-1 bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {filter.completedCount || 0}
            </span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search tasks..."
              value={filter.search || ''}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {filter.search && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="flex items-center"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </Button>
        </div>
      </div>
    </div>
  );
};