'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import AddTaskModal from '@/components/AddTaskModal';

const UpcomingPage = () => {
  const { stats } = useDashboard();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Upcoming Tasks"
        description="Tasks due in the next 7 days"
      />

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters sidebar - hidden for upcoming view but could show relevant filters */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Upcoming:</span>
                  <span className="font-semibold">{stats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completed:</span>
                  <span className="font-semibold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-semibold text-amber-600">{stats.pending}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="lg:w-3/4 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tasks Due Soon</h2>
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
              <TaskList filter={{ dueDate: 'upcoming' }} />
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

export default UpcomingPage;