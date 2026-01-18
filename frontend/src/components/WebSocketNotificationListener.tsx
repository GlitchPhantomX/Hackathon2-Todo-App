'use client';

import React, { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { websocketService } from '@/services/websocketService';

const WebSocketNotificationListener: React.FC = () => {
  const { addNotification } = useNotification();

  useEffect(() => {
    // This component serves as a mount point for WebSocket notification handling
    // The actual WebSocket connection and event handling is done in NotificationContext
    // via websocketService which is already set up to handle 'notification_created' events
    console.log('WebSocketNotificationListener mounted');

    return () => {
      console.log('WebSocketNotificationListener unmounted');
    };
  }, [addNotification]);

  return null;
};

export default WebSocketNotificationListener;