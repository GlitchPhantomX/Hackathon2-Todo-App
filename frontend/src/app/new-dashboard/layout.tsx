'use client';

import React from 'react';
import DashboardNavbar from '@/components/NewDashboardNavbar';
import DashboardSidebar from '@/components/NewDashboardSidebar';
import { ReactQueryProvider } from '@/components/ReactQueryProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { TagsProvider } from '@/contexts/TagsContext';
import { ProjectsProvider } from '@/contexts/ProjectsContext';
import { DashboardProvider, useDashboard } from '@/contexts/DashboardContext';
import { UserPreferencesProvider } from '@/contexts/UserPreferencesContext';
import { ChartDataProvider } from '@/components/ChartDataProvider';
import { ToastContainer } from '@/components/ToastContainer';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

// ✅ Inner component to access DashboardContext
const DashboardLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const { toasts, removeToast } = useDashboard();

  return (
    <>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <DashboardNavbar />
          </header>
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {children}
          </main>
        </div>
      </div>
      {/* ✅ Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ReactQueryProvider>
      <OfflineProvider>
        <AuthProvider>
          <SettingsProvider>
            <UserPreferencesProvider>
              <NotificationProvider>
                <TagsProvider>
                  <ProjectsProvider>
                    <DashboardProvider>
                      <ChartDataProvider>
                        <DashboardLayoutInner>
                          {children}
                        </DashboardLayoutInner>
                      </ChartDataProvider>
                    </DashboardProvider>
                  </ProjectsProvider>
                </TagsProvider>
              </NotificationProvider>
            </UserPreferencesProvider>
          </SettingsProvider>
        </AuthProvider>
      </OfflineProvider>
    </ReactQueryProvider>
  );
};

export default DashboardLayout;