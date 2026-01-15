'use client';

import { useEffect, useRef } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';

interface WebSocketNotificationListenerProps {
  children: React.ReactNode;
}

const WebSocketNotificationListener: React.FC<WebSocketNotificationListenerProps> = ({ children }) => {
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const permissionRequested = useRef(false);

  /**
   * Request browser notification permission
   */
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      console.log("❌ Browser notifications not supported");
      return false;
    }

    if (permissionRequested.current) {
      return Notification.permission === "granted";
    }

    permissionRequested.current = true;

    if (Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission === "granted";
    }

    return Notification.permission === "granted";
  };

  /**
   * Show browser notification
   */
  const showBrowserNotification = (title: string, message: string) => {
    if (Notification.permission === "granted") {
      try {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          tag: `notification-${Date.now()}`,
        });

        setTimeout(() => notification.close(), 5000);
        notification.onclick = () => {
          window.focus();
          notification.close();
        };
      } catch (error) {
        console.error('❌ Error showing browser notification:', error);
      }
    }
  };

  /**
   * Show beautiful toast notification
   */
  const showToastNotification = (notification: any) => {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('notification-toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'notification-toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 12px;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.style.cssText = `
      background: ${notification.color}15;
      border: 2px solid ${notification.color};
      border-radius: 12px;
      padding: 16px 20px;
      min-width: 320px;
      max-width: 400px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: start;
      gap: 12px;
      pointer-events: auto;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      backdrop-filter: blur(10px);
    `;

    // Create icon element separately to avoid URL issues
    const iconDiv = document.createElement('div');
    iconDiv.style.cssText = 'font-size: 24px; flex-shrink: 0;';
    iconDiv.textContent = notification.icon;

    // Create content div
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'flex: 1; min-width: 0;';
    
    const titleDiv = document.createElement('div');
    titleDiv.style.cssText = `font-weight: 600; font-size: 14px; color: ${notification.color}; margin-bottom: 4px;`;
    titleDiv.textContent = notification.title;
    
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = 'font-size: 13px; color: var(--foreground); opacity: 0.9;';
    messageDiv.textContent = notification.message;
    
    contentDiv.appendChild(titleDiv);
    contentDiv.appendChild(messageDiv);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.style.cssText = `
      background: none;
      border: none;
      color: ${notification.color};
      cursor: pointer;
      font-size: 20px;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    `;
    closeButton.textContent = '×';
    closeButton.onmouseover = () => closeButton.style.opacity = '1';
    closeButton.onmouseout = () => closeButton.style.opacity = '0.7';

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    if (!document.getElementById('toast-animations')) {
      style.id = 'toast-animations';
      document.head.appendChild(style);
    }

    // Assemble toast
    toast.appendChild(iconDiv);
    toast.appendChild(contentDiv);
    toast.appendChild(closeButton);

    // Add click handlers
    const removeToast = () => {
      toast.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        toast.remove();
      }, 300);
    };

    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      removeToast();
    });

    toast.addEventListener('click', () => {
      removeToast();
      // Navigate to task if taskId exists
      if (notification.taskId) {
        // Add navigation logic here if needed
      }
    });

    // Add to container
    toastContainer.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(removeToast, 5000);
  };

  /**
   * Play notification sound
   */
  const playNotificationSound = () => {
    try {
      // Create a simple beep sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
      // Ignore audio errors
    }
  };

  /**
   * Connect to WebSocket
   */
  const connectWebSocket = () => {
    if (!user?.id) return;

    // Close existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    try {
      // Connect to notification consumer on port 8001
      const wsUrl = `ws://localhost:8001/ws/${user.id}`;
      console.log('🔌 Connecting to WebSocket:', wsUrl);

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('✅ WebSocket connected to notification service');
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 Received WebSocket message:', data);

          // Handle different message types
          if (data.type === 'pong') {
            // Ignore pong messages
            return;
          }

          // Determine notification type and styling
          let notificationType = 'info';
          let icon = '🔔';
          let color = '#3B82F6';
          let title = data.title || '🔔 Notification';
          let message = data.message || 'You have a new notification';

          switch (data.type) {
            case 'task_created':
              notificationType = 'success';
              icon = '✨';
              color = '#10B981';
              title = data.title || '✨ New Task Created';
              break;
            case 'reminder-sent':
            case 'task_reminder':
              notificationType = 'reminder';
              icon = '⏰';
              color = '#7C3AED';
              title = data.title || '⏰ Task Reminder';
              break;
            case 'task_updated':
              notificationType = 'info';
              icon = '📝';
              color = '#3B82F6';
              title = data.title || '📝 Task Updated';
              break;
            case 'task_completed':
              notificationType = 'success';
              icon = '✅';
              color = '#10B981';
              title = data.title || '✅ Task Completed';
              break;
            case 'task_deleted':
              notificationType = 'warning';
              icon = '🗑️';
              color = '#EF4444';
              title = data.title || '🗑️ Task Deleted';
              break;
            default:
              // Use data from WebSocket if available
              icon = data.icon || icon;
              color = data.color || color;
          }

          // Create notification object
          const notification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: user.id,
            type: notificationType,
            title: title,
            message: message,
            taskId: data.taskId || data.task_id,
            taskTitle: data.taskTitle || data.task_title,
            read: false,
            createdAt: new Date().toISOString(),
            icon: icon,
            color: color,
          };

          console.log('📬 Adding notification to context:', notification);

          // Add to notification context
          // This will automatically handle:
          // 1. Adding to dropdown
          // 2. Showing browser notification
          // 3. Playing sound
          // 4. Displaying toast
          addNotification(notification);

          // ❌ REMOVED: Duplicate toast/browser notification/sound
          // NotificationContext.addNotification() already handles all of this via showToast()

        } catch (error) {
          console.error('❌ Error handling WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('⚠️ WebSocket disconnected, will reconnect in 5 seconds...');
        
        // Reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔄 Attempting to reconnect...');
          connectWebSocket();
        }, 5000);
      };

      wsRef.current = ws;

      // Send ping every 30 seconds to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);

    } catch (error) {
      console.error('❌ Failed to create WebSocket:', error);
      
      // Retry after 5 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 5000);
    }
  };

  useEffect(() => {
    // Request notification permission
    requestNotificationPermission();

    // Connect to WebSocket
    if (user?.id) {
      console.log('🔌 Initializing WebSocket for user:', user.id);
      connectWebSocket();
    }

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user?.id]);

  return <>{children}</>;
};

export default WebSocketNotificationListener;