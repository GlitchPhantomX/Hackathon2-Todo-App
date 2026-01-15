'use client';
export const runtime = 'edge';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { 
  Settings, 
  Palette, 
  Bell, 
  ListChecks, 
  Lock, 
  Plug,
  Check,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Globe,
  Mail,
  Smartphone,
  Calendar,
  Archive,
  Eye,
  Shield,
  Download,
  Database,
  User
} from 'lucide-react';

const SettingsPageWithProviders = () => {
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState({
    theme: 'dark',
    accentColor: '#8b5cf6',
    fontSize: 'medium',
    compactMode: false,
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    dailySummary: false,
    defaultPriority: 'medium',
    defaultView: 'list',
    itemsPerPage: 20,
    autoArchive: true,
    profileVisibility: 'private',
    activityTracking: true,
    dataRetention: 90,
    dataSharing: false,
    googleCalendar: false,
    slack: false,
    github: false,
  });

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tasks', label: 'Tasks', icon: ListChecks },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  const updateSetting = (key: string, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                General Settings
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Manage your account and general preferences
              </p>
            </div>

            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div 
                    className="h-16 w-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                    }}
                  >
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 
                      className="font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      John Doe
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      john.doe@example.com
                    </p>
                  </div>
                </div>
                <button 
                  className="w-full px-4 py-2 text-white rounded-lg transition-all"
                  style={{
                    background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Edit Profile
                </button>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <h3 
                  className="font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Language
                </h3>
                <select 
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <h3 
                  className="font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Timezone
                </h3>
                <select 
                  className="w-full px-4 py-2 border rounded-lg"
                  style={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                >
                  <option>UTC-5 (Eastern Time)</option>
                  <option>UTC-6 (Central Time)</option>
                  <option>UTC-7 (Mountain Time)</option>
                  <option>UTC-8 (Pacific Time)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Appearance
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Customize how the app looks and feels
              </p>
            </div>

            <div className="space-y-3">
              <label 
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map((theme) => {
                  const Icon = theme.icon;
                  const isActive = settings.theme === theme.value;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value)}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isActive ? 'var(--muted)' : 'transparent'
                      }}
                    >
                      <Icon 
                        className="h-6 w-6"
                        style={{ color: 'var(--foreground)' }}
                      />
                      <span 
                        className="text-sm font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {theme.label}
                      </span>
                      {isActive && (
                        <Check 
                          className="h-4 w-4"
                          style={{ color: 'var(--primary)' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label 
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Accent Color
              </label>
              <div className="flex gap-3">
                {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSetting('accentColor', color)}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      settings.accentColor === color ? 'scale-110' : 'hover:scale-105'
                    }`}
                    style={{ 
                      backgroundColor: color,
                      borderColor: settings.accentColor === color ? 'var(--foreground)' : 'transparent'
                    }}
                  >
                    {settings.accentColor === color && (
                      <Check className="h-5 w-5 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label 
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ].map((size) => {
                  const isActive = settings.fontSize === size.value;
                  return (
                    <button
                      key={size.value}
                      onClick={() => updateSetting('fontSize', size.value)}
                      className="p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isActive ? 'var(--muted)' : 'transparent',
                        color: 'var(--foreground)'
                      }}
                    >
                      <span className="text-sm font-medium">{size.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div>
                <h3 
                  className="font-medium"
                  style={{ color: 'var(--foreground)' }}
                >
                  Compact Mode
                </h3>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Reduce spacing for a denser layout
                </p>
              </div>
              <button
                onClick={() => updateSetting('compactMode', !settings.compactMode)}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.compactMode ? 'var(--primary)' : 'var(--border)'
                }}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.compactMode ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Notifications
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Manage how you receive updates
              </p>
            </div>

            {[
              { key: 'emailNotifications', icon: Mail, label: 'Email Notifications', desc: 'Receive updates via email' },
              { key: 'pushNotifications', icon: Smartphone, label: 'Push Notifications', desc: 'Get notified on your device' },
              { key: 'taskReminders', icon: Bell, label: 'Task Reminders', desc: 'Reminders for upcoming tasks' },
              { key: 'dailySummary', icon: Calendar, label: 'Daily Summary', desc: 'Daily recap of your tasks' },
            ].map((item) => {
              const Icon = item.icon;
              const isEnabled = settings[item.key as keyof typeof settings];
              return (
                <div 
                  key={item.key} 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 
                        className="font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {item.label}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key, !isEnabled)}
                    className="relative w-14 h-7 rounded-full transition-colors"
                    style={{
                      backgroundColor: isEnabled ? 'var(--primary)' : 'var(--border)'
                    }}
                  >
                    <div
                      className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                        isEnabled ? 'translate-x-7' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        );

      case 'tasks':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Task Defaults
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Set default options for new tasks
              </p>
            </div>

            <div className="space-y-3">
              <label 
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Default Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ].map((priority) => {
                  const isActive = settings.defaultPriority === priority.value;
                  return (
                    <button
                      key={priority.value}
                      onClick={() => updateSetting('defaultPriority', priority.value)}
                      className="p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isActive ? 'var(--muted)' : 'transparent',
                        color: 'var(--foreground)'
                      }}
                    >
                      <span className="text-sm font-medium">{priority.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label 
                className="text-sm font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Default View
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['list', 'grid'].map((view) => {
                  const isActive = settings.defaultView === view;
                  return (
                    <button
                      key={view}
                      onClick={() => updateSetting('defaultView', view)}
                      className="p-3 rounded-xl border-2 transition-all capitalize"
                      style={{
                        borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: isActive ? 'var(--muted)' : 'transparent',
                        color: 'var(--foreground)'
                      }}
                    >
                      <span className="text-sm font-medium">{view}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                  }}
                >
                  <Archive className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Auto Archive
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Archive completed tasks after 30 days
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('autoArchive', !settings.autoArchive)}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.autoArchive ? 'var(--primary)' : 'var(--border)'
                }}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoArchive ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Security
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Manage your account security settings
              </p>
            </div>

            <div className="space-y-4">
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <h3 
                  className="font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Change Password
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Update your password regularly to keep your account secure
                </p>
                <button 
                  className="px-4 py-2 text-white rounded-lg transition-all"
                  style={{
                    background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Change Password
                </button>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <h3 
                  className="font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Two-Factor Authentication
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Add an extra layer of security to your account
                </p>
                <button 
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Enable 2FA
                </button>
              </div>

              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: 'var(--muted)' }}
              >
                <h3 
                  className="font-medium mb-2"
                  style={{ color: 'var(--foreground)' }}
                >
                  Active Sessions
                </h3>
                <p 
                  className="text-sm mb-4"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  Manage devices where you&#39;re currently logged in
                </p>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                  View Sessions
                </button>
              </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Privacy & Data
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Control your data and privacy settings
              </p>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                  }}
                >
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Activity Tracking
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Track your usage patterns for analytics
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('activityTracking', !settings.activityTracking)}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.activityTracking ? 'var(--primary)' : 'var(--border)'
                }}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.activityTracking ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            <div 
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                  }}
                >
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 
                    className="font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Data Sharing
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Share anonymized usage data
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('dataSharing', !settings.dataSharing)}
                className="relative w-14 h-7 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.dataSharing ? 'var(--primary)' : 'var(--border)'
                }}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.dataSharing ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            <div 
              className="p-4 rounded-xl"
              style={{ backgroundColor: 'var(--muted)' }}
            >
              <div className="flex items-center gap-4">
                <div 
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                  }}
                >
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 
                    className="font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    Export Data
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Download all your personal data
                  </p>
                </div>
                <button 
                  className="px-4 py-2 text-white rounded-lg transition-all"
                  style={{
                    background: 'linear-gradient(to right, var(--purple-600), var(--violet-600))'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  Export
                </button>
              </div>
            </div>

            <div 
              className="p-4 border rounded-xl"
              style={{
                backgroundColor: '#fef3c7',
                borderColor: '#fbbf24'
              }}
            >
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 mb-1">
                    Data Protection
                  </h3>
                  <p className="text-sm text-amber-700">
                    Your data is encrypted and stored securely. We never share your information with third parties.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'integrations':
        return (
          <div className="space-y-6">
            <div>
              <h2 
                className="text-2xl font-bold mb-2"
                style={{ color: 'var(--foreground)' }}
              >
                Integrations
              </h2>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Connect with your favorite apps and services
              </p>
            </div>

            {[
              { key: 'googleCalendar', icon: Calendar, label: 'Google Calendar', desc: 'Sync tasks with your calendar' },
              { key: 'slack', icon: Bell, label: 'Slack', desc: 'Get notifications in Slack' },
              { key: 'github', icon: Globe, label: 'GitHub', desc: 'Link with GitHub issues' },
            ].map((item) => {
              const Icon = item.icon;
              const isConnected = settings[item.key as keyof typeof settings];
              return (
                <div 
                  key={item.key} 
                  className="flex items-center justify-between p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--muted)' }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 
                        className="font-medium"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {item.label}
                      </h3>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--muted-foreground)' }}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key, !isConnected)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors text-white"
                    style={{
                      backgroundColor: isConnected ? '#ef4444' : 'var(--primary)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isConnected ? '#dc2626' : 'var(--purple-700)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isConnected ? '#ef4444' : 'var(--primary)';
                    }}
                  >
                    {isConnected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className="min-h-screen p-6"
      style={{ backgroundColor: 'var(--background)' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div 
              className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                background: 'linear-gradient(to bottom right, var(--purple-600), var(--violet-600))'
              }}
            >
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 
                className="text-4xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Settings
              </h1>
              <p style={{ color: 'var(--muted-foreground)' }}>
                Customize your dashboard experience and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div 
              className="backdrop-blur-xl rounded-2xl border p-2 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1"
                    style={{
                      backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                      color: isActive ? 'white' : 'var(--foreground)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--muted)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {isActive && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div 
              className="backdrop-blur-xl rounded-2xl border p-8 shadow-xl"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)'
              }}
            >
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageWithProviders;