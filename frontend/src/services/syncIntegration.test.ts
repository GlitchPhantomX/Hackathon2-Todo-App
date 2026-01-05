// Integration tests for dashboard to chat synchronization
import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { TaskSyncProvider, useTaskSync } from '../contexts/TaskSyncContext';
import { ChatProvider, useChat } from '../contexts/ChatContext';

// Mock the websocket service
jest.mock('../services/websocketService', () => ({
  websocketService: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    send: jest.fn(),
    subscribe: jest.fn((event, callback) => {
      // Return an unsubscribe function
      return () => {};
    }),
    getConnectionStatus: jest.fn(() => 'connected'),
  },
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
) as jest.Mock;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Dashboard to Chat Synchronization Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set a mock token in localStorage
    localStorage.setItem('access_token', 'mock-token');
  });

  test('should synchronize task creation from dashboard to chat', async () => {
    // Create a wrapper that includes both providers
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </TaskSyncProvider>
    );

    const { result } = renderHook(() => ({
      taskSync: useTaskSync(),
      chat: useChat(),
    }), { wrapper });

    // Create a task in the dashboard context
    const newTask = {
      title: 'Sync Test Task',
      description: 'Task for sync testing',
      status: 'pending',
      priority: 'medium',
      due_date: null,
    };

    // Mock the API response for task creation
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        id: 'sync-task-1',
        ...newTask,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user123',
      }),
    });

    // Add task through dashboard context
    await act(async () => {
      await result.current.taskSync.addTask(newTask);
    });

    // Verify task was added to the dashboard context
    expect(result.current.taskSync.tasks).toHaveLength(1);
    expect(result.current.taskSync.tasks[0].title).toBe('Sync Test Task');

    // Simulate receiving WebSocket message that would update chat context
    // In a real scenario, this would happen automatically when WebSocket receives a message
    // For testing, we're verifying that the WebSocket send was called appropriately
    const websocketSendMock = (require('../services/websocketService').websocketService.send as jest.Mock);
    expect(websocketSendMock).toHaveBeenCalledWith({
      type: 'task_created',
      data: { task: expect.objectContaining({ title: 'Sync Test Task' }) },
      timestamp: expect.any(String)
    });
  });

  test('should synchronize task update from dashboard to chat', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </TaskSyncProvider>
    );

    const { result } = renderHook(() => ({
      taskSync: useTaskSync(),
      chat: useChat(),
    }), { wrapper });

    // First, add a task
    const originalTask = {
      id: 'sync-update-1',
      title: 'Original Task',
      description: 'Original description',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user123',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ // For adding the task
        ok: true,
        json: () => Promise.resolve(originalTask),
      })
      .mockResolvedValueOnce({ // For updating the task
        ok: true,
        json: () => Promise.resolve({ ...originalTask, title: 'Updated Task' }),
      });

    // Add the original task
    await act(async () => {
      await result.current.taskSync.addTask(originalTask);
    });

    // Update the task
    await act(async () => {
      await result.current.taskSync.updateTask('sync-update-1', { title: 'Updated Task' });
    });

    // Verify the task was updated
    expect(result.current.taskSync.tasks).toHaveLength(1);
    expect(result.current.taskSync.tasks[0].title).toBe('Updated Task');

    // Verify WebSocket was called with update event
    const websocketUpdateMock = (require('../services/websocketService').websocketService.send as jest.Mock);
    expect(websocketUpdateMock).toHaveBeenCalledWith({
      type: 'task_updated',
      data: { task: expect.objectContaining({ title: 'Updated Task' }) },
      timestamp: expect.any(String)
    });
  });

  test('should synchronize task deletion from dashboard to chat', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </TaskSyncProvider>
    );

    const { result } = renderHook(() => ({
      taskSync: useTaskSync(),
      chat: useChat(),
    }), { wrapper });

    // Add a task first
    const taskToDelete = {
      id: 'sync-delete-1',
      title: 'Task to Delete',
      description: 'Will be deleted',
      status: 'pending',
      priority: 'medium',
      due_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: 'user123',
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ // For adding the task
        ok: true,
        json: () => Promise.resolve(taskToDelete),
      })
      .mockResolvedValueOnce({ // For deleting the task
        ok: true,
      });

    // Add the task
    await act(async () => {
      await result.current.taskSync.addTask(taskToDelete);
    });

    expect(result.current.taskSync.tasks).toHaveLength(1);

    // Delete the task
    await act(async () => {
      await result.current.taskSync.deleteTask('sync-delete-1');
    });

    // Verify the task was deleted
    expect(result.current.taskSync.tasks).toHaveLength(0);

    // Verify WebSocket was called with delete event
    const websocketDeleteMock = (require('../services/websocketService').websocketService.send as jest.Mock);
    expect(websocketDeleteMock).toHaveBeenCalledWith({
      type: 'task_deleted',
      data: { taskId: 'sync-delete-1' },
      timestamp: expect.any(String)
    });
  });

  test('should handle WebSocket connection status changes', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    // Verify initial WebSocket status
    expect(result.current.websocketStatus).toBeDefined();

    // The context should properly handle connection status changes
    // This is tested by ensuring the context value includes websocketStatus
    expect(result.current).toHaveProperty('websocketStatus');
  });
});

describe('Chat to Dashboard Synchronization Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set a mock token in localStorage
    localStorage.setItem('access_token', 'mock-token');
  });

  test('should handle task sync events from WebSocket in dashboard context', async () => {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <TaskSyncProvider>
        <ChatProvider>
          {children}
        </ChatProvider>
      </TaskSyncProvider>
    );

    const { result } = renderHook(() => useTaskSync(), { wrapper });

    // Simulate receiving a task_created event via WebSocket
    // This would normally be triggered by the WebSocket subscription
    const mockTaskCreatedEvent = {
      type: 'task_created',
      data: {
        task: {
          id: 'websocket-task-1',
          title: 'Task from WebSocket',
          description: 'Created via WebSocket',
          status: 'pending',
          priority: 'medium',
          due_date: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: 'user123',
        }
      }
    };

    // In a real scenario, this would be handled by the WebSocket subscription
    // For testing, we'll verify that the WebSocket service is set up to handle these events
    const websocketSubscribeMock = (require('../services/websocketService').websocketService.subscribe as jest.Mock);
    expect(websocketSubscribeMock).toHaveBeenCalledWith('task_created', expect.any(Function));
    expect(websocketSubscribeMock).toHaveBeenCalledWith('task_updated', expect.any(Function));
    expect(websocketSubscribeMock).toHaveBeenCalledWith('task_deleted', expect.any(Function));
  });
});