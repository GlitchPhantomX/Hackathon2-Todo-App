import { Notification } from '@/types/types';

/**
 * WebSocket-based notification service for real-time notifications
 */
class WebSocketNotificationService {
  private ws: WebSocket | null = null;
  private userId: string | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // 1 second
  private eventHandlers: { [key: string]: Array<(data: any) => void> } = {};

  /**
   * Connect to the WebSocket notification endpoint
   */
  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('WebSocket is not available in server environment'));
        return;
      }

      // Close existing connection if any
      this.disconnect();

      this.userId = userId;

      // Get API base URL from environment or use default
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'ws://localhost:8000';
      const wsUrl = `${apiBaseUrl.replace('http', 'ws')}/ws/notifications/${userId}?token=${token}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Connected to notification WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket connection closed:', event.code, event.reason);
          this.isConnected = false;
          this.ws = null;

          // Attempt to reconnect if it wasn't a manual close
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
              this.connect(userId, token).catch(err => {
                console.error('Reconnection failed:', err);
              });
            }, this.reconnectDelay * this.reconnectAttempts); // Exponential backoff
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnectedToWebSocket(): boolean {
    return this.isConnected && this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Send a message to the WebSocket
   */
  sendMessage(message: any): void {
    if (!this.isConnectedToWebSocket()) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
    }
  }

  /**
   * Subscribe to notification updates
   */
  subscribeToNotifications(): void {
    if (this.isConnectedToWebSocket()) {
      this.sendMessage({
        type: 'subscribe_to_notifications'
      });
    }
  }

  /**
   * Get unread notification count
   */
  getUnreadCount(): void {
    if (this.isConnectedToWebSocket()) {
      this.sendMessage({
        type: 'get_unread_count'
      });
    }
  }

  /**
   * Send ping to keep connection alive
   */
  ping(): void {
    if (this.isConnectedToWebSocket()) {
      this.sendMessage({
        type: 'ping'
      });
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: any): void {
    const { type, ...payload } = data;

    // Trigger event handlers for this message type
    if (this.eventHandlers[type]) {
      this.eventHandlers[type].forEach(handler => {
        try {
          handler(payload);
        } catch (error) {
          console.error(`Error in ${type} event handler:`, error);
        }
      });
    }

    // Handle specific message types
    switch (type) {
      case 'new_notification':
        this.handleNewNotification(payload.notification);
        break;
      case 'unread_count':
        this.handleUnreadCount(payload.count);
        break;
      case 'pong':
        // Ping/pong response - connection is alive
        break;
      case 'auth_success':
        console.log('WebSocket authentication successful');
        this.subscribeToNotifications(); // Subscribe after successful auth
        break;
      case 'auth_error':
        console.error('WebSocket authentication error:', payload.message);
        break;
      case 'error':
        console.error('WebSocket error:', payload.message);
        break;
      default:
        console.log('Received unknown message type:', type, payload);
    }
  }

  /**
   * Handle new notification
   */
  private handleNewNotification(notification: Notification): void {
    console.log('New notification received:', notification);
    // Update local state or trigger UI updates as needed
  }

  /**
   * Handle unread count update
   */
  private handleUnreadCount(count: number): void {
    console.log('Unread notification count:', count);
    // Update local state or trigger UI updates as needed
  }

  /**
   * Add event listener for a specific event type
   */
  on(eventType: string, handler: (data: any) => void): void {
    if (!this.eventHandlers[eventType]) {
      this.eventHandlers[eventType] = [];
    }
    this.eventHandlers[eventType].push(handler);
  }

  /**
   * Remove event listener for a specific event type
   */
  off(eventType: string, handler: (data: any) => void): void {
    if (this.eventHandlers[eventType]) {
      const index = this.eventHandlers[eventType].indexOf(handler);
      if (index > -1) {
        this.eventHandlers[eventType].splice(index, 1);
      }
    }
  }
}

// Create a singleton instance
export const webSocketNotificationService = new WebSocketNotificationService();

export default webSocketNotificationService;