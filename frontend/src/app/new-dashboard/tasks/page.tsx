'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
import EditTaskModal from '@/components/EditTaskModal';
import TaskDetail from '@/components/TaskDetail';
import { Task } from '@/types/task.types';

const TasksPage = () => {
  const { stats } = useDashboard();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewingTaskDetail, setViewingTaskDetail] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setViewingTaskDetail(task);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
    setViewingTaskDetail(null);
  };

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
              <TaskList 
                onEditTask={handleEditTask}
                onTaskClick={handleTaskClick}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />

      <EditTaskModal
        isOpen={isEditTaskModalOpen}
        onClose={() => {
          setIsEditTaskModalOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
      />

      {/* Task Detail Modal */}
      {viewingTaskDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <TaskDetail
              task={viewingTaskDetail}
              onClose={() => setViewingTaskDetail(null)}
              onEdit={() => handleEditTask(viewingTaskDetail)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;