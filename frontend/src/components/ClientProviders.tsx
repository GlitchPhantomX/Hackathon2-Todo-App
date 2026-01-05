'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { DashboardProvider } from '@/contexts/DashboardContext';
import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import { TagsProvider } from '@/contexts/TagsContext';
import { Toaster } from 'sonner';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { MotionWrapper } from '@/components/ui/MotionWrapper';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='system'
      enableSystem
      disableTransitionOnChange
    >
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
            </DashboardProvider>
          </TagsProvider>
        </TaskSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}