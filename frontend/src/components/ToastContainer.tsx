'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { ToastNotification } from './ToastNotification';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error' | 'reminder';
  icon?: string;
  duration?: number;
}

const ToastContainer: React.FC = () => {
  const { notifications } = useNotification();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const processedNotificationIds = useRef(new Set<string>());

  useEffect(() => {
    // Process only NEW notifications that haven't been shown as toasts yet
    notifications.forEach(notification => {
      // Skip if already processed
      if (processedNotificationIds.current.has(notification.id)) {
        return;
      }

      // Check if notification is recent (within last 10 seconds)
      const createdAt = new Date(notification.createdAt).getTime();
      const now = Date.now();
      const isRecent = now - createdAt < 10000; // 10 seconds

      if (isRecent && !notification.read) {
        console.log('🍞 Adding toast for notification:', notification.title);
        
        const newToast: Toast = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: mapNotificationType(notification.type),
          icon: notification.icon,
          duration: 5000,
        };

        setToasts(prev => {
          // Avoid duplicates
          if (prev.some(t => t.id === notification.id)) {
            return prev;
          }
          return [newToast, ...prev];
        });

        // Mark as processed
        processedNotificationIds.current.add(notification.id);
      }
    });

    // Cleanup old processed IDs (keep only last 100)
    if (processedNotificationIds.current.size > 100) {
      const idsArray = Array.from(processedNotificationIds.current);
      processedNotificationIds.current = new Set(idsArray.slice(-100));
    }
  }, [notifications]);

  const mapNotificationType = (type: string): Toast['type'] => {
    switch (type) {
      case 'task_created':
      case 'task_completed':
        return 'success';
      case 'task_updated':
        return 'info';
      case 'task_deleted':
        return 'warning';
      case 'reminder':
      case 'due_today':
        return 'reminder';
      case 'overdue':
        return 'error';
      default:
        return 'info';
    }
  };

  const removeToast = (id: string) => {
    console.log('🗑️ Removing toast:', id);
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div className="flex flex-col gap-2 pointer-events-auto max-h-screen overflow-y-auto">
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            icon={toast.icon}
            duration={toast.duration}
            onClose={removeToast}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;