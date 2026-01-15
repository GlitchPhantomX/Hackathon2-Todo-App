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
import NewDashboardSidebar from "@/components/NewDashboardSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, ListTodo, BarChart3, MenuIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/task.types";

// Lazy load heavy chart components
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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
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
    <div className="flex min-h-screen w-full" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <NewDashboardSidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Mobile Header */}
        <div 
          className="lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30"
          style={{ 
            backgroundColor: 'var(--background)',
            borderColor: 'var(--border)'
          }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="h-10 w-10"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div 
              className="h-6 w-6 rounded"
              style={{
                background: 'linear-gradient(to right, var(--purple-500), var(--violet-500))'
              }}
            />
            <span 
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              TodoMaster
            </span>
          </div>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 max-w-[1800px]">
            
            {/* Dashboard Header */}
            <div className="mb-4 sm:mb-6">
              <DashboardHeader />
            </div>

            {/* Tabs Navigation */}
            <Tabs
              value={activeView}
              onValueChange={(value: string) =>
                setActiveView(value as "overview" | "tasks" | "analytics")
              }
              className="w-full"
            >
              {/* Tab Bar */}
              <div className="mb-6">
                <div 
                  className="rounded-xl shadow-sm border"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)'
                  }}
                >
                  <TabsList 
                    className="w-full bg-transparent border-b rounded-none p-0 h-auto"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <div className="flex items-center justify-between px-2 sm:px-6 overflow-x-auto">
                      <TabsTrigger
                        value="overview"
                        className="relative flex items-center gap-2 px-4 sm:px-8 py-4 font-medium bg-transparent border-b-2 border-transparent rounded-none hover:bg-transparent transition-all duration-200 data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--primary)]"
                        style={{
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <LayoutGrid className="h-4 w-4" />
                        <span className="hidden sm:inline">Overview</span>
                      </TabsTrigger>
                      
                      <TabsTrigger
                        value="tasks"
                        className="relative flex items-center gap-2 px-4 sm:px-8 py-4 font-medium bg-transparent border-b-2 border-transparent rounded-none hover:bg-transparent transition-all duration-200 data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--primary)]"
                        style={{
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <ListTodo className="h-4 w-4" />
                        <span className="hidden sm:inline">Tasks</span>
                      </TabsTrigger>
                      
                      <TabsTrigger
                        value="analytics"
                        className="relative flex items-center gap-2 px-4 sm:px-8 py-4 font-medium bg-transparent border-b-2 border-transparent rounded-none hover:bg-transparent transition-all duration-200 data-[state=active]:border-[var(--primary)] data-[state=active]:text-[var(--primary)]"
                        style={{
                          color: 'var(--muted-foreground)',
                        }}
                      >
                        <BarChart3 className="h-4 w-4" />
                        <span className="hidden sm:inline">Analytics</span>
                      </TabsTrigger>
                    </div>
                  </TabsList>
                </div>
              </div>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-6 mt-0">
                
                <DashboardStats />
                <QuickActionsPanel />

                {/* Main Content */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                  
                  {/* Left Column */}
                  <div className="xl:col-span-8 space-y-6">
                    
                    {/* Recent Tasks */}
                    <Card 
                      className="border shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)'
                      }}
                    >
                      <CardHeader 
                        className="border-b"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle 
                              className="text-xl font-bold"
                              style={{ color: 'var(--foreground)' }}
                            >
                              Recent Tasks
                            </CardTitle>
                            <p 
                              className="text-sm mt-1"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              Your latest task updates
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActiveView("tasks")}
                            className="hover:bg-transparent hidden sm:flex"
                            style={{ color: 'var(--primary)' }}
                          >
                            View All →
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <TaskList
                          onEditTask={handleEditTask}
                          onTaskClick={handleTaskClick}
                        />
                      </CardContent>
                    </Card>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Completion Chart */}
                      <Card 
                        className="border shadow-sm hover:shadow-md transition-shadow"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--card)'
                        }}
                      >
                        <CardHeader 
                          className="border-b"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <CardTitle 
                            className="text-lg font-semibold"
                            style={{ color: 'var(--foreground)' }}
                          >
                            Task Completion
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
                            <CompletionChart />
                          </Suspense>
                        </CardContent>
                      </Card>

                      {/* Priority Chart */}
                      <Card 
                        className="border shadow-sm hover:shadow-md transition-shadow"
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: 'var(--card)'
                        }}
                      >
                        <CardHeader 
                          className="border-b"
                          style={{ borderColor: 'var(--border)' }}
                        >
                          <CardTitle 
                            className="text-lg font-semibold"
                            style={{ color: 'var(--foreground)' }}
                          >
                            Priority Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
                            <PriorityChart />
                          </Suspense>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Recent Activity */}
                    <Card 
                      className="border shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)'
                      }}
                    >
                      <CardHeader 
                        className="border-b"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <CardTitle 
                          className="text-lg font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
                          <RecentActivityFeed />
                        </Suspense>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Sidebar */}
                  <div className="xl:col-span-4 space-y-6">
                    
                    {/* Upcoming Tasks */}
                    <Card 
                      className="border shadow-sm hover:shadow-md transition-shadow"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)'
                      }}
                    >
                      <CardHeader 
                        className="border-b"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <CardTitle 
                          className="text-lg font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Upcoming Tasks
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
                        <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
                          <UpcomingTasksWidget />
                        </Suspense>
                      </CardContent>
                    </Card>

                    <TagsList />
                  </div>
                </div>
              </TabsContent>

              {/* TASKS TAB */}
              <TabsContent value="tasks" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Sidebar */}
                  <aside className="lg:col-span-3 space-y-4">
                    
                    {/* Add Task Button */}
                    <Button
                      onClick={() => setIsAddTaskModalOpen(true)}
                      className="w-full h-12 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                      style={{
                        background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                      }}
                      size="lg"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add New Task
                    </Button>

                    {/* Projects */}
                    <Card 
                      className="border shadow-sm"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)'
                      }}
                    >
                      <CardHeader 
                        className="border-b pb-3"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <CardTitle 
                          className="text-base font-semibold"
                          style={{ color: 'var(--foreground)' }}
                        >
                          Projects
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                        <ProjectSidebar
                          selectedProjectId={filters.project || null}
                          onProjectSelect={handleProjectSelect}
                        />
                      </CardContent>
                    </Card>

                    <TagsList />
                  </aside>

                  {/* Main Tasks Area */}
                  <main className="lg:col-span-9 space-y-4">
                    
                    {/* Bulk Actions */}
                    {selectedTasks.length > 0 && (
                      <Card 
                        className="border shadow-sm"
                        style={{
                          backgroundColor: 'var(--muted)',
                          borderColor: 'var(--border)'
                        }}
                      >
                        <CardContent className="p-4">
                          <BulkActions
                            selectedTaskIds={selectedTasks}
                            onSelectionChange={setSelectedTasks}
                            onActionComplete={() => setSelectedTasks([])}
                          />
                        </CardContent>
                      </Card>
                    )}

                    {/* Task List */}
                    <Card 
                      className="border shadow-sm"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--card)'
                      }}
                    >
                      <CardHeader 
                        className="border-b"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <CardTitle 
                              className="text-xl font-bold"
                              style={{ color: 'var(--foreground)' }}
                            >
                              All Tasks
                            </CardTitle>
                            <p 
                              className="text-sm mt-1"
                              style={{ color: 'var(--muted-foreground)' }}
                            >
                              Manage and organize your tasks efficiently
                            </p>
                          </div>
                          <Button
                            onClick={() => setIsAddTaskModalOpen(true)}
                            className="shadow-sm"
                            style={{
                              background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))',
                              color: 'white'
                            }}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 sm:p-6">
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

              {/* ANALYTICS TAB */}
              <TabsContent value="analytics" className="space-y-6 mt-0">
                
                <DashboardStats />

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Completion Chart */}
                  <Card 
                    className="border shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--card)'
                    }}
                  >
                    <CardHeader 
                      className="border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <CardTitle 
                        className="text-lg font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        Task Completion Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
                        <CompletionChart />
                      </Suspense>
                    </CardContent>
                  </Card>

                  {/* Priority Chart */}
                  <Card 
                    className="border shadow-sm hover:shadow-md transition-shadow"
                    style={{
                      borderColor: 'var(--border)',
                      backgroundColor: 'var(--card)'
                    }}
                  >
                    <CardHeader 
                      className="border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <CardTitle 
                        className="text-lg font-semibold"
                        style={{ color: 'var(--foreground)' }}
                          >
                            Priority Distribution
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
                            <PriorityChart />
                          </Suspense>
                        </CardContent>
                      </Card>
                    </div>

                {/* Productivity Chart */}
                <Card 
                  className="border shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)'
                  }}
                >
                  <CardHeader 
                    className="border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <CardTitle 
                      className="text-lg font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Productivity Trends
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-full overflow-x-auto">
                      <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
                        <ProductivityChart />
                      </Suspense>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline Chart */}
                <Card 
                  className="border shadow-sm hover:shadow-md transition-shadow"
                  style={{
                    borderColor: 'var(--border)',
                    backgroundColor: 'var(--card)'
                  }}
                >
                  <CardHeader 
                    className="border-b"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <CardTitle 
                      className="text-lg font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Task Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="w-full overflow-x-auto">
                      <Suspense fallback={<Skeleton className="h-80 w-full rounded-lg" />}>
                        <TimelineChart />
                      </Suspense>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
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
        <div 
          className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
        >
          <div 
            className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
            style={{ backgroundColor: 'var(--card)' }}
          >
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