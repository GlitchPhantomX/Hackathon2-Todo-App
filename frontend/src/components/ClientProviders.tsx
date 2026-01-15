'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import { TagsProvider } from '@/contexts/TagsContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { MotionWrapper } from '@/components/ui/motion-wrapper';
import ToastContainer from '@/components/ToastContainer';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
      <NotificationProvider>
        <AuthProvider>
          <TaskSyncProvider>
            <TagsProvider>
              <DashboardProvider>
                <ErrorBoundary>
                  <MotionWrapper type='fade' duration={0.3}>
                    {children}
                  </MotionWrapper>
                </ErrorBoundary>
                <Toaster position='top-right' richColors />
                <ToastContainer />
              </DashboardProvider>
            </TagsProvider>
          </TaskSyncProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}