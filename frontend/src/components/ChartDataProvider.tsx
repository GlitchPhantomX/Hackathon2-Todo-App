'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { statsService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { TaskStats } from '@/types/types';

interface ChartDataContextType {
  stats: TaskStats;
  isLoading: boolean;
  error: string | null;
  refreshStats: () => void;
}

const ChartDataContext = createContext<ChartDataContextType | undefined>(undefined);

interface ChartDataProviderProps {
  children: ReactNode;
}

export const ChartDataProvider: React.FC<ChartDataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['taskStats', user?.id],
    queryFn: () => user?.id ? statsService.getStats(user.id) : Promise.resolve({
      total: 0,
      completed: 0,
      pending: 0,
      overdue: 0,
      byPriority: { high: 0, medium: 0, low: 0 },
      byProject: [],
      completionRate: 0,
      productivityTrend: []
    }),
    enabled: !!user?.id,
    refetchInterval: 30000, // Auto-refresh every 30 seconds
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const refreshStats = () => {
    refetch();
  };

  return (
    <ChartDataContext.Provider value={{
      stats: stats ?? {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        byPriority: { high: 0, medium: 0, low: 0 },
        byProject: [],
        completionRate: 0,
        productivityTrend: []
      },
      isLoading,
      error: error ? (error as Error).message : null,
      refreshStats
    }}>
      {children}
    </ChartDataContext.Provider>
  );
};

export const useChartData = () => {
  const context = useContext(ChartDataContext);
  if (context === undefined) {
    throw new Error('useChartData must be used within a ChartDataProvider');
  }
  return context;
};