# Quickstart Guide: User Settings Implementation

## Overview
This guide provides a step-by-step approach to implementing the user settings feature with all required functionality including appearance, notifications, task defaults, privacy, and integrations.

## Prerequisites
- Next.js 16+ project with TypeScript
- Tailwind CSS configured
- Framer Motion installed for animations
- Axios for API calls
- React Context API for state management

## Step 1: Set up Settings Context and Types

First, create the TypeScript types and React context for managing settings:

```typescript
// src/types/settings.types.ts
export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
  font_size: 'S' | 'M' | 'L';
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
}

export interface NotificationSettings {
  enabled: boolean;
  sound_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  daily_digest: boolean;
}

export interface TaskDefaultSettings {
  default_priority: 'low' | 'medium' | 'high';
  default_project_id: number | null;
  default_view: 'list' | 'grid';
  items_per_page: number;
  auto_assign_today: boolean;
}

export interface PrivacySettings {
  data_retention_days: number;
  export_data_enabled: boolean;
  analytics_enabled: boolean;
  profile_visible: boolean;
}

export interface IntegrationSettings {
  calendar_connected: boolean;
  email_connected: boolean;
  webhooks_enabled: boolean;
  connected_services: string[];
}

export interface UserSettings {
  id: number;
  user_id: number;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  task_defaults: TaskDefaultSettings;
  privacy: PrivacySettings;
  integrations: IntegrationSettings;
  created_at: string;
  updated_at: string;
}

export interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  saveToLocalStorage: (settings: UserSettings) => void;
  loadFromLocalStorage: () => UserSettings | null;
}
```

```typescript
// src/contexts/SettingsContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { UserSettings } from '../types/settings.types';

// Define action types
type SettingsAction =
  | { type: 'LOAD_SETTINGS'; payload: UserSettings }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'SETTINGS_LOADING' }
  | { type: 'SETTINGS_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState = {
  settings: null,
  loading: false,
  error: null,
};

// Reducer function
const settingsReducer = (state: typeof initialState, action: SettingsAction) => {
  switch (action.type) {
    case 'LOAD_SETTINGS':
      return {
        ...state,
        settings: action.payload,
        loading: false,
        error: null,
      };
    case 'UPDATE_SETTINGS':
      if (!state.settings) return state;
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
        loading: false,
      };
    case 'SETTINGS_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'SETTINGS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Provider component
export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Load settings from localStorage or API on mount
  useEffect(() => {
    const loadSettings = async () => {
      dispatch({ type: 'SETTINGS_LOADING' });

      try {
        // Try to load from localStorage first
        const savedSettings = loadFromLocalStorage();
        if (savedSettings) {
          dispatch({ type: 'LOAD_SETTINGS', payload: savedSettings });
          return;
        }

        // If not in localStorage, fetch from API
        // const apiSettings = await fetchSettingsFromAPI();
        // dispatch({ type: 'LOAD_SETTINGS', payload: apiSettings });
      } catch (error) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Failed to load settings'
        });
      }
    };

    loadSettings();
  }, []);

  // Update settings function
  const updateSettings = async (updates: Partial<UserSettings>) => {
    dispatch({ type: 'SETTINGS_LOADING' });

    try {
      // Update in state
      dispatch({ type: 'UPDATE_SETTINGS', payload: updates });

      // Save to localStorage
      if (state.settings) {
        const updatedSettings = { ...state.settings, ...updates };
        saveToLocalStorage(updatedSettings);
      }

      // Update on server (implement API call)
      // await updateSettingsOnServer(updates);
    } catch (error) {
      dispatch({
        type: 'SETTINGS_ERROR',
        payload: 'Failed to update settings'
      });
      throw error;
    }
  };

  // Save to localStorage
  const saveToLocalStorage = (settings: UserSettings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  };

  // Load from localStorage
  const loadFromLocalStorage = (): UserSettings | null => {
    try {
      const settings = localStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      return null;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: state.settings,
        loading: state.loading,
        error: state.error,
        updateSettings,
        saveToLocalStorage,
        loadFromLocalStorage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
```

## Step 2: Create Settings Service

```typescript
// src/services/settingsService.ts
import api from './api';
import { UserSettings } from '../types/settings.types';

export const settingsService = {
  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    const response = await api.get<UserSettings>('/usersettings');
    return response.data;
  },

  // Update user settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await api.put<UserSettings>('/usersettings', settings);
    return response.data;
  },

  // Export user data
  exportData: async (format: 'json' | 'csv' = 'json'): Promise<Blob> => {
    const response = await api.post<Blob>(
      `/usersettings/export?format=${format}`,
      {},
      { responseType: 'blob' }
    );
    return response.data;
  },
};
```

## Step 3: Create Settings Page Component

```typescript
// src/app/settings/page.tsx
'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import AppearanceSettings from '@/components/Settings/AppearanceSettings';
import NotificationSettings from '@/components/Settings/NotificationSettings';
import TaskDefaultSettings from '@/components/Settings/TaskDefaultSettings';
import PrivacySettings from '@/components/Settings/PrivacySettings';
import IntegrationSettings from '@/components/Settings/IntegrationSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export default function SettingsPage() {
  const { settings, loading, error } = useSettings();

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error loading settings: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="task-defaults">Task Defaults</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationSettings />
            </TabsContent>

            <TabsContent value="task-defaults">
              <TaskDefaultSettings />
            </TabsContent>

            <TabsContent value="privacy">
              <PrivacySettings />
            </TabsContent>

            <TabsContent value="integrations">
              <IntegrationSettings />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Step 4: Create Individual Settings Components

```typescript
// src/components/Settings/AppearanceSettings.tsx
'use client';

import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

export default function AppearanceSettings() {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = (value: string) => {
    updateSettings({
      appearance: {
        ...settings?.appearance,
        theme: value as 'light' | 'dark' | 'system'
      }
    });
  };

  const handleAccentColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({
      appearance: {
        ...settings?.appearance,
        accent_color: e.target.value
      }
    });
  };

  const handleFontSizeChange = (value: string) => {
    updateSettings({
      appearance: {
        ...settings?.appearance,
        font_size: value as 'S' | 'M' | 'L'
      }
    });
  };

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={settings.appearance.theme}
            onValueChange={handleThemeChange}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent-color">Accent Color</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="accent-color"
              type="color"
              value={settings.appearance.accent_color}
              onChange={handleAccentColorChange}
              className="w-16 h-10 p-1"
            />
            <span>{settings.appearance.accent_color}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font-size">Font Size</Label>
          <Select
            value={settings.appearance.font_size}
            onValueChange={handleFontSizeChange}
          >
            <SelectTrigger id="font-size">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">Small</SelectItem>
              <SelectItem value="M">Medium</SelectItem>
              <SelectItem value="L">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Step 5: Implement Accessibility Features

```typescript
// src/components/Accessibility/SkipLink.tsx
'use client';

import React from 'react';

export const SkipLink = () => {
  const handleSkip = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-white focus:text-black focus:rounded focus:border-2 focus:border-blue-500"
      onClick={handleSkip}
    >
      Skip to main content
    </a>
  );
};
```

```typescript
// src/components/Accessibility/FocusTrap.tsx
'use client';

import React, { useEffect, useRef } from 'react';

interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  onClose: () => void;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({ children, isActive, onClose }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const focusableElements = wrapperRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    const firstElement = focusableElements?.[0];
    const lastElement = focusableElements?.[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab') {
        if (focusableElements?.length === 1) {
          e.preventDefault();
          return;
        }

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onClose]);

  return <div ref={wrapperRef}>{children}</div>;
};
```

## Step 6: Create Loading Skeletons

```typescript
// src/components/ui/Skeleton/StatsCardsSkeleton.tsx
import React from 'react';
import { Skeleton } from '../Skeleton';

export const StatsCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  );
};
```

```typescript
// src/components/ui/Skeleton/TaskListSkeleton.tsx
import React from 'react';
import { Skeleton } from '../Skeleton';

export const TaskListSkeleton = () => {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-5 w-5 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
};
```

## Step 7: Implement Offline Support

```typescript
// src/contexts/OfflineContext.tsx
'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface OfflineAction {
  type: 'UPDATE_STATUS';
  payload: boolean;
}

interface SyncAction {
  type: 'ADD_TO_QUEUE' | 'REMOVE_FROM_QUEUE';
  payload: any;
}

interface OfflineState {
  isOnline: boolean;
  syncQueue: any[];
}

const initialState: OfflineState = {
  isOnline: navigator.onLine,
  syncQueue: [],
};

const offlineReducer = (
  state: OfflineState,
  action: OfflineAction | SyncAction
) => {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, syncQueue: [...state.syncQueue, action.payload] };
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        syncQueue: state.syncQueue.filter(
          (item) => item.id !== action.payload.id
        ),
      };
    default:
      return state;
  }
};

const OfflineContext = createContext<OfflineState | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(offlineReducer, initialState);

  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'UPDATE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'UPDATE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <OfflineContext.Provider value={state}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};
```

## Step 8: Create Offline Indicator

```typescript
// src/components/Offline/OfflineIndicator.tsx
'use client';

import React from 'react';
import { useOffline } from '@/contexts/OfflineContext';

export const OfflineIndicator = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded z-50">
      <p>You're offline. Changes will sync when reconnected.</p>
    </div>
  );
};
```

## Step 9: Add Animation Wrapper

```typescript
// src/components/ui/MotionWrapper.tsx
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MotionWrapperProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale';
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
}

export const MotionWrapper: React.FC<MotionWrapperProps> = ({
  children,
  type = 'fade',
  direction = 'up',
  duration = 0.3,
}) => {
  const getVariants = () => {
    switch (type) {
      case 'slide':
        const directionVariants = {
          up: { y: 20 },
          down: { y: -20 },
          left: { x: 20 },
          right: { x: -20 },
        };
        return {
          initial: { opacity: 0, ...directionVariants[direction] },
          animate: { opacity: 1, x: 0, y: 0 },
          exit: { opacity: 0, ...directionVariants[direction] },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case 'fade':
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={getVariants()}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
```

This quickstart guide provides the essential components and implementation steps needed to create the user settings feature with all the required functionality. Each component follows accessibility best practices and includes proper TypeScript typing.