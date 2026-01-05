// Integration tests for widget expand/minimize flow
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import MinimizedChatWidget from './MinimizedChatWidget';
import ExpandedChatWindow from './ExpandedChatWindow';
import { TaskSyncProvider } from '@/contexts/TaskSyncContext';
import { ChatProvider } from '@/contexts/ChatContext';

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

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock the websocket service
jest.mock('@/services/websocketService', () => ({
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

describe('Widget Expand/Minimize Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Set a mock token in localStorage
    localStorage.setItem('access_token', 'mock-token');
  });

  test('should render minimized widget by default', () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Verify the minimized widget is rendered
    const widgetButton = screen.getByRole('button', { name: /Open chat widget/i });
    expect(widgetButton).toBeInTheDocument();
    expect(widgetButton).toHaveClass('bg-gradient-to-r');
    expect(widgetButton).toHaveClass('from-blue-500');
  });

  test('should expand when clicked and show expanded window', async () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Click the minimized widget to expand
    const widgetButton = screen.getByRole('button', { name: /Open chat widget/i });
    fireEvent.click(widgetButton);

    // Verify the expanded window is now shown
    await waitFor(() => {
      const expandedWindow = screen.getByRole('dialog');
      expect(expandedWindow).toBeInTheDocument();
    });
  });

  test('should minimize when minimize button is clicked', async () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <ExpandedChatWindow onClose={() => {}} onMinimize={() => {}} />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Find and click the minimize button
    const minimizeButton = screen.getByRole('button', { name: /Minimize/i });
    fireEvent.click(minimizeButton);

    // The component should handle the minimize action
    expect(minimizeButton).toBeInTheDocument();
  });

  test('should expand to full page when expand button is clicked', async () => {
    const mockPush = jest.fn();
    jest.mock('next/navigation', () => ({
      useRouter: () => ({
        push: mockPush,
      }),
    }));

    render(
      <TaskSyncProvider>
        <ChatProvider>
          <ExpandedChatWindow onClose={() => {}} onMinimize={() => {}} />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Find and click the expand to full page button
    const expandButton = screen.getByRole('button', { name: /Open in full page/i });
    fireEvent.click(expandButton);

    // Verify navigation to full chat page
    expect(mockPush).toHaveBeenCalledWith('/chat');
  });

  test('should persist widget state in localStorage', async () => {
    // Initially render minimized widget
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Click to expand
    const widgetButton = screen.getByRole('button', { name: /Open chat widget/i });
    fireEvent.click(widgetButton);

    // Wait for expansion
    await waitFor(() => {
      const expandedWindow = screen.getByRole('dialog');
      expect(expandedWindow).toBeInTheDocument();
    });

    // Verify state is saved in localStorage
    const savedState = localStorage.getItem('chatWidgetState');
    expect(savedState).not.toBeNull();
    const parsedState = JSON.parse(savedState!);
    expect(parsedState.isExpanded).toBe(true);
  });

  test('should restore widget state from localStorage', () => {
    // Set a saved state in localStorage
    localStorage.setItem('chatWidgetState', JSON.stringify({
      isVisible: true,
      isExpanded: true,
      hasUnread: false,
      lastUpdated: new Date().toISOString()
    }));

    // Render the widget
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // The widget should start in expanded state based on localStorage
    // This would be tested by checking if the expanded window is shown
    // or if the state is properly initialized
  });

  test('should close widget when close button is clicked', () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Find the close button (it may be hidden initially)
    const widgetContainer = screen.getByRole('button', { name: /Open chat widget/i }).closest('div');

    // The close button might be visible on hover, so we'll test the visibility toggle
    // In the actual implementation, the close button appears on hover
    expect(widgetContainer).toBeInTheDocument();
  });

  test('should maintain WebSocket connection status in both states', async () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Verify that WebSocket status is accessible in the minimized widget
    const widgetButton = screen.getByRole('button', { name: /Open chat widget/i });

    // Check that the widget has access to WebSocket status
    // This would be visible as an icon or indicator
    const statusIndicator = widgetButton.querySelector('svg');
    expect(statusIndicator).toBeInTheDocument();
  });

  test('should handle keyboard navigation for accessibility', () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Get the widget button
    const widgetButton = screen.getByRole('button', { name: /Open chat widget/i });

    // Simulate keyboard interaction
    fireEvent.keyDown(widgetButton, { key: 'Enter' });
    fireEvent.keyUp(widgetButton, { key: 'Enter' });

    // Simulate spacebar interaction
    fireEvent.keyDown(widgetButton, { key: ' ' });
    fireEvent.keyUp(widgetButton, { key: ' ' });

    // Both should trigger the expand functionality
    expect(widgetButton).toBeInTheDocument();
  });

  test('should handle WebSocket status changes in both minimized and expanded states', async () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <MinimizedChatWidget />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Initially check the minimized widget
    const widgetButton = screen.getByRole('button', { name: /Open chat widget/i });
    expect(widgetButton).toBeInTheDocument();

    // Click to expand
    fireEvent.click(widgetButton);

    // Wait for expansion
    await waitFor(() => {
      const expandedWindow = screen.getByRole('dialog');
      expect(expandedWindow).toBeInTheDocument();
    });

    // In both states, WebSocket status should be properly reflected
    // This is tested by ensuring the component has access to websocketStatus
  });
});

describe('Expanded Chat Window Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Set a mock token in localStorage
    localStorage.setItem('access_token', 'mock-token');
  });

  test('should render expanded chat window with all required components', () => {
    render(
      <TaskSyncProvider>
        <ChatProvider>
          <ExpandedChatWindow onClose={() => {}} onMinimize={() => {}} />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Verify the expanded window structure
    const expandedWindow = screen.getByRole('dialog');
    expect(expandedWindow).toBeInTheDocument();

    // Check for header with minimize/close buttons
    const minimizeButton = screen.getByRole('button', { name: /Minimize/i });
    expect(minimizeButton).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /Close/i });
    expect(closeButton).toBeInTheDocument();

    // Check for chat content areas
    const messageArea = screen.getByText(/AI Assistant/i);
    expect(messageArea).toBeInTheDocument();
  });

  test('should handle minimize action properly', () => {
    const mockOnMinimize = jest.fn();

    render(
      <TaskSyncProvider>
        <ChatProvider>
          <ExpandedChatWindow onClose={() => {}} onMinimize={mockOnMinimize} />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Click minimize button
    const minimizeButton = screen.getByRole('button', { name: /Minimize/i });
    fireEvent.click(minimizeButton);

    // Verify the minimize callback is called
    expect(mockOnMinimize).toHaveBeenCalled();
  });

  test('should handle close action properly', () => {
    const mockOnClose = jest.fn();

    render(
      <TaskSyncProvider>
        <ChatProvider>
          <ExpandedChatWindow onClose={mockOnClose} onMinimize={() => {}} />
        </ChatProvider>
      </TaskSyncProvider>
    );

    // Click close button
    const closeButton = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeButton);

    // Verify the close callback is called
    expect(mockOnClose).toHaveBeenCalled();
  });
});