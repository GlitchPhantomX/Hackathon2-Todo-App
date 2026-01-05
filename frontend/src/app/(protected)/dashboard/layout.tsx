'use client';

import { TaskSyncProvider } from '@/contexts/TaskSyncContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TaskSyncProvider>
      {children}
    </TaskSyncProvider>
  );
}