'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

interface QueueItem {
  id: string;
  action: string;
  payload: any;
  timestamp: number;
}

interface OfflineState {
  isOnline: boolean;
  syncQueue: QueueItem[];
}

type OfflineAction =
  | { type: 'UPDATE_STATUS'; payload: boolean }
  | { type: 'ADD_TO_QUEUE'; payload: QueueItem }
  | { type: 'REMOVE_FROM_QUEUE'; payload: string }
  | { type: 'PROCESS_QUEUE' };

const initialState: OfflineState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncQueue: [],
};

const offlineReducer = (state: OfflineState, action: OfflineAction): OfflineState => {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, syncQueue: [...state.syncQueue, action.payload] };
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        syncQueue: state.syncQueue.filter(item => item.id !== action.payload),
      };
    case 'PROCESS_QUEUE':
      // In a real implementation, this would process the queue items
      return state;
    default:
      return state;
  }
};

const OfflineContext = createContext<{
  state: OfflineState;
  dispatch: React.Dispatch<OfflineAction>;
}>({
  state: initialState,
  dispatch: () => {},
});

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(offlineReducer, initialState);

  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'UPDATE_STATUS', payload: true });
    const handleOffline = () => dispatch({ type: 'UPDATE_STATUS', payload: false });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Process queue when coming back online
  useEffect(() => {
    if (state.isOnline && state.syncQueue.length > 0) {
      dispatch({ type: 'PROCESS_QUEUE' });
      // In a real implementation, this would process the queued actions
    }
  }, [state.isOnline, state.syncQueue.length]);

  return (
    <OfflineContext.Provider value={{ state, dispatch }}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
};

export const addToSyncQueue = (action: string, payload: any) => {
  const queueItem: QueueItem = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    action,
    payload,
    timestamp: Date.now(),
  };

  // In a real implementation, this would dispatch to add to the queue
  // For now, we'll just return the queue item
  return queueItem;
};