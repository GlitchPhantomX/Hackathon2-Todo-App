'use client';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent } from '@/components/ui/card';

const LowPriorityPage = () => {
  const { stats } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Low Priority Tasks"
        description="Tasks with low priority that can be done later"
      />

      <div className="mb-6">
        <DashboardStats />
      </div>

      <Card>
        <CardContent className="p-6">
          <TaskList filter={{ priority: 'low' }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default LowPriorityPage;