// Basic tests for WebSocketService
import { websocketService, WebSocketEventType } from './websocketService';

// Mock WebSocket for testing
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();
const mockSend = jest.fn();
const mockClose = jest.fn();

global.WebSocket = jest.fn(() => ({
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

describe('WebSocketService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should connect to WebSocket with token', () => {
    const token = 'test-token';
    websocketService.connect(token);

    expect(global.WebSocket).toHaveBeenCalledWith(`${process.env.NEXT_PUBLIC_WS_URL}/tasks?token=${token}`);
  });

  test('should send message when connected', () => {
    const mockWs = new WebSocket('ws://test');
    (websocketService as any).ws = mockWs; // Set connected state
    const message = { type: 'test', data: {} };

    websocketService.send(message);

    // The send method now adds a timestamp, so we need to check for the extended message
    const sentMessage = JSON.parse(mockSend.mock.calls[0][0]);
    expect(sentMessage.type).toBe('test');
    expect(sentMessage.data).toEqual({});
    expect(sentMessage.timestamp).toBeDefined();
  });

  test('should not send message when not connected', () => {
    (websocketService as any).ws = null; // No connection
    const message = { type: 'test', data: {} };

    websocketService.send(message);

    expect(mockSend).not.toHaveBeenCalled();
  });

  test('should subscribe and unsubscribe from events', () => {
    const eventType: WebSocketEventType = 'task_created';
    const callback = jest.fn();

    const unsubscribe = websocketService.subscribe(eventType, callback);
    expect((websocketService as any).listeners.get(eventType)?.size).toBe(1);

    unsubscribe();
    // After unsubscribe, the listeners map might delete the entry if it's empty
    const listeners = (websocketService as any).listeners.get(eventType);
    expect(listeners?.size || 0).toBe(0);
  });

  test('should handle incoming messages', () => {
    const eventType: WebSocketEventType = 'task_created';
    const callback = jest.fn();
    const testData = { task: { id: '1', title: 'Test Task' } };
    const message = { type: eventType, data: testData };

    websocketService.subscribe(eventType, callback);

    // Simulate receiving a message
    (websocketService as any).handleMessage(message);

    // Callback should be called with the data
    expect(callback).toHaveBeenCalledWith(testData);
  });

  test('should handle notification_created messages', () => {
    const eventType = 'notification_created';
    const callback = jest.fn();
    const notificationData = {
      notification: { id: 'notif_1', title: 'Test Notification', message: 'Test message' },
      task: { id: '1', title: 'Test Task' },
      timestamp: new Date().toISOString()
    };
    const message = { type: eventType, ...notificationData };

    websocketService.subscribe(eventType, callback);

    // Simulate receiving a notification message
    (websocketService as any).handleMessage(message);

    // Callback should be called with the notification data
    expect(callback).toHaveBeenCalledWith(notificationData);
  });

  test('should disconnect properly', () => {
    // Set up a mock WebSocket instance for the service
    const mockWs = new WebSocket('ws://test');
    (websocketService as any).ws = mockWs;

    websocketService.disconnect();

    expect(mockClose).toHaveBeenCalled();
  });
});