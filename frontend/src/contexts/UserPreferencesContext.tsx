'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { userPreferencesService } from '@/services/apiService';
import { UserPreferences as BaseUserPreferences } from '@/types/types';
import { useAuth } from './AuthContext';

// Define extended UserPreferences interface for this context
interface UserPreferences extends BaseUserPreferences {
  notificationSound: boolean;
  pushNotifications: boolean;
  createdAt: string;
}

interface UserPreferencesState {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
}

interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  loading: boolean;
  error: string | null;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  toggleNotificationSound: () => Promise<void>;
  toggleEmailNotifications: () => Promise<void>;
  togglePushNotifications: () => Promise<void>;
}

// Action types
type UserPreferencesAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: UserPreferences }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

const userPreferencesReducer = (state: UserPreferencesState, action: UserPreferencesAction): UserPreferencesState => {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        preferences: action.payload,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: state.preferences ? { ...state.preferences, ...action.payload } : null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

interface UserPreferencesProviderProps {
  children: ReactNode;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  id: '', // Will be filled in by backend
  userId: '', // Will be filled in by backend
  theme: 'system',
  accentColor: 'blue',
  fontSize: 'medium',
  notificationsEnabled: true,
  notificationSound: true,
  emailNotifications: true,
  pushNotifications: false,
  defaultPriority: 'medium',
  defaultView: 'list',
  itemsPerPage: 25,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const UserPreferencesProvider: React.FC<UserPreferencesProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(userPreferencesReducer, {
    preferences: null,
    loading: false,
    error: null,
  });

  // Fetch user preferences
  const fetchPreferences = async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'FETCH_START' });
      const apiPreferences = await userPreferencesService.getUserPreferences(user.id);
      // Convert API response to match context interface
      const preferences: UserPreferences = {
        id: apiPreferences.id,
        userId: apiPreferences.userId,
        theme: apiPreferences.theme,
        accentColor: apiPreferences.accentColor,
        fontSize: apiPreferences.fontSize,
        notificationsEnabled: apiPreferences.notificationsEnabled,
        notificationSound: true, // Default value
        emailNotifications: apiPreferences.emailNotifications,
        pushNotifications: false, // Default value
        defaultPriority: apiPreferences.defaultPriority,
        defaultView: apiPreferences.defaultView,
        itemsPerPage: apiPreferences.itemsPerPage,
        createdAt: apiPreferences.updatedAt, // Use updatedAt as createdAt if no createdAt exists
        updatedAt: apiPreferences.updatedAt,
        ...(apiPreferences.defaultProjectId !== undefined ? { defaultProjectId: apiPreferences.defaultProjectId } : {}),
      };
      dispatch({ type: 'FETCH_SUCCESS', payload: preferences });
    } catch (error) {
      // If no preferences exist, create with defaults
      try {
        const apiPreferences = await userPreferencesService.updateUserPreferences(user.id, defaultPreferences);
        // Convert API response to match context interface
        const newPreferences: UserPreferences = {
          id: apiPreferences.id,
          userId: apiPreferences.userId,
          theme: apiPreferences.theme,
          accentColor: apiPreferences.accentColor,
          fontSize: apiPreferences.fontSize,
          notificationsEnabled: apiPreferences.notificationsEnabled,
          notificationSound: true, // Default value
          emailNotifications: apiPreferences.emailNotifications,
          pushNotifications: false, // Default value
          defaultPriority: apiPreferences.defaultPriority,
          defaultView: apiPreferences.defaultView,
          itemsPerPage: apiPreferences.itemsPerPage,
          createdAt: apiPreferences.updatedAt, // Use updatedAt as createdAt
          updatedAt: apiPreferences.updatedAt,
          ...(apiPreferences.defaultProjectId !== undefined ? { defaultProjectId: apiPreferences.defaultProjectId } : {}),
        };
        dispatch({ type: 'FETCH_SUCCESS', payload: newPreferences });
      } catch (secondError) {
        const errorMessage = secondError instanceof Error ? secondError.message : 'Failed to fetch or create preferences';
        dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
      }
    }
  };

  // Update preferences
  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // Filter updates to only include fields that the API expects
      const apiUpdates: Partial<BaseUserPreferences> = {};
      (Object.keys(updates) as (keyof UserPreferences)[]).forEach(key => {
        if (key !== 'notificationSound' && key !== 'pushNotifications' && key !== 'createdAt') {
          (apiUpdates as any)[key] = updates[key];
        }
      });

      await userPreferencesService.updateUserPreferences(user.id, apiUpdates);
      dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update preferences';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Toggle notification sound
  const toggleNotificationSound = async () => {
    if (!state.preferences) return;
    await updatePreferences({ notificationSound: !state.preferences.notificationSound });
  };

  // Toggle email notifications
  const toggleEmailNotifications = async () => {
    if (!state.preferences) return;
    await updatePreferences({ emailNotifications: !state.preferences.emailNotifications });
  };

  // Toggle push notifications
  const togglePushNotifications = async () => {
    if (!state.preferences) return;
    await updatePreferences({ pushNotifications: !state.preferences.pushNotifications });
  };

  // Load preferences on user change
  useEffect(() => {
    if (user?.id) {
      fetchPreferences();
    } else {
      // Set default preferences when user is not authenticated
      dispatch({ type: 'FETCH_SUCCESS', payload: defaultPreferences });
    }
  }, [user?.id]);

  const contextValue: UserPreferencesContextType = {
    preferences: state.preferences,
    loading: state.loading,
    error: state.error,
    updatePreferences,
    toggleNotificationSound,
    toggleEmailNotifications,
    togglePushNotifications,
  };

  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
};

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  return context;
};