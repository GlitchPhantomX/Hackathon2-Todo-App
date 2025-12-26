'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { OfflineState } from '../types/settings.types';

interface OfflineAction {
  type: 'UPDATE_STATUS';
  payload: boolean;
}

interface SyncAction {
  type: 'ADD_TO_QUEUE' | 'REMOVE_FROM_QUEUE';
  payload: any;
}

type OfflineContextAction = OfflineAction | SyncAction;

const initialState: OfflineState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  syncQueue: [],
};

const offlineReducer = (
  state: OfflineState,
  action: OfflineContextAction
) => {
  switch (action.type) {
    case 'UPDATE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, syncQueue: [...state.syncQueue, action.payload] };
    case 'REMOVE_FROM_QUEUE':
      return {
        ...state,
        syncQueue: state.syncQueue.filter(
          (item) => item.id !== action.payload.id
        ),
      };
    default:
      return state;
  }
};

const OfflineContext = createContext<OfflineState | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  return (
    <OfflineContext.Provider value={state}>
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