// Unit tests for settings utilities

import {
  validateAppearanceSettings,
  validateNotificationSettings,
  validateTaskDefaultSettings,
  validatePrivacySettings,
  validateIntegrationSettings,
  validateAllSettings,
  mergeWithDefaults
} from '@/utils/settings.utils';

describe('Settings Utilities', () => {
  describe('validateAppearanceSettings', () => {
    it('should validate correct appearance settings', () => {
      const result = validateAppearanceSettings({
        theme: 'light',
        accent_color: '#FF0000',
        font_size: 'M'
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid theme', () => {
      const result = validateAppearanceSettings({
        theme: 'invalid'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Theme must be "light", "dark", or "system"');
    });

    it('should detect invalid accent color', () => {
      const result = validateAppearanceSettings({
        accent_color: 'invalid'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Accent color must be a valid hex code');
    });
  });

  describe('validateNotificationSettings', () => {
    it('should validate correct notification settings', () => {
      const result = validateNotificationSettings({
        enabled: true,
        sound_enabled: false
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid boolean values', () => {
      const result = validateNotificationSettings({
        enabled: 'true'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Enabled must be a boolean');
    });
  });

  describe('validateTaskDefaultSettings', () => {
    it('should validate correct task default settings', () => {
      const result = validateTaskDefaultSettings({
        default_priority: 'high',
        default_view: 'list',
        items_per_page: 10
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid priority', () => {
      const result = validateTaskDefaultSettings({
        default_priority: 'invalid'
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Default priority must be "low", "medium", or "high"');
    });
  });

  describe('validatePrivacySettings', () => {
    it('should validate correct privacy settings', () => {
      const result = validatePrivacySettings({
        data_retention_days: 30,
        export_data_enabled: true
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid retention days', () => {
      const result = validatePrivacySettings({
        data_retention_days: -1
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Data retention days must be between 0 and 365');
    });
  });

  describe('validateIntegrationSettings', () => {
    it('should validate correct integration settings', () => {
      const result = validateIntegrationSettings({
        calendar_connected: true,
        connected_services: []
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('validateAllSettings', () => {
    it('should validate all settings correctly', () => {
      const result = validateAllSettings({
        appearance: { theme: 'light' },
        notifications: { enabled: true },
        task_defaults: { default_priority: 'medium' },
        privacy: { data_retention_days: 30 },
        integrations: { calendar_connected: false }
      });
      expect(result.isValid).toBe(true);
    });
  });

  describe('mergeWithDefaults', () => {
    it('should merge user settings with defaults', () => {
      const defaultSettings = {
        appearance: { theme: 'system', accent_color: '#3b82f6' },
        notifications: { enabled: true }
      };
      const userSettings = {
        appearance: { theme: 'dark' }
      };

      const result = mergeWithDefaults(userSettings, defaultSettings);
      expect(result.appearance.theme).toBe('dark'); // User setting
      expect(result.appearance.accent_color).toBe('#3b82f6'); // Default setting
      expect(result.notifications.enabled).toBe(true); // Default setting
    });
  });
});