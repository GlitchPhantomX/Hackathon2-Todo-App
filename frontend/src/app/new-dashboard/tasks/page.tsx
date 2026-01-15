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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20">
      {/* Main Container */}
      <div className="mx-auto max-w-[1800px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Page Header */}
        <PageHeader
          title="All Tasks"
          description="View and manage all your tasks in one place"
        />

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Filters (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800 pb-3">
                <CardTitle className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <TaskFilters />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area (9 cols) */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* Task List Card */}
            <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                      Task List
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage and organize your tasks
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200"
                    size="default"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TaskList 
                  onEditTask={handleEditTask}
                  onTaskClick={handleTaskClick}
                />
              </CardContent>
            </Card>
          </main>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
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