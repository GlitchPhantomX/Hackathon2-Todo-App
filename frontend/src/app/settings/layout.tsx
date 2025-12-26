'use client';

import { ReactNode } from 'react';
import { SettingsProvider } from '@/contexts/SettingsContext';

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      {children}
    </SettingsProvider>
  );
}
