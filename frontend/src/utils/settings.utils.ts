// Utility functions for settings management

/**
 * Validates appearance settings
 */
export const validateAppearanceSettings = (settings: any) => {
  const errors: string[] = [];

  if (settings.theme && !['light', 'dark', 'system'].includes(settings.theme)) {
    errors.push('Theme must be "light", "dark", or "system"');
  }

  if (settings.accent_color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(settings.accent_color)) {
    errors.push('Accent color must be a valid hex code');
  }

  if (settings.font_size && !['S', 'M', 'L'].includes(settings.font_size)) {
    errors.push('Font size must be "S", "M", or "L"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates notification settings
 */
export const validateNotificationSettings = (settings: any) => {
  const errors: string[] = [];

  if (typeof settings.enabled !== 'undefined' && typeof settings.enabled !== 'boolean') {
    errors.push('Enabled must be a boolean');
  }

  if (typeof settings.sound_enabled !== 'undefined' && typeof settings.sound_enabled !== 'boolean') {
    errors.push('Sound enabled must be a boolean');
  }

  if (typeof settings.email_notifications !== 'undefined' && typeof settings.email_notifications !== 'boolean') {
    errors.push('Email notifications must be a boolean');
  }

  if (typeof settings.push_notifications !== 'undefined' && typeof settings.push_notifications !== 'boolean') {
    errors.push('Push notifications must be a boolean');
  }

  if (typeof settings.task_reminders !== 'undefined' && typeof settings.task_reminders !== 'boolean') {
    errors.push('Task reminders must be a boolean');
  }

  if (typeof settings.daily_digest !== 'undefined' && typeof settings.daily_digest !== 'boolean') {
    errors.push('Daily digest must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates task default settings
 */
export const validateTaskDefaultSettings = (settings: any) => {
  const errors: string[] = [];

  if (settings.default_priority && !['low', 'medium', 'high'].includes(settings.default_priority)) {
    errors.push('Default priority must be "low", "medium", or "high"');
  }

  if (settings.default_view && !['list', 'grid'].includes(settings.default_view)) {
    errors.push('Default view must be "list" or "grid"');
  }

  if (settings.items_per_page && (settings.items_per_page < 1 || settings.items_per_page > 100)) {
    errors.push('Items per page must be between 1 and 100');
  }

  if (typeof settings.auto_assign_today !== 'undefined' && typeof settings.auto_assign_today !== 'boolean') {
    errors.push('Auto assign today must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates privacy settings
 */
export const validatePrivacySettings = (settings: any) => {
  const errors: string[] = [];

  if (settings.data_retention_days && (settings.data_retention_days < 0 || settings.data_retention_days > 365)) {
    errors.push('Data retention days must be between 0 and 365');
  }

  if (typeof settings.export_data_enabled !== 'undefined' && typeof settings.export_data_enabled !== 'boolean') {
    errors.push('Export data enabled must be a boolean');
  }

  if (typeof settings.analytics_enabled !== 'undefined' && typeof settings.analytics_enabled !== 'boolean') {
    errors.push('Analytics enabled must be a boolean');
  }

  if (typeof settings.profile_visible !== 'undefined' && typeof settings.profile_visible !== 'boolean') {
    errors.push('Profile visible must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates integration settings
 */
export const validateIntegrationSettings = (settings: any) => {
  const errors: string[] = [];

  if (typeof settings.calendar_connected !== 'undefined' && typeof settings.calendar_connected !== 'boolean') {
    errors.push('Calendar connected must be a boolean');
  }

  if (typeof settings.email_connected !== 'undefined' && typeof settings.email_connected !== 'boolean') {
    errors.push('Email connected must be a boolean');
  }

  if (typeof settings.webhooks_enabled !== 'undefined' && typeof settings.webhooks_enabled !== 'boolean') {
    errors.push('Webhooks enabled must be a boolean');
  }

  if (settings.connected_services && !Array.isArray(settings.connected_services)) {
    errors.push('Connected services must be an array');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates all settings
 */
export const validateAllSettings = (settings: any) => {
  const appearanceValidation = validateAppearanceSettings(settings.appearance || {});
  const notificationValidation = validateNotificationSettings(settings.notifications || {});
  const taskDefaultValidation = validateTaskDefaultSettings(settings.task_defaults || {});
  const privacyValidation = validatePrivacySettings(settings.privacy || {});
  const integrationValidation = validateIntegrationSettings(settings.integrations || {});

  const allErrors = [
    ...appearanceValidation.errors,
    ...notificationValidation.errors,
    ...taskDefaultValidation.errors,
    ...privacyValidation.errors,
    ...integrationValidation.errors
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    details: {
      appearance: appearanceValidation,
      notifications: notificationValidation,
      task_defaults: taskDefaultValidation,
      privacy: privacyValidation,
      integrations: integrationValidation
    }
  };
};

/**
 * Merges default settings with user settings
 */
export const mergeWithDefaults = (userSettings: any, defaultSettings: any) => {
  return {
    ...defaultSettings,
    ...userSettings,
    appearance: {
      ...defaultSettings.appearance,
      ...userSettings?.appearance
    },
    notifications: {
      ...defaultSettings.notifications,
      ...userSettings?.notifications
    },
    task_defaults: {
      ...defaultSettings.task_defaults,
      ...userSettings?.task_defaults
    },
    privacy: {
      ...defaultSettings.privacy,
      ...userSettings?.privacy
    },
    integrations: {
      ...defaultSettings.integrations,
      ...userSettings?.integrations
    }
  };
};