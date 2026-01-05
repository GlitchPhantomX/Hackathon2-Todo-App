'use client';

import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import DashboardLayout from '@/components/DashboardLayout';

export default function NewDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TaskSyncProvider>
      <ProjectsProvider>
        <DashboardLayout>
          {children}
        </DashboardLayout>
      </ProjectsProvider>
    </TaskSyncProvider>
  );
}