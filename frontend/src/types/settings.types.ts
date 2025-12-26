export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
  font_size: 'S' | 'M' | 'L';
  language: string;
  date_format: string;
  time_format: '12h' | '24h';
}

export interface NotificationSettings {
  enabled: boolean;
  sound_enabled: boolean;
  email_notifications: boolean;
  push_notifications: boolean;
  task_reminders: boolean;
  daily_digest: boolean;
}

export interface TaskDefaultSettings {
  default_priority: 'low' | 'medium' | 'high';
  default_project_id: number | null;
  default_view: 'list' | 'grid';
  items_per_page: number;
  auto_assign_today: boolean;
}

export interface PrivacySettings {
  data_retention_days: number;
  export_data_enabled: boolean;
  analytics_enabled: boolean;
  profile_visible: boolean;
}

export interface IntegrationSettings {
  calendar_connected: boolean;
  email_connected: boolean;
  webhooks_enabled: boolean;
  connected_services: string[];
}

export interface UserSettings {
  id: number;
  user_id: number;
  appearance: AppearanceSettings;
  notifications: NotificationSettings;
  task_defaults: TaskDefaultSettings;
  privacy: PrivacySettings;
  integrations: IntegrationSettings;
  created_at: string;
  updated_at: string;
}

export interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
  saveToLocalStorage: (settings: UserSettings) => void;
  loadFromLocalStorage: () => UserSettings | null;
}

export interface OfflineState {
  isOnline: boolean;
  syncQueue: any[];
}

export interface OfflineContextType extends OfflineState {}