'use client';

import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { ChatProvider } from '@/contexts/ChatContext';  // ✅ Add this import
import DashboardLayout from '@/components/DashboardLayout';

export default function NewDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TaskSyncProvider>
      <ProjectsProvider>
        <ChatProvider>  {/* ✅ Add ChatProvider wrapper */}
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </ChatProvider>
      </ProjectsProvider>
    </TaskSyncProvider>
  );
}