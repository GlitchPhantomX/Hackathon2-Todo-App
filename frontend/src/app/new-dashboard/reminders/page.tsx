'use client';
export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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
    <div 
      className="p-6 space-y-6"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="flex justify-between items-center">
        <PageHeader
          title="Reminders"
          description="Manage your task reminders and notifications"
        />
        <Button
          onClick={() => setIsAddTaskModalOpen(true)}
          className="text-white shadow-sm"
          style={{
            background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
          }}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Reminder
        </Button>
      </div>

      <DashboardStats />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Reminders sidebar */}
        <div className="lg:w-1/4">
          <Card 
            className="border shadow-sm"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)'
            }}
          >
            <CardHeader 
              className="border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <CardTitle style={{ color: 'var(--foreground)' }}>
                Your Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reminderNotifications.length > 0 ? (
                  reminderNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        selectedReminder === notification.id
                          ? 'border-2'
                          : ''
                      }`}
                      style={{
                        backgroundColor: selectedReminder === notification.id ? 'var(--muted)' : 'transparent',
                        borderColor: selectedReminder === notification.id ? 'var(--primary)' : 'var(--border)'
                      }}
                      onClick={() => setSelectedReminder(notification.id === selectedReminder ? null : notification.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-start">
                          <BellIcon 
                            className="h-5 w-5 mt-0.5 mr-3 flex-shrink-0" 
                            style={{ color: 'var(--primary)' }}
                          />
                          <div>
                            <h3 
                              className="font-medium"
                              style={{ color: 'var(--foreground)' }}
                            >
                              {notification.title}
                            </h3>
                            <p 
                              className="text-sm mt-1"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {notification.message}
                            </p>
                            <p 
                              className="text-xs mt-1"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              {new Date(notification.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </div>
                      {!notification.read && (
                        <div className="mt-2 flex items-center">
                          <div 
                            className="w-2 h-2 rounded-full mr-2"
                            style={{ backgroundColor: 'var(--primary)' }}
                          />
                          <span 
                            className="text-xs"
                            style={{ color: 'var(--primary)' }}
                          >
                            Unread
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div 
                    className="text-center py-8"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <BellIcon className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>No reminders scheduled.</p>
                    <p className="text-xs mt-1">Create a task with a reminder to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content - Tasks with reminders */}
        <div className="lg:w-3/4 space-y-6">
          <div className="flex justify-between items-center">
            <h2 
              className="text-xl font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Tasks with Reminders
            </h2>
          </div>

          <Card 
            className="border shadow-sm"
            style={{
              borderColor: 'var(--border)',
              backgroundColor: 'var(--card)'
            }}
          >
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