'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import TaskFilters from '@/components/TaskFilters';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import AddTaskModal from '@/components/AddTaskModal';

const TasksPage = () => {
  const { stats } = useDashboard();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="All Tasks"
        description="View and manage all your tasks in one place"
      />

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskFilters />
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:w-3/4 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Task List</h2>
            <Button
              onClick={() => setIsAddTaskModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <TaskList />
            </CardContent>
          </Card>
        </div>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </div>
  );
};

export default TasksPage;