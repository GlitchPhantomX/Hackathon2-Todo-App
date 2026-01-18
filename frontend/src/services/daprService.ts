/**
 * Dapr Service for Frontend
 *
 * This service provides client-side interaction with Dapr services
 * for the todo app, including state management and service invocation.
 * Note: Since Dapr is typically server-side, this service acts as a
 * proxy to backend endpoints that interact with Dapr.
 */

import axios, { AxiosInstance } from 'axios';

interface DaprConfig {
  daprApiUrl: string;
  appId?: string;
}

class DaprService {
  private http: AxiosInstance;
  private config: DaprConfig;

  constructor(config: DaprConfig) {
    this.config = config;
    this.http = axios.create({
      baseURL: config.daprApiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get state from a Dapr state store
   */
  async getState(storeName: string, key: string): Promise<any> {
    try {
      const response = await this.http.get(`/v1.0/state/${storeName}/${key}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get state ${storeName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Save state to a Dapr state store
   */
  async saveState(storeName: string, key: string, value: any): Promise<void> {
    try {
      const stateItem = {
        key,
        value,
      };

      await this.http.post(`/v1.0/state/${storeName}`, [stateItem]);
    } catch (error) {
      console.error(`Failed to save state ${storeName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Delete state from a Dapr state store
   */
  async deleteState(storeName: string, key: string): Promise<void> {
    try {
      await this.http.delete(`/v1.0/state/${storeName}/${key}`);
    } catch (error) {
      console.error(`Failed to delete state ${storeName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Bulk get state from a Dapr state store
   */
  async bulkGetState(storeName: string, keys: string[]): Promise<Record<string, any>> {
    try {
      const queryParams = keys.map(key => `keys=${encodeURIComponent(key)}`).join('&');
      const response = await this.http.get(`/v1.0/state/${storeName}/bulk?${queryParams}`);

      const result: Record<string, any> = {};
      response.data.forEach((item: any) => {
        result[item.key] = item.data ? item.data : null;
      });

      return result;
    } catch (error) {
      console.error(`Failed to bulk get state from ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Save multiple state values to a Dapr state store
   */
  async bulkSaveState(storeName: string, states: Record<string, any>): Promise<void> {
    try {
      const stateItems = Object.entries(states).map(([key, value]) => ({
        key,
        value,
      }));

      await this.http.post(`/v1.0/state/${storeName}`, stateItems);
    } catch (error) {
      console.error(`Failed to bulk save state to ${storeName}:`, error);
      throw error;
    }
  }

  /**
   * Invoke a method on another Dapr-enabled service
   */
  async invokeService(appId: string, methodName: string, data?: any): Promise<any> {
    try {
      const response = await this.http.post(
        `/v1.0/invoke/${appId}/method/${methodName}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to invoke service ${appId}/${methodName}:`, error);
      throw error;
    }
  }

  /**
   * Publish an event to a Dapr pub/sub component
   */
  async publishEvent(pubsubName: string, topicName: string, data: any): Promise<void> {
    try {
      await this.http.post(`/v1.0/publish/${pubsubName}/${topicName}`, data);
    } catch (error) {
      console.error(`Failed to publish event to ${pubsubName}/${topicName}:`, error);
      throw error;
    }
  }

  /**
   * Get a secret from a Dapr secret store
   */
  async getSecret(storeName: string, key: string): Promise<string | undefined> {
    try {
      const response = await this.http.get(`/v1.0/secrets/${storeName}/${key}`);
      return response.data[key];
    } catch (error) {
      console.error(`Failed to get secret ${storeName}/${key}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple secrets from a Dapr secret store
   */
  async getBulkSecrets(storeName: string, keys?: string[]): Promise<Record<string, string>> {
    try {
      let url = `/v1.0/secrets/${storeName}/bulk`;
      if (keys && keys.length > 0) {
        const queryParams = keys.map(key => `keys=${encodeURIComponent(key)}`).join('&');
        url += `?${queryParams}`;
      }

      const response = await this.http.get(url);
      return response.data;
    } catch (error) {
      console.error(`Failed to get bulk secrets from ${storeName}:`, error);
      throw error;
    }
  }
}

// Specialized functions for the todo app
class TodoAppDaprService extends DaprService {
  constructor(daprApiUrl: string = '/api/dapr') {
    super({ daprApiUrl });
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<any> {
    return this.getState('statestore', `user-preferences:${userId}`);
  }

  async saveUserPreferences(userId: string, preferences: any): Promise<void> {
    await this.saveState('statestore', `user-preferences:${userId}`, preferences);
  }

  // Task reminder operations
  async getTaskReminder(taskId: string): Promise<any> {
    return this.getState('statestore', `task-reminder:${taskId}`);
  }

  async saveTaskReminder(taskId: string, reminderData: any): Promise<void> {
    await this.saveState('statestore', `task-reminder:${taskId}`, reminderData);
  }

  async deleteTaskReminder(taskId: string): Promise<void> {
    await this.deleteState('statestore', `task-reminder:${taskId}`);
  }

  // Recurring task schedule operations
  async getRecurringTaskSchedule(userId: string): Promise<any> {
    return this.getState('statestore', `recurring-schedule:${userId}`);
  }

  async saveRecurringTaskSchedule(userId: string, scheduleData: any): Promise<void> {
    await this.saveState('statestore', `recurring-schedule:${userId}`, scheduleData);
  }

  // Publish task-related events
  async publishTaskEvent(eventType: string, taskId: string, userId: string, payload: any): Promise<void> {
    const eventData = {
      eventType,
      taskId,
      userId,
      payload,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent('kafka-pubsub', 'task-events', eventData);
  }

  async publishReminderEvent(eventType: string, taskId: string, userId: string, payload: any): Promise<void> {
    const eventData = {
      eventType,
      taskId,
      userId,
      payload,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent('kafka-pubsub', 'reminders', eventData);
  }

  async publishRecurringTaskEvent(eventType: string, taskId: string, userId: string, payload: any): Promise<void> {
    const eventData = {
      eventType,
      taskId,
      userId,
      payload,
      timestamp: new Date().toISOString(),
    };

    await this.publishEvent('kafka-pubsub', 'recurring-tasks', eventData);
  }

  // Invoke specialized services
  async invokeNotificationService(notificationData: any): Promise<any> {
    return this.invokeService('notification-service', 'send-notification', notificationData);
  }

  async invokeSchedulerService(scheduleData: any): Promise<any> {
    return this.invokeService('scheduler-service', 'schedule-task', scheduleData);
  }
}

// Singleton instance for the application
const daprService = new TodoAppDaprService();

export { DaprService, TodoAppDaprService, daprService };
export type { DaprConfig };