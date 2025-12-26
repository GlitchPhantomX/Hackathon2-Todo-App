'use client';

import React, { lazy, Suspense, useState } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardStats from '@/components/DashboardStats';
import CalendarWidget from '@/components/CalendarWidget';
import UpcomingTasksWidget from '@/components/UpcomingTasksWidget';
import RecentActivityFeed from '@/components/RecentActivityFeed';
import QuickActionsPanel from '@/components/QuickActionsPanel';
import { ChartDataProvider } from '@/components/ChartDataProvider';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { TagsProvider } from '@/contexts/TagsContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import TaskList from '@/components/TaskList';
import AddTaskModal from '@/components/AddTaskModal';
import EditTaskModal from '@/components/EditTaskModal';
import TaskFilters from '@/components/TaskFilters';
import ProjectSidebar from '@/components/ProjectSidebar';
import TagsList from '@/components/TagsList';
import BulkActions from '@/components/BulkActions';
import TaskDetail from '@/components/TaskDetail';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Lazy load heavy chart components for code splitting
const CompletionChart = lazy(() => import('@/components/CompletionChart'));
const PriorityChart = lazy(() => import('@/components/PriorityChart'));
const ProductivityChart = lazy(() => import('@/components/ProductivityChart'));
const TimelineChart = lazy(() => import('@/components/TimelineChart'));

// Skeletons for loading states
const ChartSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <Skeleton className="h-6 w-1/4 mb-4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const WidgetSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
    <Skeleton className="h-6 w-1/3 mb-4" />
    <Skeleton className="h-40 w-full" />
  </div>
);

// Inner component that has access to all contexts
const DashboardContent = () => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'overview' | 'tasks' | 'analytics'>('overview');
  const [viewingTaskDetail, setViewingTaskDetail] = useState<any>(null);

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on tasks:`, selectedTasks);
    // Implement bulk actions here
    setSelectedTasks([]);
  };

  const handleTaskClick = (task: any) => {
    setViewingTaskDetail(task);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
    setViewingTaskDetail(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content Area */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Section */}
        <section>
          <DashboardHeader />
        </section>

        {/* View Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Tabs value={activeView} onValueChange={(value: any) => setActiveView(value)} className="w-full">
            <div className="border-b border-gray-200 dark:border-gray-700 px-6">
              <TabsList className="bg-transparent h-12 p-0 gap-6">
                <TabsTrigger 
                  value="overview"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3"
                >
                  Tasks
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none pb-3"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="p-6 space-y-6 mt-0">
              {/* Stats Cards */}
              <DashboardStats />

              {/* Quick Actions Panel */}
              <QuickActionsPanel />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Tasks Preview */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          Recent Tasks
                        </h2>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActiveView('tasks')}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          View All →
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <TaskList 
                        onEditTask={handleEditTask}
                        onTaskClick={handleTaskClick}
                      />
                    </div>
                  </div>

                  {/* Charts Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                        Task Completion
                      </h2>
                      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                        <CompletionChart />
                      </Suspense>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                        Priority Distribution
                      </h2>
                      <Suspense fallback={<Skeleton className="h-48 w-full" />}>
                        <PriorityChart />
                      </Suspense>
                    </div>
                  </div>

                  {/* Recent Activity Feed */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Recent Activity
                    </h2>
                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                      <RecentActivityFeed />
                    </Suspense>
                  </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                  {/* Calendar Widget */}
                  {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Calendar
                    </h2>
                    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                      <CalendarWidget />
                    </Suspense>
                  </div> */}

                  {/* Upcoming Tasks Widget */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Upcoming Tasks
                    </h2>
                    <Suspense fallback={<Skeleton className="h-40 w-full" />}>
                      <UpcomingTasksWidget />
                    </Suspense>
                  </div>

                  {/* Tags List */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-2.5">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                      Tags
                    </h2>
                    <TagsList />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="p-6 space-y-6 mt-0">
              {/* Task Management Section */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Filters & Projects */}
                <div className="lg:col-span-1 space-y-4">
                  {/* Add Task Button */}
                  <Button
                    onClick={() => setIsAddTaskModalOpen(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Task
                  </Button>

                  {/* Task Filters */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Filters
                    </h3>
                    <TaskFilters />
                  </div>

                  {/* Project Sidebar */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Projects
                    </h3>
                    <ProjectSidebar />
                  </div>

                  {/* Tags */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-sm font-semibold mb-3 text-gray-900 dark:text-gray-100">
                      Tags
                    </h3>
                    <TagsList />
                  </div>
                </div>

                {/* Main Tasks Area */}
                <div className="lg:col-span-3 space-y-4">
                  {/* Bulk Actions */}
                  {selectedTasks.length > 0 && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <BulkActions 
                        selectedCount={selectedTasks.length}
                        onAction={handleBulkAction}
                      />
                    </div>
                  )}

                  {/* Task List */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            All Tasks
                          </h2>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage and organize your tasks
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsAddTaskModalOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Task
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <TaskList 
                        onEditTask={handleEditTask}
                        onTaskClick={handleTaskClick}
                        onSelectionChange={setSelectedTasks}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="p-6 space-y-6 mt-0">
              {/* Stats Overview */}
              <DashboardStats />

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Completion Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Task Completion
                  </h2>
                  <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    <CompletionChart />
                  </Suspense>
                </div>

                {/* Priority Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                    Priority Distribution
                  </h2>
                  <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                    <PriorityChart />
                  </Suspense>
                </div>
              </div>

              {/* Productivity Chart - Full Width */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Productivity Trends
                </h2>
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <ProductivityChart />
                </Suspense>
              </div>

              {/* Timeline Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Task Timeline
                </h2>
                <Suspense fallback={<Skeleton className="h-80 w-full" />}>
                  <TimelineChart />
                </Suspense>
              </div>
            </TabsContent>
          </Tabs>
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

        {/* Task Detail Modal/Sidebar */}
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
    </div>
  );
};

// Main component with all providers
const NewDashboardWithModals = () => {
  return (
    <ReactQueryProvider>
      <OfflineProvider>
        <AuthProvider>
          <SettingsProvider>
            <UserPreferencesProvider>
              <NotificationProvider>
                <TagsProvider>
                  <ProjectsProvider>
                    <DashboardProvider>
                      <ChartDataProvider>
                        <DashboardContent />
                      </ChartDataProvider>
                    </DashboardProvider>
                  </ProjectsProvider>
                </TagsProvider>
              </NotificationProvider>
            </UserPreferencesProvider>
          </SettingsProvider>
        </AuthProvider>
      </OfflineProvider>
    </ReactQueryProvider>
  );
};

export default NewDashboardWithModals;