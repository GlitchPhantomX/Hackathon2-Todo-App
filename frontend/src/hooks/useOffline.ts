import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [isOnlineChecked, setIsOnlineChecked] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsOnlineChecked(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setIsOnlineChecked(true);
    };

    // Check initial state
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set the checked flag after initial check
    setTimeout(() => setIsOnlineChecked(true), 0);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, isOnlineChecked };
};