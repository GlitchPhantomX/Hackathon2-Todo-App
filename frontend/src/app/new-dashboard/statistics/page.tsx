"use client";

export const dynamic = 'force-dynamic';

import React, { memo } from "react";
import PageHeader from "@/components/PageHeader";
import DashboardStats from "@/components/DashboardStats";
import { useDashboard } from "@/contexts/DashboardContext";
import { Card, CardContent } from "@/components/ui/card";
import { Suspense } from "react";
import CompletionChart from "../../../components/CompletionChart";
import PriorityChart from "../../../components/PriorityChart";
import ProductivityChart from "../../../components/ProductivityChart";
import TimelineChart from "../../../components/TimelineChart";
import RecentActivityFeed from "../../../components/RecentActivityFeed";
import CalendarWidget from "../../../components/CalendarWidget";
import UpcomingTasksWidget from "../../../components/UpcomingTasksWidget";
import { Skeleton } from "@/components/ui/skeleton";

// Memoized ChartSkeleton component to avoid creating during render
const ChartSkeleton = memo(() => (
  <div className="h-64 w-full">
    <Skeleton className="h-full w-full" />
  </div>
));
ChartSkeleton.displayName = "ChartSkeleton";

const StatisticsPage = () => {
  useDashboard(); // Just to ensure data is loaded, but not using the values

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Statistics"
        description="Detailed analytics and insights about your tasks and productivity"
      />

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Task Completion
                </h2>
                <Suspense fallback={<ChartSkeleton />}>
                  <CompletionChart />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Priority Distribution
                </h2>
                <Suspense fallback={<ChartSkeleton />}>
                  <PriorityChart />
                </Suspense>
              </CardContent>
            </Card>
          </div>

          {/* Productivity Chart - Full Width */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Productivity Trends
              </h2>
              <Suspense fallback={<ChartSkeleton />}>
                <ProductivityChart />
              </Suspense>
            </CardContent>
          </Card>

          {/* Timeline Chart */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Task Timeline
              </h2>
              <Suspense fallback={<ChartSkeleton />}>
                <TimelineChart />
              </Suspense>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
              <RecentActivityFeed />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Calendar
              </h2>
              <CalendarWidget />
            </CardContent>
          </Card>

          {/* Upcoming Tasks Widget */}
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
                Upcoming Tasks
              </h2>
              <UpcomingTasksWidget />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
