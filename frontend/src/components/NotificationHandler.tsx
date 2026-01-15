'use client';

import { useEffect } from 'react';

const NotificationHandler = () => {
  useEffect(() => {
    // Request notification permission as soon as the app starts
    if (typeof window !== 'undefined' && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  return null;
};

export default NotificationHandler;