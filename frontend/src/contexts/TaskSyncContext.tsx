'use client';

export const dynamic = 'force-dynamic';

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Task, TaskSyncContextType, TaskSyncState } from '../types/chat.types';
import { websocketService } from '../services/websocketService';

// Define action types for the reducer
type TaskSyncAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_TASKS_START' }
  | { type: 'SYNC_TASKS_SUCCESS'; payload: Task[] }
  | { type: 'SYNC_TASKS_ERROR'; payload: string }
  | { type: 'SET_WEBSOCKET_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' | 'error' };

// Reducer function
const taskSyncReducer = (state: TaskSyncState, action: TaskSyncAction): TaskSyncState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, isLoading: false, error: null };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        isLoading: false,
        error: null
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
        isLoading: false,
        error: null
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        isLoading: false,
        error: null
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SYNC_TASKS_START':
      return { ...state, isLoading: true, error: null };
    case 'SYNC_TASKS_SUCCESS':
      return { ...state, tasks: action.payload, isLoading: false, error: null };
    case 'SYNC_TASKS_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'SET_WEBSOCKET_STATUS':
      return { ...state, websocketStatus: action.payload };
    default:
      return state;
  }
};

// Create the context
const TaskSyncContext = createContext<TaskSyncContextType | undefined>(undefined);

// Provider component
interface TaskSyncProviderProps {
  children: React.ReactNode;
}

export const TaskSyncProvider: React.FC<TaskSyncProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(taskSyncReducer, {
    tasks: [],
    isLoading: false,
    error: null,
    websocketStatus: 'disconnected',
  });

  const [isClient, setIsClient] = React.useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // ✅ Define syncTasks FIRST (before addTask uses it)
  const syncTasks = useCallback(async () => {
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
      dispatch({ type: 'SYNC_TASKS_ERROR', payload: 'No authentication token' });
      return;
    }

    dispatch({ type: 'SYNC_TASKS_START' });
    try {
      const apiUrl = `http://localhost:8000/api/v1/users/me/tasks`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to sync tasks: ${response.status}`);
      }

      const tasks = await response.json();
      
      // Convert backend format to frontend format
      const formattedTasks = tasks.map((task: any) => ({
        id: task.id.toString(),
        title: task.title,
        description: task.description,
        status: task.status || (task.completed ? 'completed' : 'pending'),
        priority: task.priority,
        due_date: task.due_date,
        project_id: task.project_id?.toString(),
        user_id: task.user_id.toString(),
        tags: task.tags || [],
        created_at: task.created_at,
        updated_at: task.updated_at
      }));
      
      dispatch({ type: 'SYNC_TASKS_SUCCESS', payload: formattedTasks });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      dispatch({ type: 'SYNC_TASKS_ERROR', payload: errorMessage });
    }
  }, [isClient]);

  // Effect to handle WebSocket connections and event handling
  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    if (!token) return;

    websocketService.connect(token);

    websocketService.onConnectionStatusChange((status) => {
      dispatch({ type: 'SET_WEBSOCKET_STATUS', payload: status });
    });

    const unsubscribeTaskCreated = websocketService.subscribe('task_created', (data) => {
      if (data.task) {
        dispatch({ type: 'ADD_TASK', payload: data.task });
      }
    });

    const unsubscribeTaskUpdated = websocketService.subscribe('task_updated', (data) => {
      if (data.task) {
        dispatch({ type: 'UPDATE_TASK', payload: { id: data.task.id, updates: data.task } });
      }
    });

    const unsubscribeTaskDeleted = websocketService.subscribe('task_deleted', (data) => {
      if (data.taskId) {
        dispatch({ type: 'DELETE_TASK', payload: data.taskId });
      }
    });

    const unsubscribeSyncResponse = websocketService.subscribe('sync_response', (data) => {
      if (data.tasks) {
        dispatch({ type: 'SET_TASKS', payload: data.tasks });
      }
    });

    websocketService.requestSync();

    return () => {
      unsubscribeTaskCreated();
      unsubscribeTaskUpdated();
      unsubscribeTaskDeleted();
      unsubscribeSyncResponse();
      websocketService.disconnect();
    };
  }, [isClient]);

  // ✅ Now define addTask (after syncTasks is defined)
  const addTask = useCallback(async (task: Task) => {
    if (!isClient) return;
  
    console.log('🚀 addTask called with:', task);
  
    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  
    if (!token) {
      const errorMessage = 'No authentication token found. Please login.';
      console.error('❌', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw new Error(errorMessage);
    }
  
    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const optimisticTask = { ...task, id: tempId };
    dispatch({ type: 'ADD_TASK', payload: optimisticTask });
  
    try {
      // ✅ Send task AS-IS to backend (already cleaned in AddTaskModal)
      const taskData = { ...task };
      
      // ✅ Remove frontend-only fields
      delete taskData.id;
      delete taskData.created_at;
      delete taskData.updated_at;
      delete taskData.user_id;
      delete taskData.tags;
      delete taskData.status; // Backend doesn't accept status on create
  
      console.log('📤 Sending to backend:', JSON.stringify(taskData, null, 2));
  
      const response = await fetch(`http://localhost:8000/api/v1/users/me/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
  
      console.log('📊 Response status:', response.status);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Response error:', errorData);
        throw new Error(errorData.detail || `API call failed: ${response.status}`);
      }
  
      const newTask = await response.json();
      console.log('✅ Task created:', newTask);
  
      // Remove temp task
      dispatch({ type: 'DELETE_TASK', payload: tempId });
      
      // Add real task
      const finalTask = {
        id: newTask.id.toString(),
        title: newTask.title,
        description: newTask.description || '',
        status: newTask.completed ? 'completed' : 'pending',
        priority: newTask.priority,
        due_date: newTask.due_date,
        project_id: newTask.project_id?.toString(),
        user_id: newTask.user_id.toString(),
        tags: newTask.tags || [],
        created_at: newTask.created_at,
        updated_at: newTask.updated_at,
        completed: newTask.completed || false,
        is_recurring: newTask.is_recurring || false,
        frequency: newTask.frequency,
        recurrence_end_date: newTask.recurrence_end_date,
        reminder_enabled: newTask.reminder_enabled || false,
        reminder_timing: newTask.reminder_timing,
        timezone: newTask.timezone || 'UTC',
      };
      
      dispatch({ type: 'ADD_TASK', payload: finalTask });
  
      if (state.websocketStatus === 'connected') {
        websocketService.send({
          type: 'task_created',
          data: { task: finalTask }
        });
      }
  
      return finalTask;
      
    } catch (error) {
      console.error('❌ Error in addTask:', error);
      
      // Rollback
      dispatch({ type: 'DELETE_TASK', payload: tempId });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to add task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, [isClient, state.websocketStatus]);

  // Function to update a task
  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');

    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'No authentication token' });
      return;
    }

    const currentTask = state.tasks.find(task => task.id === id);
    if (!currentTask) return;

    dispatch({ type: 'UPDATE_TASK', payload: { id, updates } });

    try {
      const updateData = {
        title: updates.title,
        description: updates.description,
        completed: updates.status === 'completed',
        priority: updates.priority,
        due_date: updates.due_date || null,
        project_id: updates.projectId ? parseInt(updates.projectId) : null,
        tag_ids: []
      };

      const response = await fetch(`http://localhost:8000/api/v1/users/me/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }

      const updatedTask = await response.json();

      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: updatedTask } });

      if (state.websocketStatus === 'connected') {
        websocketService.send({
          type: 'task_updated',
          data: { task: updatedTask }
        });
      }
    } catch (error) {
      const rollbackUpdates: Partial<Task> = {};
      for (const key in updates) {
        if (key in currentTask) {
          (rollbackUpdates as any)[key] = currentTask[key as keyof Task];
        }
      }
      dispatch({ type: 'UPDATE_TASK', payload: { id, updates: rollbackUpdates } });
      const errorMessage = error instanceof Error ? error.message : 'Failed to update task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [isClient, state.tasks, state.websocketStatus]);

  // Function to delete a task
  const deleteTask = useCallback(async (id: string) => {
    if (!isClient) return;

    const token = localStorage.getItem('token') || localStorage.getItem('access_token');
    
    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'No authentication token' });
      return;
    }

    const taskToDelete = state.tasks.find(task => task.id === id);
    if (!taskToDelete) return;

    dispatch({ type: 'DELETE_TASK', payload: id });

    try {
      const response = await fetch(`http://localhost:8000/api/v1/users/me/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`);
      }

      if (state.websocketStatus === 'connected') {
        websocketService.send({
          type: 'task_deleted',
          data: { taskId: id }
        });
      }
    } catch (error) {
      if (taskToDelete) {
        dispatch({ type: 'ADD_TASK', payload: taskToDelete });
      }
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete task';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  }, [isClient, state.tasks, state.websocketStatus]);

  // Load tasks on mount
  useEffect(() => {
    if (!isClient) return;
    syncTasks();
  }, [isClient, syncTasks]);

  const contextValue = {
    tasks: state.tasks,
    addTask,
    updateTask,
    deleteTask,
    syncTasks,
    isLoading: state.isLoading,
    websocketStatus: state.websocketStatus,
  };

  return (
    <TaskSyncContext.Provider value={contextValue}>
      {children}
    </TaskSyncContext.Provider>
  );
};

export const useTaskSync = (): TaskSyncContextType => {
  const context = useContext(TaskSyncContext);
  if (!context) {
    throw new Error('useTaskSync must be used within a TaskSyncProvider');
  }
  return context;
};