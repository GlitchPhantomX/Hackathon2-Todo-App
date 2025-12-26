'use client';

import React from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import DashboardStats from '@/components/DashboardStats';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const StatisticsPage = () => {
  const { tasks } = useDashboard();

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  }).length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate priority distribution
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistics"
        description="Analytics and insights about your tasks"
      />

      <DashboardStats />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTasks}</div>
            <p className="text-sm text-muted-foreground">All tasks in your account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completedTasks}</div>
            <p className="text-sm text-muted-foreground">Tasks you've finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTasks}</div>
            <p className="text-sm text-muted-foreground">Tasks still to do</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overdueTasks}</div>
            <p className="text-sm text-muted-foreground">Tasks past due date</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Completion Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Overall Completion</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
            <p className="text-sm text-muted-foreground">
              You've completed {completedTasks} out of {totalTasks} tasks
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>By Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    High Priority
                  </span>
                  <span>{highPriorityTasks}</span>
                </div>
                <Progress
                  value={totalTasks > 0 ? Math.round((highPriorityTasks / totalTasks) * 100) : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    Medium Priority
                  </span>
                  <span>{mediumPriorityTasks}</span>
                </div>
                <Progress
                  value={totalTasks > 0 ? Math.round((mediumPriorityTasks / totalTasks) * 100) : 0}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    Low Priority
                  </span>
                  <span>{lowPriorityTasks}</span>
                </div>
                <Progress
                  value={totalTasks > 0 ? Math.round((lowPriorityTasks / totalTasks) * 100) : 0}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Completed</span>
                <span>{completedTasks} ({totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span>{pendingTasks} ({totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}%)</span>
              </div>
              <div className="flex justify-between">
                <span>Overdue</span>
                <span>{overdueTasks} ({totalTasks > 0 ? Math.round((overdueTasks / totalTasks) * 100) : 0}%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Productivity Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">Your completion rate is {completionRate > 70 ? 'excellent' : completionRate > 50 ? 'good' : 'needs improvement'}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  {highPriorityTasks > pendingTasks * 0.5 ? 'You have many high priority tasks pending' : 'Good balance of task priorities'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatisticsPage;