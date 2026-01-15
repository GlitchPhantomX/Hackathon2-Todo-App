'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EditTaskModal from '@/components/EditTaskModal';
import TaskDetail from '@/components/TaskDetail';
import { Task } from '@/types/task.types';

const StudyProjectPage = () => {
  const { stats } = useDashboard();
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
      <div className="mx-auto max-w-[1800px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6">
        
        {/* Page Header */}
        <PageHeader
          title="Study Project"
          description="Tasks related to your study projects"
        />

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Task List */}
        <Card className="border-gray-200/60 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b border-gray-100 dark:border-gray-800">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Study Tasks
              </CardTitle>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage all your study project tasks
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <TaskList 
              filter={{ project: 'study' }}
              onEditTask={handleEditTask}
              onTaskClick={handleTaskClick}
            />
          </CardContent>
        </Card>
      </div>

      {/* Edit Task Modal */}
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

export default StudyProjectPage;