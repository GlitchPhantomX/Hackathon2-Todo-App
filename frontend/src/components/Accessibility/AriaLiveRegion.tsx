'use client';

import React, { useEffect, useState } from 'react';

interface AriaLiveRegionProps {
  children: React.ReactNode;
  politeness?: 'off' | 'polite' | 'assertive';
  className?: string;
}

export const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  children,
  politeness = 'polite',
  className = ''
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
};

// Utility component for announcing messages to screen readers
interface AriaLiveAnnouncerProps {
  message: string;
  politeness?: 'polite' | 'assertive';
}

export const AriaLiveAnnouncer: React.FC<AriaLiveAnnouncerProps> = ({
  message,
  politeness = 'polite'
}) => {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      // Clear the announcement after a short delay to avoid repeated announcements
      const timer = setTimeout(() => setAnnouncement(''), 100);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};