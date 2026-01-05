'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React from 'react';
import PageHeader from '@/components/PageHeader';
import TaskList from '@/components/TaskList';
import DashboardStats from '@/components/DashboardStats';
import { useDashboard } from '@/contexts/DashboardContext';
import { Card, CardContent } from '@/components/ui/card';

const PersonalProjectPage = () => {
  const { stats } = useDashboard();

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Personal Project"
        description="Tasks related to your personal projects"
      />

      <div className="mb-6">
        <DashboardStats />
      </div>

      <Card>
        <CardContent className="p-6">
          <TaskList filter={{ project: 'personal' }} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalProjectPage;