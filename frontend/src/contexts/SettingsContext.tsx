'use client';

import React, { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { UserSettings, SettingsContextType } from '../types/settings.types';
import { settingsService } from '../services/settingsService';

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
      // Deep merge the nested settings structure
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
          // Merge nested objects properly
          appearance: {
            ...state.settings.appearance,
            ...(action.payload as any).appearance,
          },
          notifications: {
            ...state.settings.notifications,
            ...(action.payload as any).notifications,
          },
          task_defaults: {
            ...state.settings.task_defaults,
            ...(action.payload as any).task_defaults,
          },
          privacy: {
            ...state.settings.privacy,
            ...(action.payload as any).privacy,
          },
          integrations: {
            ...state.settings.integrations,
            ...(action.payload as any).integrations,
          },
        },
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

  // Helper function to get font size multiplier
  const getFontSizeMultiplier = useCallback((fontSize: 'S' | 'M' | 'L'): string => {
    switch (fontSize) {
      case 'S':
        return '0.875'; // Small: 0.875rem (14px)
      case 'L':
        return '1.125'; // Large: 1.125rem (18px)
      case 'M':
      default:
        return '1'; // Medium: 1rem (16px)
    }
  }, []);

  // Helper function to determine if text should be light or dark based on background
  const getForegroundColorForAccent = useCallback((bgColor: string): string => {
    // Convert hex to RGB
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }, []);

  // Save to localStorage - MOVED BEFORE applyTheme
  const saveToLocalStorage = useCallback((settings: UserSettings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings to localStorage', error);
    }
  }, []);

  // Load from localStorage - MOVED BEFORE applyTheme
  const loadFromLocalStorage = useCallback((): UserSettings | null => {
    try {
      const settings = localStorage.getItem('userSettings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Failed to load settings from localStorage', error);
      return null;
    }
  }, []);

  // Apply theme, accent color, and font size to document
  const applyTheme = useCallback((theme: 'light' | 'dark' | 'system', accentColor?: string, fontSize?: 'S' | 'M' | 'L') => {
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Determine the actual theme to apply
    let appliedTheme = theme;
    if (theme === 'system') {
      appliedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply the theme class
    root.classList.add(appliedTheme);

    // Apply accent color if provided
    if (accentColor) {
      root.style.setProperty('--accent-color', accentColor);
      root.style.setProperty('--accent-color-foreground', getForegroundColorForAccent(accentColor));
    } else if (state.settings?.appearance?.accent_color) {
      // Apply saved accent color if not specifically provided
      root.style.setProperty('--accent-color', state.settings.appearance.accent_color);
      root.style.setProperty('--accent-color-foreground', getForegroundColorForAccent(state.settings.appearance.accent_color));
    }

    // Apply font size if provided
    if (fontSize) {
      root.style.setProperty('--font-size-multiplier', getFontSizeMultiplier(fontSize));
    } else if (state.settings?.appearance?.font_size) {
      // Apply saved font size if not specifically provided
      root.style.setProperty('--font-size-multiplier', getFontSizeMultiplier(state.settings.appearance.font_size));
    }

    // Update meta theme color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute('content', appliedTheme === 'dark' ? '#0a0a0a' : '#ffffff');
    }
  }, [state.settings?.appearance?.accent_color, state.settings?.appearance?.font_size, getFontSizeMultiplier, getForegroundColorForAccent]);

  // Load settings from localStorage or API on mount
  useEffect(() => {
    const loadSettings = async () => {
      dispatch({ type: 'SETTINGS_LOADING' });

      try {
        // Try to load from localStorage first
        const savedSettings = loadFromLocalStorage();
        if (savedSettings) {
          dispatch({ type: 'LOAD_SETTINGS', payload: savedSettings });
          // Apply theme after loading settings
          applyTheme(savedSettings.appearance.theme, savedSettings.appearance.accent_color, savedSettings.appearance.font_size);
          return;
        }

        // If not in localStorage, fetch from API
        const apiSettings = await settingsService.getSettings();
        dispatch({ type: 'LOAD_SETTINGS', payload: apiSettings });
        // Apply theme after loading settings
        applyTheme(apiSettings.appearance.theme, apiSettings.appearance.accent_color, apiSettings.appearance.font_size);
      } catch (error) {
        console.error('Failed to load settings:', error);
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Failed to load settings'
        });
        applyTheme('system'); // Default to system theme on error
      }
    };

    loadSettings();
  }, [loadFromLocalStorage, applyTheme]);

  // Validate settings updates
  const validateSettings = useCallback((updates: Partial<UserSettings>): boolean => {
    // Validate appearance settings
    if (updates.appearance) {
      if (updates.appearance.accent_color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(updates.appearance.accent_color)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Invalid accent color format. Please use a valid hex color code.'
        });
        return false;
      }

      if (updates.appearance.font_size && !['S', 'M', 'L'].includes(updates.appearance.font_size)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Invalid font size. Please select S, M, or L.'
        });
        return false;
      }

      if (updates.appearance.theme && !['light', 'dark', 'system'].includes(updates.appearance.theme)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Invalid theme. Please select light, dark, or system.'
        });
        return false;
      }
    }

    // Validate task defaults
    if (updates.task_defaults) {
      if (updates.task_defaults.items_per_page && (updates.task_defaults.items_per_page < 1 || updates.task_defaults.items_per_page > 100)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Items per page must be between 1 and 100.'
        });
        return false;
      }

      if (updates.task_defaults.default_priority && !['low', 'medium', 'high'].includes(updates.task_defaults.default_priority)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Invalid priority. Please select low, medium, or high.'
        });
        return false;
      }

      if (updates.task_defaults.default_view && !['list', 'grid'].includes(updates.task_defaults.default_view)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Invalid view. Please select list or grid.'
        });
        return false;
      }
    }

    // Validate privacy settings
    if (updates.privacy) {
      if (updates.privacy.data_retention_days !== undefined && (updates.privacy.data_retention_days < 0 || updates.privacy.data_retention_days > 365)) {
        dispatch({
          type: 'SETTINGS_ERROR',
          payload: 'Data retention days must be between 0 and 365.'
        });
        return false;
      }
    }

    return true;
  }, []);

  // Update settings function
  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    dispatch({ type: 'SETTINGS_LOADING' });

    // Validate updates before processing
    if (!validateSettings(updates)) {
      return;
    }

    try {
      // Update in state
      if (state.settings) {
        // Create updated settings object with proper nested merging
        const updatedSettings = {
          ...state.settings,
          ...updates,
          appearance: {
            ...state.settings.appearance,
            ...(updates.appearance || {}),
          },
          notifications: {
            ...state.settings.notifications,
            ...(updates.notifications || {}),
          },
          task_defaults: {
            ...state.settings.task_defaults,
            ...(updates.task_defaults || {}),
          },
          privacy: {
            ...state.settings.privacy,
            ...(updates.privacy || {}),
          },
          integrations: {
            ...state.settings.integrations,
            ...(updates.integrations || {}),
          },
        };

        dispatch({ type: 'UPDATE_SETTINGS', payload: updates });

        // Save to localStorage
        saveToLocalStorage(updatedSettings);

        // Handle theme, accent color, and font size changes
        if (updates.appearance?.theme || updates.appearance?.accent_color || updates.appearance?.font_size) {
          applyTheme(
            updates.appearance?.theme || updatedSettings.appearance.theme,
            updates.appearance?.accent_color || updatedSettings.appearance.accent_color,
            updates.appearance?.font_size || updatedSettings.appearance.font_size
          );
        }
      }

      // Update on server
      try {
        await settingsService.updateSettings(updates);
      } catch (error) {
        console.error('Failed to update settings on server:', error);
        // Continue with local storage update even if server fails
      }
    } catch (error) {
      dispatch({
        type: 'SETTINGS_ERROR',
        payload: 'Failed to update settings'
      });
      throw error;
    }
  }, [state.settings, applyTheme, validateSettings, saveToLocalStorage]);

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