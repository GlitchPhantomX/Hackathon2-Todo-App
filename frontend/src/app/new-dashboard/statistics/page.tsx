"use client";

export const dynamic = 'force-dynamic';

import React, { memo } from "react";
import PageHeader from "@/components/PageHeader";
import DashboardStats from "@/components/DashboardStats";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Suspense } from "react";
import CompletionChart from "../../../components/CompletionChart";
import PriorityChart from "../../../components/PriorityChart";
import ProductivityChart from "../../../components/ProductivityChart";
import TimelineChart from "../../../components/TimelineChart";
import RecentActivityFeed from "../../../components/RecentActivityFeed";
import CalendarWidget from "../../../components/CalendarWidget";
import UpcomingTasksWidget from "../../../components/UpcomingTasksWidget";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Calendar, Clock, TrendingUp } from "lucide-react";

const ChartSkeleton = memo(() => (
  <div className="h-64 w-full">
    <Skeleton className="h-full w-full rounded-lg" />
  </div>
));
ChartSkeleton.displayName = "ChartSkeleton";

const StatisticsPage = () => {
  useDashboard();

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="mx-auto max-w-[1800px] px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 space-y-6">
        
        <PageHeader
          title="Statistics"
          description="Detailed analytics and insights about your tasks and productivity"
        />

        <DashboardStats />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          <div className="xl:col-span-8 space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <Card 
                className="border shadow-sm hover:shadow-md transition-shadow"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)'
                }}
              >
                <CardHeader 
                  className="border-b pb-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--muted)',
                        color: 'var(--primary)'
                      }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <CardTitle 
                      className="text-base font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Task Completion
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Suspense fallback={<ChartSkeleton />}>
                    <CompletionChart />
                  </Suspense>
                </CardContent>
              </Card>

              <Card 
                className="border shadow-sm hover:shadow-md transition-shadow"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)'
                }}
              >
                <CardHeader 
                  className="border-b pb-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="p-2 rounded-lg"
                      style={{ 
                        backgroundColor: 'var(--muted)',
                        color: 'var(--primary)'
                      }}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <CardTitle 
                      className="text-base font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      Priority Distribution
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <Suspense fallback={<ChartSkeleton />}>
                    <PriorityChart />
                  </Suspense>
                </CardContent>
              </Card>
            </div>

            <Card 
              className="border shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              <CardHeader 
                className="border-b pb-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--muted)',
                      color: 'var(--primary)'
                    }}
                  >
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <CardTitle 
                    className="text-base font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Productivity Trends
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full overflow-x-auto">
                  <Suspense fallback={<ChartSkeleton />}>
                    <ProductivityChart />
                  </Suspense>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              <CardHeader 
                className="border-b pb-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--muted)',
                      color: 'var(--primary)'
                    }}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <CardTitle 
                    className="text-base font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Task Timeline
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="w-full overflow-x-auto">
                  <Suspense fallback={<ChartSkeleton />}>
                    <TimelineChart />
                  </Suspense>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm hover:shadow-md transition-shadow"
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
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RecentActivityFeed />
              </CardContent>
            </Card>
          </div>

          <aside className="xl:col-span-4 space-y-6">
            
            <Card 
              className="border shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              <CardHeader 
                className="border-b pb-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--muted)',
                      color: 'var(--primary)'
                    }}
                  >
                    <Calendar className="h-4 w-4" />
                  </div>
                  <CardTitle 
                    className="text-base font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Calendar
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <CalendarWidget />
              </CardContent>
            </Card>

            <Card 
              className="border shadow-sm hover:shadow-md transition-shadow"
              style={{
                borderColor: 'var(--border)',
                backgroundColor: 'var(--card)'
              }}
            >
              <CardHeader 
                className="border-b pb-3"
                style={{ borderColor: 'var(--border)' }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ 
                      backgroundColor: 'var(--muted)',
                      color: 'var(--primary)'
                    }}
                  >
                    <Clock className="h-4 w-4" />
                  </div>
                  <CardTitle 
                    className="text-base font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Upcoming Tasks
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <UpcomingTasksWidget />
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;