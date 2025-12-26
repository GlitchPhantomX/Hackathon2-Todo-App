'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode, useRef } from 'react';
import { notificationService } from '@/services/apiService';
import type { Notification as NotificationType } from '../types/types';
import { useAuth } from './AuthContext';
import { useUserPreferences } from './UserPreferencesContext';
import { webSocketNotificationService } from '@/services/notificationService';
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

const ENABLE_WEBSOCKET = false;

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
      const newNotifications = [action.payload, ...state.notifications].slice(0, 50); // Keep last 50
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
  const { user } = useAuth();
  const { preferences } = useUserPreferences();
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,
  });
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasRequestedPermission = useRef(false);

  // ✅ Request browser notification permission on mount
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

  // ✅ Show browser notification
  const showBrowserNotification = (title: string, body: string, icon?: string) => {
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

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.warn('Failed to show browser notification:', error);
      }
    }
  };

  // ✅ Show toast notification with sound
  const showToast = (notification: NotificationType) => {
    const notificationsEnabled = preferences?.notificationsEnabled !== false;
    
    if (notificationsEnabled) {
      // Play sound based on notification type
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
  };

  // ✅ Create task-related notification
  const createTaskNotification = (
    type: 'created' | 'updated' | 'completed' | 'deleted',
    taskTitle: string,
    taskId?: string
  ) => {
    const notificationMessages = {
      created: {
        title: '✅ Task Created',
        message: `"${taskTitle}" has been added to your list`,
        type: 'task_created',
        icon: '✅',
        color: '#10b981',
      },
      updated: {
        title: '📝 Task Updated',
        message: `"${taskTitle}" has been modified`,
        type: 'task_updated',
        icon: '📝',
        color: '#3b82f6',
      },
      completed: {
        title: '🎉 Task Completed!',
        message: `Awesome! "${taskTitle}" is done`,
        type: 'task_completed',
        icon: '🎉',
        color: '#22c55e',
      },
      deleted: {
        title: '🗑️ Task Deleted',
        message: `"${taskTitle}" has been removed`,
        type: 'task_deleted',
        icon: '🗑️',
        color: '#ef4444',
      },
    };

    const config = notificationMessages[type];
    
    const notification: NotificationType = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: user?.id || '',
      type: config.type,
      title: config.title,
      message: config.message,
      taskId: taskId,
      taskTitle: taskTitle,
      icon: config.icon,
      color: config.color,
      read: false,
      createdAt: new Date().toISOString(),
    };

    addNotification(notification);
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      dispatch({ type: 'FETCH_START' });
      const notifications = await notificationService.getNotifications(user.id, false, 20);
      dispatch({ type: 'FETCH_SUCCESS', payload: notifications });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch notifications';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }
  };

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    if (!user?.id) return;

    try {
      const updatedNotification = await notificationService.markNotificationAsRead(user.id, notificationId);
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: updatedNotification });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
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
  };

  // Add notification
  const addNotification = (notification: NotificationType) => {
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    showToast(notification);

    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      // Auto-dismiss logic if needed
    }, 5000);
  };

  // Polling for notifications
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [user?.id]);

  // WebSocket connection
  useEffect(() => {
    if (!user?.id || !ENABLE_WEBSOCKET) {
      return;
    }
  
    const connectWebSocket = async () => {
      try {
        const token = localStorage.getItem('token') ||
          document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];

        if (!token) return;

        await webSocketNotificationService.connect(user.id, token);

        webSocketNotificationService.on('new_notification', (data) => {
          if (data.notification) addNotification(data.notification);
        });

        webSocketNotificationService.on('unread_count', (data) => {
          console.log('Unread count:', data.count);
        });

      } catch (error) {
        console.warn('WebSocket failed:', error);
      }
    };

    connectWebSocket();

    return () => {
      try {
        webSocketNotificationService.disconnect();
      } catch (error) {
        // Ignore
      }
      
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [user?.id]);

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