"use client";
export const runtime = "edge";
export const dynamic = "force-dynamic";

import React, { lazy, Suspense, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardStats from "@/components/DashboardStats";
import UpcomingTasksWidget from "@/components/UpcomingTasksWidget";
import RecentActivityFeed from "@/components/RecentActivityFeed";
import QuickActionsPanel from "@/components/QuickActionsPanel";
import { useDashboard } from "@/contexts/DashboardContext";
import TaskList from "@/components/TaskList";
import AddTaskModal from "@/components/AddTaskModal";
import EditTaskModal from "@/components/EditTaskModal";
import ProjectSidebar from "@/components/ProjectSidebar";
import TagsList from "@/components/TagsList";
import BulkActions from "@/components/BulkActions";
import TaskDetail from "@/components/TaskDetail";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task.types";

// Lazy load heavy chart components for code splitting
const CompletionChart = lazy(() => import("@/components/CompletionChart"));
const PriorityChart = lazy(() => import("@/components/PriorityChart"));
const ProductivityChart = lazy(() => import("@/components/ProductivityChart"));
const TimelineChart = lazy(() => import("@/components/TimelineChart"));

const NewDashboardPage = () => {
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<
    "overview" | "tasks" | "analytics"
  >("overview");
  const [viewingTaskDetail, setViewingTaskDetail] = useState<Task | null>(null);
  const { setFilter, filters } = useDashboard();

  const handleTaskClick = (task: Task) => {
    setViewingTaskDetail(task);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditTaskModalOpen(true);
    setViewingTaskDetail(null);
  };

  const handleProjectSelect = (projectId: string | null) => {
    setFilter("project", projectId);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Dashboard Header */}
      <section>

        <DashboardHeader />
      </section>

      {/* View Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Tabs
          value={activeView}
          onValueChange={(value: string) =>
            setActiveView(value as "overview" | "tasks" | "analytics")
          }
          className="w-full"
        >
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
                        onClick={() => setActiveView("tasks")}
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
          <TabsContent value="tasks" className="mt-0">
            {/* Task Management Section */}
            <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-full overflow-hidden">
              {/* Sidebar - Projects & Tags */}
              <aside className="w-full lg:w-56 xl:w-64 flex-shrink-0 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Add Task Button */}
                <Button
                  onClick={() => setIsAddTaskModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                  size="default"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>

                {/* Project Sidebar */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Projects
                    </h3>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <ProjectSidebar
                      selectedProjectId={filters.project || null}
                      onProjectSelect={handleProjectSelect}
                    />
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card className="shadow-sm">
                  <CardHeader className="pb-3 px-4 pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      Tags
                    </h3>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <TagsList />
                  </CardContent>
                </Card>
              </aside>

              {/* Main Tasks Area */}
              <main className="flex-1 min-w-0 space-y-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {/* Bulk Actions */}
                {selectedTasks.length > 0 && (
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm">
                    <CardContent className="p-3">
                      <BulkActions
                        selectedTaskIds={selectedTasks}
                        onSelectionChange={setSelectedTasks}
                        onActionComplete={() => setSelectedTasks([])}
                      />
                    </CardContent>
                  </Card>
                )}

                {/* Task List */}
                <Card className="shadow-sm">
                  <CardHeader className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold truncate">
                          All Tasks
                        </CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Manage and organize your tasks
                        </p>
                      </div>
                      <Button
                        onClick={() => setIsAddTaskModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex-shrink-0"
                        size="sm"
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Add Task
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <TaskList
                      onEditTask={handleEditTask}
                      onTaskClick={handleTaskClick}
                      onSelectionChange={setSelectedTasks}
                    />
                  </CardContent>
                </Card>
              </main>
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
  );
};

export default NewDashboardPage;
