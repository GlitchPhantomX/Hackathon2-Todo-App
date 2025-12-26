'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import TaskList from '@/components/TaskList';
import AddTaskModal from '@/components/AddTaskModal';

const PrioritiesPage = () => {
  const { stats } = useDashboard();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low' | null>(null);

  const priorityData = [
    {
      id: 'high',
      title: 'High Priority',
      count: stats.byPriority.high,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      darkBgColor: 'dark:bg-red-900/30',
      darkBorderColor: 'dark:border-red-700'
    },
    {
      id: 'medium',
      title: 'Medium Priority',
      count: stats.byPriority.medium,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      darkBgColor: 'dark:bg-yellow-900/30',
      darkBorderColor: 'dark:border-yellow-700'
    },
    {
      id: 'low',
      title: 'Low Priority',
      count: stats.byPriority.low,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      darkBgColor: 'dark:bg-blue-900/30',
      darkBorderColor: 'dark:border-blue-700'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Priorities Overview"
          description="View tasks by priority level"
        />
        <Button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </div>

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Priority summary sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Priority Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {priorityData.map((priority) => (
                  <div
                    key={priority.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPriority === priority.id
                        ? `${priority.bgColor} ${priority.borderColor} ${priority.darkBgColor} ${priority.darkBorderColor}`
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedPriority(selectedPriority === priority.id ? null : priority.id as any)}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className={`font-semibold ${priority.color}`}>{priority.title}</h3>
                      <span className="text-xl font-bold">{priority.count}</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">tasks</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Tasks by priority */}
        <div className="lg:w-3/4 space-y-6">
          {selectedPriority ? (
            <>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {priorityData.find(p => p.id === selectedPriority)?.title} Tasks
                </h2>
              </div>

              <Card>
                <CardContent className="p-6">
                  <TaskList filter={{ priority: selectedPriority }} />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {priorityData.map((priority) => (
                    <div key={priority.id} className="border rounded-lg p-4">
                      <h3 className={`text-lg font-semibold mb-4 ${priority.color}`}>{priority.title}</h3>
                      <p className="text-3xl font-bold">{priority.count}</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">tasks</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
      />
    </div>
  );
};

export default PrioritiesPage;