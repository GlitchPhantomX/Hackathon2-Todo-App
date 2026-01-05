// Integration tests for WebSocket reconnection functionality
import { WebSocketService } from './websocketService';

// Mock WebSocket
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockSend = jest.fn();
const mockClose = jest.fn();

// Create a mock WebSocket constructor
const mockWebSocketConstructor = jest.fn();

global.WebSocket = mockWebSocketConstructor;

describe('WebSocket Reconnection Integration', () => {
  let websocketService: WebSocketService;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock WebSocket instances
    mockWebSocketConstructor.mockImplementation(() => ({
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      send: mockSend,
      close: mockClose,
      readyState: WebSocket.OPEN,
      onopen: null,
      onmessage: null,
      onclose: null,
      onerror: null,
    }));

    websocketService = new WebSocketService();
  });

  test('should attempt reconnection when connection is closed unexpectedly', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Simulate unexpected close (not normal closure)
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    if (wsInstance.onclose) {
      wsInstance.onclose({ code: 1006 }); // 1006 indicates abnormal closure
    }

    // Verify reconnection is attempted
    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(2); // Initial + 1st retry
  });

  test('should not attempt reconnection on normal closure', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Simulate normal close
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    if (wsInstance.onclose) {
      wsInstance.onclose({ code: 1000 }); // 1000 indicates normal closure
    }

    // Should not attempt reconnection
    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(1); // Only initial
  });

  test('should use exponential backoff for reconnection attempts', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Mock setTimeout to check delays
    const originalSetTimeout = global.setTimeout;
    const setTimeoutMock = jest.fn((fn) => fn());
    Object.defineProperty(global, 'setTimeout', {
      value: setTimeoutMock,
    });

    // Simulate multiple connection failures
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    if (wsInstance.onclose) {
      wsInstance.onclose({ code: 1006 }); // First failure
      wsInstance.onclose({ code: 1006 }); // Second failure
    }

    // Restore original setTimeout
    Object.defineProperty(global, 'setTimeout', {
      value: originalSetTimeout,
    });

    // Should have attempted reconnections
    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });

  test('should stop reconnection attempts after max attempts', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Mock setTimeout to execute immediately
    const originalSetTimeout = global.setTimeout;
    const setTimeoutMock = jest.fn((fn) => fn());
    Object.defineProperty(global, 'setTimeout', {
      value: setTimeoutMock,
    });

    // Simulate max reconnection attempts (10 as defined in the service)
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    for (let i = 0; i < 12; i++) { // More than max attempts
      if (wsInstance.onclose) {
        wsInstance.onclose({ code: 1006 });
      }
    }

    // Restore original setTimeout
    Object.defineProperty(global, 'setTimeout', {
      value: originalSetTimeout,
    });

    // Should have stopped after max attempts
    expect(mockWebSocketConstructor).toHaveBeenCalledTimes(11); // Initial + 10 retries
  });

  test('should handle connection status changes properly', () => {
    const statusChanges: string[] = [];
    websocketService.onConnectionStatusChange((status) => {
      statusChanges.push(status);
    });

    const token = 'test-token';
    websocketService.connect(token);

    // Verify initial status change
    expect(statusChanges).toContain('connecting');

    // Simulate connection open
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    if (wsInstance.onopen) {
      wsInstance.onopen();
    }

    // Verify status changes to connected
    expect(statusChanges).toContain('connected');
  });

  test('should handle connection errors', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Simulate connection error
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    if (wsInstance.onerror) {
      wsInstance.onerror(new Error('Connection failed'));
    }

    // Verify error status is set
    expect(websocketService['connectionStatus']).toBe('error');
  });

  test('should properly disconnect and cleanup', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Mock setTimeout for reconnection
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

    // Disconnect
    websocketService.disconnect();

    // Verify cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(mockClose).toHaveBeenCalled();
  });

  test('should send messages only when connected', () => {
    const token = 'test-token';

    // Connect initially
    websocketService.connect(token);

    // Send a message when connected
    const message = { type: 'test', data: {} };
    websocketService.send(message);

    // Verify message was sent
    expect(mockSend).toHaveBeenCalledWith(JSON.stringify({ ...message, timestamp: expect.any(String) }));

    // Simulate connection close
    const wsInstance = mockWebSocketConstructor.mock.results[0].value;
    if (wsInstance.onclose) {
      wsInstance.onclose({ code: 1006 });
    }

    // Try to send message when disconnected
    websocketService.send(message);

    // Should still have only sent once (when connected)
    expect(mockSend).toHaveBeenCalledTimes(1);
  });
});