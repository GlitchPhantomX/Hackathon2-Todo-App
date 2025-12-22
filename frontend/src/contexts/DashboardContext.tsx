'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Task } from '@/types/task.types'
import { taskService } from '@/services/api'
import { useAuth } from './AuthContext'

interface DashboardContextType {
  tasks: Task[]
  loading: boolean
  error: Error | null
  refreshTasks: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshTasks = async () => {
    // ✅ Check if user is authenticated and has ID
    if (!user?.id || !isAuthenticated) {
      console.log('⚠️ No user ID or not authenticated, skipping task fetch');
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true)
      console.log('🔄 Refreshing tasks for user:', user.id);
      
      const fetchedTasks = await taskService.getTasks(user.id);
      
      console.log('✅ Tasks fetched:', fetchedTasks);
      console.log('✅ Tasks is array?', Array.isArray(fetchedTasks));
      
      // ✅ Ensure it's an array before setting state
      setTasks(Array.isArray(fetchedTasks) ? fetchedTasks : []);
      setError(null);
    } catch (err) {
      console.error('❌ Error in refreshTasks:', err);
      setError(err as Error);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch if authenticated and have user
    if (isAuthenticated && user?.id) {
      console.log('🎯 DashboardContext: Starting initial task fetch');
      refreshTasks();

      // Auto-refresh every 30 seconds
      const interval = setInterval(refreshTasks, 30000);
      return () => clearInterval(interval);
    } else {
      console.log('⏳ DashboardContext: Waiting for authentication');
      setLoading(false);
      setTasks([]);
    }
  }, [isAuthenticated, user?.id])

  return (
    <DashboardContext.Provider value={{ tasks, loading, error, refreshTasks }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}