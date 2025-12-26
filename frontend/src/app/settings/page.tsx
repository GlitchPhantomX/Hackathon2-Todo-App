'use client';

import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/contexts/SettingsContext';
import { MotionWrapper } from '@/components/ui/MotionWrapper';
import { Settings, Palette, Bell, ListChecks, Lock, Plug } from 'lucide-react';

// Lazy load settings components for code splitting
const AppearanceSettings = lazy(() => import('@/components/Settings/AppearanceSettings'));
const NotificationSettings = lazy(() => import('@/components/Settings/NotificationSettings'));
const TaskDefaultSettings = lazy(() => import('@/components/Settings/TaskDefaultSettings'));
const PrivacySettings = lazy(() => import('@/components/Settings/PrivacySettings'));
const IntegrationSettings = lazy(() => import('@/components/Settings/IntegrationSettings'));

const SettingsPageContent = () => {
  const { settings, loading, error, updateSettings } = useSettings();
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize default settings only once if needed
  useEffect(() => {
    // Only initialize if not loading, no settings exist, no error, and haven't initialized yet
    if (!loading && !settings && !error && !hasInitialized) {
      const defaultSettings = {
        appearance: {
          theme: 'dark' as const,
          accent_color: '#a855f7',
          font_size: 'M' as const,
          compact_mode: false,
        },
        notifications: {
          email_notifications: true,
          push_notifications: false,
          task_reminders: true,
          daily_summary: false,
        },
        task_defaults: {
          default_priority: 'medium' as const,
          default_view: 'list' as const,
          items_per_page: 20,
          auto_archive: true,
        },
        privacy: {
          profile_visibility: 'private' as const,
          activity_tracking: true,
          data_retention_days: 90,
        },
        integrations: {
          google_calendar: false,
          slack: false,
          github: false,
        },
      };

      // Try to update settings, but don't fail if it doesn't work
      updateSettings(defaultSettings).catch((err) => {
        console.warn('Failed to initialize settings:', err);
      });
      
      setHasInitialized(true);
    }
  }, [loading, settings, error, hasInitialized, updateSettings]);

  if (loading && !hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mb-8 bg-purple-500/20" />
          <div className="space-y-4">
            <Skeleton className="h-16 w-full bg-purple-500/20" />
            <Skeleton className="h-96 w-full bg-purple-500/20" />
          </div>
        </div>
      </div>
    );
  }

  // Show a warning instead of full error if API is unavailable
  if (error && error.includes('404')) {
    console.warn('Settings API endpoint not available, using local state');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-gray-400 ml-15">Customize your TodoMaster experience</p>
        </div>

        {/* Show warning if API is unavailable */}
        {error && error.includes('404') && (
          <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Settings API is not available. Changes will be saved locally in your browser.
            </p>
          </div>
        )}

        {/* Settings Card */}
        <Card className="bg-gray-800/50 backdrop-blur-lg border-purple-500/20 shadow-2xl shadow-purple-500/10">
          <CardContent className="p-6">
            <Tabs defaultValue="appearance" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-gray-900/50 p-2 rounded-xl border border-purple-500/20">
                <TabsTrigger 
                  value="appearance" 
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:border-purple-500/30"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">Appearance</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:border-purple-500/30"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">Notifications</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="task-defaults"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:border-purple-500/30"
                >
                  <ListChecks className="h-4 w-4" />
                  <span className="hidden sm:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:border-purple-500/30"
                >
                  <Lock className="h-4 w-4" />
                  <span className="hidden sm:inline">Privacy</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations"
                  className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:border-purple-500/30"
                >
                  <Plug className="h-4 w-4" />
                  <span className="hidden sm:inline">Integrations</span>
                </TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="appearance" className="mt-0">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                    </div>
                  }>
                    <AppearanceSettings />
                  </Suspense>
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                    </div>
                  }>
                    <NotificationSettings />
                  </Suspense>
                </TabsContent>

                <TabsContent value="task-defaults" className="mt-0">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                    </div>
                  }>
                    <TaskDefaultSettings />
                  </Suspense>
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                    </div>
                  }>
                    <PrivacySettings />
                  </Suspense>
                </TabsContent>

                <TabsContent value="integrations" className="mt-0">
                  <Suspense fallback={
                    <div className="space-y-4">
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                      <Skeleton className="h-24 w-full bg-purple-500/10" />
                    </div>
                  }>
                    <IntegrationSettings />
                  </Suspense>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function SettingsPage() {
  return (
    <MotionWrapper type="fade" duration={0.3}>
      <SettingsPageContent />
    </MotionWrapper>
  );
}