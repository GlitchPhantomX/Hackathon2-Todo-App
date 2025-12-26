'use client';

import React from 'react';
import { ToastContainer } from '@/components/ToastContainer';
import { useDashboard } from '@/contexts/DashboardContext';

export const ClientLayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toasts, removeToast } = useDashboard();

  return (
    <>
      {children}
      {/* ✅ Toast notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
};