'use client';

import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { ChatProvider } from '@/contexts/ChatContext';  // ✅ Add this import
import DashboardLayout from '@/components/DashboardLayout';
import WebSocketNotificationListener from '@/components/WebSocketNotificationListener';
import { useAuth } from '@/hooks/useAuth';

export default function NewDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  return (
    <TaskSyncProvider>
      <ProjectsProvider>
        <ChatProvider>  {/* ✅ Add ChatProvider wrapper */}
          <DashboardLayout>
            {children}
            {user && (
              <WebSocketNotificationListener userId={user.id.toString()} />
            )}
          </DashboardLayout>
        </ChatProvider>
      </ProjectsProvider>
    </TaskSyncProvider>
  );
}