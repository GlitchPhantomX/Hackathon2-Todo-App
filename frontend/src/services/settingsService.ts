import api from './apiService';
import { UserSettings } from '../types/settings.types';

// Helper function to convert backend settings format to frontend format
const convertBackendSettingsToFrontend = (backendSettings: any): UserSettings => {
  return {
    id: backendSettings.id,
    user_id: backendSettings.user_id,
    appearance: {
      theme: backendSettings.appearance_theme,
      accent_color: backendSettings.appearance_accent_color,
      font_size: backendSettings.appearance_font_size,
      language: backendSettings.appearance_language,
      date_format: backendSettings.appearance_date_format,
      time_format: backendSettings.appearance_time_format,
    },
    notifications: {
      enabled: backendSettings.notifications_enabled,
      sound_enabled: backendSettings.notifications_sound_enabled,
      email_notifications: backendSettings.notifications_email_notifications,
      push_notifications: backendSettings.notifications_push_notifications,
      task_reminders: backendSettings.notifications_task_reminders,
      daily_digest: backendSettings.notifications_daily_digest,
    },
    task_defaults: {
      default_priority: backendSettings.task_defaults_default_priority,
      default_project_id: backendSettings.task_defaults_default_project_id,
      default_view: backendSettings.task_defaults_default_view,
      items_per_page: backendSettings.task_defaults_items_per_page,
      auto_assign_today: backendSettings.task_defaults_auto_assign_today,
    },
    privacy: {
      data_retention_days: backendSettings.privacy_data_retention_days,
      export_data_enabled: backendSettings.privacy_export_data_enabled,
      analytics_enabled: backendSettings.privacy_analytics_enabled,
      profile_visible: backendSettings.privacy_profile_visible,
    },
    integrations: {
      calendar_connected: backendSettings.integrations_calendar_connected,
      email_connected: backendSettings.integrations_email_connected,
      webhooks_enabled: backendSettings.integrations_webhooks_enabled,
      connected_services: JSON.parse(backendSettings.integrations_connected_services || '[]'),
    },
    created_at: backendSettings.created_at || new Date().toISOString(),
    updated_at: backendSettings.updated_at,
  };
};

// Helper function to convert frontend settings format to backend format
const convertFrontendSettingsToBackend = (frontendSettings: Partial<UserSettings>) => {
  const backendFormat: any = {};

  if (frontendSettings.appearance) {
    if (frontendSettings.appearance.theme !== undefined) {
      backendFormat.appearance_theme = frontendSettings.appearance.theme;
    }
    if (frontendSettings.appearance.accent_color !== undefined) {
      backendFormat.appearance_accent_color = frontendSettings.appearance.accent_color;
    }
    if (frontendSettings.appearance.font_size !== undefined) {
      backendFormat.appearance_font_size = frontendSettings.appearance.font_size;
    }
    if (frontendSettings.appearance.language !== undefined) {
      backendFormat.appearance_language = frontendSettings.appearance.language;
    }
    if (frontendSettings.appearance.date_format !== undefined) {
      backendFormat.appearance_date_format = frontendSettings.appearance.date_format;
    }
    if (frontendSettings.appearance.time_format !== undefined) {
      backendFormat.appearance_time_format = frontendSettings.appearance.time_format;
    }
  }

  if (frontendSettings.notifications) {
    if (frontendSettings.notifications.enabled !== undefined) {
      backendFormat.notifications_enabled = frontendSettings.notifications.enabled;
    }
    if (frontendSettings.notifications.sound_enabled !== undefined) {
      backendFormat.notifications_sound_enabled = frontendSettings.notifications.sound_enabled;
    }
    if (frontendSettings.notifications.email_notifications !== undefined) {
      backendFormat.notifications_email_notifications = frontendSettings.notifications.email_notifications;
    }
    if (frontendSettings.notifications.push_notifications !== undefined) {
      backendFormat.notifications_push_notifications = frontendSettings.notifications.push_notifications;
    }
    if (frontendSettings.notifications.task_reminders !== undefined) {
      backendFormat.notifications_task_reminders = frontendSettings.notifications.task_reminders;
    }
    if (frontendSettings.notifications.daily_digest !== undefined) {
      backendFormat.notifications_daily_digest = frontendSettings.notifications.daily_digest;
    }
  }

  if (frontendSettings.task_defaults) {
    if (frontendSettings.task_defaults.default_priority !== undefined) {
      backendFormat.task_defaults_default_priority = frontendSettings.task_defaults.default_priority;
    }
    if (frontendSettings.task_defaults.default_project_id !== undefined) {
      backendFormat.task_defaults_default_project_id = frontendSettings.task_defaults.default_project_id;
    }
    if (frontendSettings.task_defaults.default_view !== undefined) {
      backendFormat.task_defaults_default_view = frontendSettings.task_defaults.default_view;
    }
    if (frontendSettings.task_defaults.items_per_page !== undefined) {
      backendFormat.task_defaults_items_per_page = frontendSettings.task_defaults.items_per_page;
    }
    if (frontendSettings.task_defaults.auto_assign_today !== undefined) {
      backendFormat.task_defaults_auto_assign_today = frontendSettings.task_defaults.auto_assign_today;
    }
  }

  if (frontendSettings.privacy) {
    if (frontendSettings.privacy.data_retention_days !== undefined) {
      backendFormat.privacy_data_retention_days = frontendSettings.privacy.data_retention_days;
    }
    if (frontendSettings.privacy.export_data_enabled !== undefined) {
      backendFormat.privacy_export_data_enabled = frontendSettings.privacy.export_data_enabled;
    }
    if (frontendSettings.privacy.analytics_enabled !== undefined) {
      backendFormat.privacy_analytics_enabled = frontendSettings.privacy.analytics_enabled;
    }
    if (frontendSettings.privacy.profile_visible !== undefined) {
      backendFormat.privacy_profile_visible = frontendSettings.privacy.profile_visible;
    }
  }

  if (frontendSettings.integrations) {
    if (frontendSettings.integrations.calendar_connected !== undefined) {
      backendFormat.integrations_calendar_connected = frontendSettings.integrations.calendar_connected;
    }
    if (frontendSettings.integrations.email_connected !== undefined) {
      backendFormat.integrations_email_connected = frontendSettings.integrations.email_connected;
    }
    if (frontendSettings.integrations.webhooks_enabled !== undefined) {
      backendFormat.integrations_webhooks_enabled = frontendSettings.integrations.webhooks_enabled;
    }
    if (frontendSettings.integrations.connected_services !== undefined) {
      backendFormat.integrations_connected_services = JSON.stringify(frontendSettings.integrations.connected_services);
    }
  }

  return backendFormat;
};

import logging from '@/utils/logging';
import CircuitBreaker, { createCircuitBreaker } from '@/utils/CircuitBreaker';

// Create circuit breaker for settings service
const settingsCircuitBreaker = createCircuitBreaker({
  failureThreshold: 3,
  timeoutMs: 30000,
  successThreshold: 2
});

// Helper function for circuit breaker with retry logic (copy from apiService to avoid circular dependency)
const withCircuitBreakerAndRetry = async <T>(
  requestFn: () => Promise<T>,
  circuitBreaker: CircuitBreaker,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  const correlationId = logging.generateCorrelationId();

  // First check if the circuit breaker is open
  if (circuitBreaker.getState() === 'OPEN') {
    logging.warn('Circuit breaker is OPEN, skipping request', {
      correlationId,
      circuitState: circuitBreaker.getState()
    });
    throw new Error('Service temporarily unavailable (circuit breaker is open)');
  }

  // Wrap the request function with circuit breaker
  const wrappedRequest = () => circuitBreaker.call(requestFn);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await wrappedRequest();
    } catch (error: any) {
      // Log the error with correlation ID
      logging.error(`Settings API request failed (attempt ${attempt + 1}/${maxRetries + 1})`, {
        correlationId,
        attempt: attempt + 1,
        maxRetries: maxRetries + 1,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        circuitState: circuitBreaker.getState()
      }, error);

      // Don't retry on 4xx errors (client errors)
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // Don't retry if max attempts reached
      if (attempt === maxRetries) {
        logging.error(`Max retries reached for settings API request`, {
          correlationId,
          url: error.config?.url,
          method: error.config?.method,
          circuitState: circuitBreaker.getState()
        });
        throw error;
      }

      // Wait before retrying
      const waitTime = delay * Math.pow(2, attempt); // Exponential backoff
      logging.info(`Waiting ${waitTime}ms before retrying settings API request`, {
        correlationId,
        attempt: attempt + 1,
        waitTime,
        circuitState: circuitBreaker.getState()
      });
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  // This should not be reached due to the throw in the loop, but added for type safety
  throw new Error(`Settings API request failed after ${maxRetries + 1} attempts`);
};

export const settingsService = {
  // Get user settings
  getSettings: async (): Promise<UserSettings> => {
    return withCircuitBreakerAndRetry(async () => {
      const response = await api.get('/usersettings');  // ✅ Changed from '/api/v1/usersettings'
      return convertBackendSettingsToFrontend(response.data);
    }, settingsCircuitBreaker);
  },

  // Update user settings
  updateSettings: async (settings: Partial<UserSettings>): Promise<UserSettings> => {
    return withCircuitBreakerAndRetry(async () => {
      const backendData = convertFrontendSettingsToBackend(settings);
      const response = await api.put('/usersettings', backendData);  // ✅ Changed from '/api/v1/usersettings'
      return convertBackendSettingsToFrontend(response.data);
    }, settingsCircuitBreaker);
  },
};