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

    expect(mockSend).toHaveBeenCalledWith(JSON.stringify(message));
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
    expect((websocketService as any).listeners.get(eventType).size).toBe(1);

    unsubscribe();
    expect((websocketService as any).listeners.get(eventType)?.size).toBe(0);
  });

  test('should handle incoming messages', () => {
    const eventType: WebSocketEventType = 'task_created';
    const callback = jest.fn();
    const testData = { task: { id: '1', title: 'Test Task' } };
    const message = { type: eventType, data: testData };

    websocketService.subscribe(eventType, callback);

    // Simulate receiving a message
    (websocketService as any).handleMessage(message);

    expect(callback).toHaveBeenCalledWith(testData);
  });

  test('should disconnect properly', () => {
    websocketService.disconnect();

    expect(mockClose).toHaveBeenCalled();
  });
});