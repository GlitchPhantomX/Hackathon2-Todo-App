// import { Task } from '../types/chat.types';

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private token: string | null = null;
  private connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' = 'disconnected';
  private onStatusChange: ((status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) | null = null;

  /**
   * Connect to WebSocket server with JWT token
   */
  connect(token: string) {
    this.token = token;
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/tasks?token=${token}`;

    // Clear any existing connection
    this.disconnect();

    this.connectionStatus = 'connecting';
    this.notifyStatusChange();

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected');
        this.reconnectAttempts = 0; // Reset attempts on successful connection
        this.connectionStatus = 'connected';
        this.notifyStatusChange();
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          console.error('Raw message:', event.data);
        }
      };

      this.ws.onclose = (event) => {
        console.log('⚠️ WebSocket disconnected:', event.code, event.reason);
        this.connectionStatus = 'disconnected';
        this.notifyStatusChange();

        // Only attempt reconnection if the connection was closed unexpectedly (not by user)
        if (event.code !== 1000) { // 1000 means normal closure
          this.attemptReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        this.connectionStatus = 'error';
        this.notifyStatusChange();
      };
    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.connectionStatus = 'error';
      this.notifyStatusChange();
      this.attemptReconnect();
    }
  }

  /**
   * Set a callback to be notified of connection status changes
   */
  onConnectionStatusChange(callback: (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void) {
    this.onStatusChange = callback;
  }

  /**
   * Notify listeners of connection status changes
   */
  private notifyStatusChange() {
    if (this.onStatusChange) {
      this.onStatusChange(this.connectionStatus);
    }
  }

  /**
   * Attempt to reconnect to WebSocket server
   */
  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
      this.reconnectAttempts++;
      // Exponential backoff with max 30s and some randomization to prevent thundering herd
      const baseDelay = 1000 * Math.pow(2, this.reconnectAttempts);
      const maxDelay = 30000;
      const randomFactor = 0.8 + Math.random() * 0.4; // Random factor between 0.8 and 1.2
      const delay = Math.min(baseDelay * randomFactor, maxDelay);

      console.log(`⚠️ Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${Math.round(delay)}ms`);

      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      this.reconnectTimeout = setTimeout(() => {
        this.connect(this.token!);
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached, giving up');
      this.connectionStatus = 'error';
      this.notifyStatusChange();
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: any) {
    const { type, data, timestamp } = message;

    // Calculate and log latency if timestamp is provided
    if (timestamp) {
      const latency = Date.now() - new Date(timestamp).getTime();
      if (latency > 1000) {
        console.warn(`⚠️ High latency detected: ${latency}ms for message type: ${type}`);
      } else {
        console.log(`✅ Message latency: ${latency}ms for type: ${type}`);
      }
    }

    // Notify all listeners for this event type
    const listeners = this.listeners.get(type);
    if (listeners) {
      // Use Promise.allSettled to handle all listeners concurrently without blocking
      const promises = Array.from(listeners).map(listener => {
        return Promise.resolve().then(() => listener(data)).catch(error => {
          console.error(`Error in ${type} listener:`, error);
        });
      });

      // Execute all listeners concurrently
      Promise.allSettled(promises).catch(error => {
        console.error('Error executing listeners:', error);
      });
    }

    // Handle specific task sync events
    switch (type) {
      case 'task_created':
        this.handleTaskCreated(data);
        break;
      case 'task_updated':
        this.handleTaskUpdated(data);
        break;
      case 'task_deleted':
        this.handleTaskDeleted(data);
        break;
      case 'sync_response':
        this.handleSyncResponse(data);
        break;
      default:
        console.log('Received unknown message type:', type);
    }
  }

  /**
   * Handle task creation event
   */
  private handleTaskCreated(data: any) {
    console.log('Task created:', data.task);
    // Additional logic can be added here if needed
  }

  /**
   * Handle task update event
   */
  private handleTaskUpdated(data: any) {
    console.log('Task updated:', data.task);
    // Additional logic can be added here if needed
  }

  /**
   * Handle task deletion event
   */
  private handleTaskDeleted(data: any) {
    console.log('Task deleted:', data.taskId);
    // Additional logic can be added here if needed
  }

  /**
   * Handle sync response
   */
  private handleSyncResponse(data: any) {
    console.log('Sync response received:', data);
    // Additional logic can be added here if needed
  }

  /**
   * Subscribe to a specific event type
   */
  subscribe(eventType: string, callback: (data: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)?.add(callback);

    return () => this.unsubscribe(eventType, callback); // Return unsubscribe function
  }

  /**
   * Unsubscribe from a specific event type
   */
  unsubscribe(eventType: string, callback: (data: any) => void) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Send a message to the WebSocket server
   */
  send(message: any) {
    // Add timestamp for performance tracking
    const messageWithTimestamp = {
      ...message,
      timestamp: new Date().toISOString()
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(messageWithTimestamp));
        console.log('📤 Sent message:', message.type, 'at', messageWithTimestamp.timestamp);
      } catch (error) {
        console.error('❌ Error sending message:', error);
        console.error('Message:', messageWithTimestamp);
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', message);
      // Attempt to reconnect if not already connecting
      if (this.connectionStatus !== 'connecting' && this.token) {
        console.log('🔄 Attempting to reconnect...');
        this.connect(this.token);
      }
    }
  }

  /**
   * Close the WebSocket connection
   */
  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Normal closure by client'); // 1000 indicates normal closure
      this.ws = null;
    }

    this.connectionStatus = 'disconnected';
    this.notifyStatusChange();
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' | 'error' {
    return this.connectionStatus;
  }

  /**
   * Request synchronization of tasks
   */
  requestSync() {
    if (this.isConnected()) {
      this.send({ type: 'sync_request', data: {} });
    } else {
      console.warn('Cannot request sync, WebSocket not connected');
    }
  }
}

// Create a singleton instance
export const websocketService = new WebSocketService();

// Export types for events
export type WebSocketEventType =
  | 'task_created'
  | 'task_updated'
  | 'task_deleted'
  | 'task_status_changed'
  | 'sync_request'
  | 'sync_response';

export type WebSocketMessage = {
  type: WebSocketEventType;
  data: any;
  timestamp?: string;
};