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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                General Settings
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account and general preferences
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">John Doe</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">john.doe@example.com</p>
                  </div>
                </div>
                <button className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Edit Profile
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Language</h3>
                <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                </select>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Timezone</h3>
                <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg">
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Appearance
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Customize how the app looks and feels
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', icon: Sun, label: 'Light' },
                  { value: 'dark', icon: Moon, label: 'Dark' },
                  { value: 'system', icon: Monitor, label: 'System' },
                ].map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        settings.theme === theme.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <Icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {theme.label}
                      </span>
                      {settings.theme === theme.value && (
                        <Check className="h-4 w-4 text-blue-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Accent Color
              </label>
              <div className="flex gap-3">
                {['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'].map((color) => (
                  <button
                    key={color}
                    onClick={() => updateSetting('accentColor', color)}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      settings.accentColor === color
                        ? 'border-slate-400 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {settings.accentColor === color && (
                      <Check className="h-5 w-5 text-white mx-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Font Size
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'small', label: 'Small' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'large', label: 'Large' },
                ].map((size) => (
                  <button
                    key={size.value}
                    onClick={() => updateSetting('fontSize', size.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      settings.fontSize === size.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{size.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Compact Mode
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Reduce spacing for a denser layout
                </p>
              </div>
              <button
                onClick={() => updateSetting('compactMode', !settings.compactMode)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.compactMode ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Notifications
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
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
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key, !isEnabled)}
                    className={`relative w-14 h-7 rounded-full transition-colors ${
                      isEnabled ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Task Defaults
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Set default options for new tasks
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Default Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                ].map((priority) => (
                  <button
                    key={priority.value}
                    onClick={() => updateSetting('defaultPriority', priority.value)}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      settings.defaultPriority === priority.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{priority.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Default View
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['list', 'grid'].map((view) => (
                  <button
                    key={view}
                    onClick={() => updateSetting('defaultView', view)}
                    className={`p-3 rounded-xl border-2 transition-all capitalize ${
                      settings.defaultView === view
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-medium">{view}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Archive className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Auto Archive
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Archive completed tasks after 30 days
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('autoArchive', !settings.autoArchive)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.autoArchive ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Security
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Manage your account security settings
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Change Password</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Update your password regularly to keep your account secure
                </p>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Change Password
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Add an extra layer of security to your account
                </p>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Enable 2FA
                </button>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <h3 className="font-medium text-slate-900 dark:text-white mb-2">Active Sessions</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Privacy & Data
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Control your data and privacy settings
              </p>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Eye className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Activity Tracking
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Track your usage patterns for analytics
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('activityTracking', !settings.activityTracking)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.activityTracking ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.activityTracking ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Data Sharing
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Share anonymized usage data
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateSetting('dataSharing', !settings.dataSharing)}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  settings.dataSharing ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.dataSharing ? 'translate-x-7' : ''
                  }`}
                />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <Download className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Export Data
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Download all your personal data
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  Export
                </button>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-900 dark:text-amber-200 mb-1">
                    Data Protection
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
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
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Integrations
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
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
                <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {item.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting(item.key, !isConnected)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isConnected
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Customize your dashboard experience and preferences
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                    {activeTab === tab.id && (
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPageWithProviders;