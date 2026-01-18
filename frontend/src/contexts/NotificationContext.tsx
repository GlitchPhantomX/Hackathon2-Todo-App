'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef, useCallback } from 'react';
import { notificationService } from '@/services/apiService';
import type { Notification as NotificationType } from '../types/types';
import { useAuth } from './AuthContext';
import { useUserPreferences } from './UserPreferencesContext';
import { websocketService } from '@/services/websocketService';
import { notificationSoundService } from '../services/notificationSoundService';

interface NotificationState {
  notifications: NotificationType[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
}

interface NotificationContextType {
  notifications: NotificationType[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
  addNotification: (notification: NotificationType) => void;
  createTaskNotification: (type: 'created' | 'updated' | 'completed' | 'deleted', taskTitle: string, taskId?: string) => void;
}

type NotificationAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: NotificationType[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'MARK_AS_READ'; payload: string }
  | { type: 'MARK_ALL_AS_READ' }
  | { type: 'ADD_NOTIFICATION'; payload: NotificationType }
  | { type: 'UPDATE_NOTIFICATION'; payload: NotificationType }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        error: null,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0,
      };
    case 'ADD_NOTIFICATION':
      const newNotifications = [action.payload, ...state.notifications].slice(0, 50);
      return {
        ...state,
        notifications: newNotifications,
        unreadCount: newNotifications.filter(n => !n.read).length,
      };
    case 'UPDATE_NOTIFICATION':
      const updatedNotifications = state.notifications.map(notification =>
        notification.id === action.payload.id ? action.payload : notification
      );
      return {
        ...state,
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    case 'REMOVE_NOTIFICATION':
      const filteredNotifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      return {
        ...state,
        notifications: filteredNotifications,
        unreadCount: filteredNotifications.filter(n => !n.read).length,
      };
    default:
      return state;
  }
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  let user;
  let preferences;
  
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (error) {
    user = null;
  }

  try {
    const prefs = useUserPreferences();
    preferences = prefs?.preferences;
  } catch (error) {
    preferences = null;
  }

  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  });
  
  // const { showToast } = useToast();
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRequestedPermission = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && !hasRequestedPermission.current) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          console.log('📬 Notification permission:', permission);
        });
        hasRequestedPermission.current = true;
      }
    }
  }, []);

  const showBrowserNotification = useCallback((title: string, body: string, icon?: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          body,
          icon: icon || '/next.svg',
          badge: '/next.svg',
          tag: `notification-${Date.now()}`,
          requireInteraction: false,
          silent: false,
        });

        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  }, []);

  const handleShowToast = useCallback((notification: NotificationType) => {
    const notificationsEnabled = preferences?.notificationsEnabled !== false;
    
    if (notificationsEnabled) {
      // Map notification types to toast types
      let toastType: 'success' | 'info' | 'warning' | 'error' | 'reminder' = 'info';
      
      if (notification.type === 'task_created' || notification.type === 'task_completed') {
        toastType = 'success';
      } else if (notification.type === 'task_deleted') {
        toastType = 'warning';
      } else if (notification.type === 'reminder' || notification.type === 'due_today') {
        toastType = 'reminder';
      } else if (notification.type === 'overdue') {
        toastType = 'error';
      } else if (notification.type === 'task_updated') {
        toastType = 'info';
      }

      

      // Play sound
      const soundMap: Record<string, string> = {
        'task_created': 'taskCreated',
        'task_completed': 'taskCompleted',
        'task_updated': 'taskUpdated',
        'task_deleted': 'taskDeleted',
        'overdue': 'overdue',
        'due_today': 'dueToday',
        'reminder': 'reminder',
      };

      const soundType = soundMap[notification.type] || 'taskCreated';
      notificationSoundService.play(soundType);

      // Show browser notification
      showBrowserNotification(
        notification.title,
        notification.message,
        notification.icon
      );

      console.log('🔔 Notification:', notification.title, '-', notification.message);
    }
  }, [preferences?.notificationsEnabled, showBrowserNotification]);

  const fetchNotifications = useCallback(async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'FETCH_START' });
      const notifications = await notificationService.getNotifications(user.id, false, 20);
      dispatch({ type: 'FETCH_SUCCESS', payload: notifications });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const updatedNotification = await notificationService.markNotificationAsRead(user.id, notificationId);
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: updatedNotification });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'MARK_ALL_AS_READ' });
      
      const unreadNotifications = state.notifications.filter(n => !n.read);
      for (const notification of unreadNotifications) {
        await notificationService.markNotificationAsRead(user.id, notification.id);
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  }, [user?.id, state.notifications]);

  const addNotification = useCallback((notification: NotificationType) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    handleShowToast(notification);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      // Auto-dismiss logic if needed
    }, 5000);
  }, [handleShowToast]);

  const createTaskNotification = useCallback((
    type: 'created' | 'updated' | 'completed' | 'deleted',
    taskTitle: string,
    taskId?: string
  ) => {
    const notificationMessages = {
      created: {
        title: 'Task Created',
        message: `"${taskTitle}" has been added to your list`,
        type: 'task_created',
        icon: '✅',
        color: '#10b981',
      },
      updated: {
        title: 'Task Updated',
        message: `"${taskTitle}" has been modified`,
        type: 'task_updated',
        icon: '📝',
        color: '#3b82f6',
      },
      completed: {
        title: 'Task Completed',
        message: `"${taskTitle}" is done`,
        type: 'task_completed',
        icon: '🎉',
        color: '#22c55e',
      },
      deleted: {
        title: 'Task Deleted',
        message: `"${taskTitle}" has been removed`,
        type: 'task_deleted',
        icon: '🗑️',
        color: '#ef4444',
      },
    };

    const config = notificationMessages[type];
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substr(2, 9);
    
    const notification: NotificationType = {
      id: `notif_${timestamp}_${randomId}`,
      userId: user?.id || '',
      type: config.type,
      title: config.title,
      message: config.message,
      read: false,
      createdAt: new Date().toISOString(),
      icon: config.icon,
      color: config.color,
      taskId,
      taskTitle,
    };

    addNotification(notification);
  }, [user?.id, addNotification]);

  // Polling for notifications (fallback when WebSocket is not available)
  useEffect(() => {
    if (!user?.id) return;

    fetchNotifications();
    
    // Poll every 30 seconds as fallback
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  // ✅ FIXED: WebSocket connection for notifications
  useEffect(() => {
    if (!user?.id) return;

    const token = localStorage.getItem('token') ||
      document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

    if (!token) {
      console.log('⚠️ No token found, cannot connect WebSocket');
      return;
    }

    console.log('🔌 Connecting to WebSocket for notifications...');

    // Connect to WebSocket
    websocketService.connect(token);

    // ✅ Listen for notification_created event (correct event name!)
    const unsubscribeNotification = websocketService.subscribe('notification_created', (data) => {
      console.log('🔔 Notification event received:', data);
      if (data.notification) {
        addNotification(data.notification);
      }
    });

    return () => {
      console.log('🔌 Cleaning up WebSocket notification listener');
      unsubscribeNotification();

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [user?.id, addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        loading: state.loading,
        error: state.error,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        addNotification,
        createTaskNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};