// src/services/notificationService.ts
// Native WebSocket implementation for notification service

interface NotificationData {
  notification?: any;
  message?: string;
  taskId?: string;
  taskTitle?: string;
  count?: number;
}

class WebSocketNotificationService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionalDisconnect = false;
  private userId: string | null = null;
  private token: string | null = null;
  private isEnabled = false;
  private eventHandlers: { [event: string]: Array<(data: any) => void> } = {};
  private reconnectTimeout: NodeJS.Timeout | null = null;

  async connect(userId: string, token: string): Promise<void> {
    // Check if WebSocket is enabled
    const wsEnabled = process.env.NEXT_PUBLIC_ENABLE_WEBSOCKET === 'true';

    if (!wsEnabled) {
      console.log('ℹ️ WebSocket disabled. Enable with NEXT_PUBLIC_ENABLE_WEBSOCKET=true');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.log('✅ WebSocket already connected');
      return;
    }

    this.userId = userId;
    this.token = token;
    this.isIntentionalDisconnect = false;
    this.isEnabled = true;

    // Force the connection URL to ws://127.0.0.1:8001/ws/notifications/9 as requested
    const fullWsUrl = `ws://127.0.0.1:8001/ws/notifications/9`;

    console.log('🔌 Attempting WebSocket connection to:', fullWsUrl);

    try {
      this.ws = new WebSocket(fullWsUrl);

      this.setupEventListeners();

      // Request notification permission on connection
      if (typeof window !== 'undefined' && "Notification" in window) {
        if (Notification.permission === "default") {
          Notification.requestPermission();
        }
      }
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      this.isEnabled = false;
      if (this.reconnectAttempts < this.maxReconnectAttempts && !this.isIntentionalDisconnect) {
        this.scheduleReconnect(userId, token);
      }
    }
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('✅ WebSocket connected successfully');
      console.log('👤 Joined notification room for user:', this.userId);
      // Console mein log karo jab connection successfully 'Open' ho jaye
      console.log('🔌 Connection opened for user:', this.userId);
      // Show alert when WebSocket connects
      console.log('!!!! WS CONNECTED !!!!');
      console.log('[WS_SUCCESS] WebSocket connection established');
      console.log('WS_CONNECTED_SUCCESSFULLY');
      alert('!!!! WS CONNECTED !!!!');
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const { type, ...payload } = data;

        console.log('📥 Received WebSocket message:', type, payload);

        // Visual confirmation: log the data hitting the frontend
        console.log('--- NOTIFICATION DATA RECEIVED ---', data);

        // Trigger all handlers for this event type
        if (this.eventHandlers[type]) {
          this.eventHandlers[type].forEach(handler => {
            try {
              handler(payload);
            } catch (handlerError) {
              console.error(`Error in ${type} handler:`, handlerError);
            }
          });
        }

        // MOST IMPORTANT: If a message is received, trigger a Native Browser Notification
        if (Notification.permission === 'granted') {
          new Notification(data.title, { body: data.message });
        }
      } catch (parseError) {
        console.error('❌ Error parsing WebSocket message:', parseError, event.data);
      }
    };

    this.ws.onclose = (event) => {
      console.log('ℹ️ WebSocket disconnected:', event.code, event.reason);

      // Don't spam reconnection attempts
      if (!this.isIntentionalDisconnect && this.isEnabled && this.userId && this.token) {
        this.attemptReconnect();
      }
    };

    this.ws.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
    };
  }

  private scheduleReconnect(userId: string, token: string): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      if (this.isEnabled && !this.isIntentionalDisconnect && userId && token) {
        this.connect(userId, token);
      }
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts)); // exponential backoff
  }

  private attemptReconnect(): void {
    if (this.isIntentionalDisconnect || !this.isEnabled || !this.userId || !this.token) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}...`);

      this.scheduleReconnect(this.userId, this.token);
    } else {
      console.log('ℹ️ Max reconnection attempts reached.');
    }
  }

  on(event: string, callback: (data: NotificationData) => void): void {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
  }

  off(event: string, callback: (data: NotificationData) => void): void {
    if (this.eventHandlers[event]) {
      const index = this.eventHandlers[event].indexOf(callback);
      if (index > -1) {
        this.eventHandlers[event].splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type: event, ...data }));
      } catch (error) {
        console.error('❌ Error sending WebSocket message:', error);
      }
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message:', event);
    }
  }

  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket');
    this.isIntentionalDisconnect = true;
    this.isEnabled = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }

    this.userId = null;
    this.token = null;
    this.reconnectAttempts = 0;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const webSocketNotificationService = new WebSocketNotificationService();