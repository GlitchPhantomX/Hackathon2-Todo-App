import { useState, useEffect, useCallback } from 'react';
import { webSocketNotificationService } from '@/services/notificationService';

interface NotificationData {
  id: string;
  type: string;
  title: string;
  message: string;
  taskId?: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

interface UseNotificationsReturn {
  notifications: NotificationData[];
  unreadCount: number;
  connect: (userId: string, token: string) => Promise<void>;
  disconnect: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  isConnected: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Calculate unread count whenever notifications change
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const connect = useCallback(async (userId: string, token: string) => {
    try {
      // Connect to WebSocket
      await webSocketNotificationService.connect(userId, token);

      // Set up event listeners
      webSocketNotificationService.on('new_notification', (data) => {
        setNotifications(prev => [data.notification, ...prev]);
      });

      webSocketNotificationService.on('unread_count', (data) => {
        setUnreadCount(data.count);
      });

      // Get initial notifications
      webSocketNotificationService.getUnreadCount();
    } catch (error) {
      console.error('Failed to connect to notification service:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    webSocketNotificationService.disconnect();
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const isConnected = webSocketNotificationService.isConnectedToWebSocket();

  return {
    notifications,
    unreadCount,
    connect,
    disconnect,
    markAsRead,
    markAllAsRead,
    isConnected,
  };
};