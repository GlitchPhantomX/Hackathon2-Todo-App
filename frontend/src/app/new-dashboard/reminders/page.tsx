'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BellIcon, PlusIcon, MoreHorizontalIcon } from 'lucide-react';
import TaskList from '@/components/TaskList';
import AddTaskModal from '@/components/AddTaskModal';

const RemindersPage = () => {
  const { stats, notifications } = useDashboard();
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<string | null>(null);

  // Filter notifications that are reminders
  const reminderNotifications = notifications.filter(notification =>
    notification.type === 'reminder' || notification.title.includes('Reminder')
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Reminders"
          description="Manage your task reminders and notifications"
        />
        <Button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Reminder
        </Button>
      </div>

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Reminders sidebar */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Your Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminderNotifications.length > 0 ? (
                  reminderNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedReminder === notification.id
                          ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setSelectedReminder(notification.id === selectedReminder ? null : notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <BellIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <h3 className="font-medium">{notification.title}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle reminder actions
                          }}
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {!notification.read && (
                        <div className="mt-2 flex items-center">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                          <span className="text-xs text-blue-500">Unread</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reminders scheduled.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Tasks with reminders */}
        <div className="lg:w-3/4 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Tasks with Reminders</h2>
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

export default RemindersPage;