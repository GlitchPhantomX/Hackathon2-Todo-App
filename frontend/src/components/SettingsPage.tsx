'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface SettingsState {
  theme: string;
  accentColor: string;
  fontSize: string;
  compactMode: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  dailySummary: boolean;
  defaultPriority: string;
  defaultView: string;
  itemsPerPage: number;
  autoArchive: boolean;
  profileVisibility: string;
  activityTracking: boolean;
  dataRetention: number;
  googleCalendar: boolean;
  slack: boolean;
  github: boolean;
}

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
  Database
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('appearance');
  const [settings, setSettings] = useState<SettingsState>({
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
    googleCalendar: false,
    slack: false,
    github: false,
  });

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'tasks', label: 'Tasks', icon: ListChecks },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'integrations', label: 'Integrations', icon: Plug },
  ];

  const updateSetting = (key: keyof SettingsState, value: SettingsState[keyof SettingsState]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Settings className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Customize your experience
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-xl">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-1 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl"
              >
                {/* Appearance Settings */}
                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Appearance
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Customize how the app looks and feels
                      </p>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'light', icon: Sun, label: 'Light' },
                          { value: 'dark', icon: Moon, label: 'Dark' },
                          { value: 'system', icon: Monitor, label: 'System' },
                        ].map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => updateSetting('theme', theme.value)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                              settings.theme === theme.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                          >
                            <theme.icon className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {theme.label}
                            </span>
                            {settings.theme === theme.value && (
                              <Check className="h-4 w-4 text-blue-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Accent Color */}
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

                    {/* Font Size */}
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

                    {/* Compact Mode */}
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
                )}

                {/* Notifications Settings */}
                {activeTab === 'notifications' && (
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
                      const itemKey = item.key as keyof SettingsState;
                      return (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <item.icon className="h-5 w-5 text-white" />
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
                          onClick={() => updateSetting(itemKey, !settings[itemKey])}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            settings[itemKey] ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                              settings[itemKey] ? 'translate-x-7' : ''
                            }`}
                          />
                        </button>
                      </div>
                    )})}
                  </div>
                )}

                {/* Tasks Settings */}
                {activeTab === 'tasks' && (
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
                          { value: 'low', label: 'Low', color: 'blue' },
                          { value: 'medium', label: 'Medium', color: 'yellow' },
                          { value: 'high', label: 'High', color: 'red' },
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
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Privacy & Security
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Control your data and privacy
                      </p>
                    </div>

                    {[
                      { key: 'activityTracking', icon: Eye, label: 'Activity Tracking', desc: 'Track your usage patterns' },
                    ].map((item) => {
                      const itemKey = item.key as keyof SettingsState;
                      return (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <item.icon className="h-5 w-5 text-white" />
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
                          onClick={() => updateSetting(itemKey, !settings[itemKey])}
                          className={`relative w-14 h-7 rounded-full transition-colors ${
                            settings[itemKey] ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        >
                          <div
                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                              settings[itemKey] ? 'translate-x-7' : ''
                            }`}
                          />
                        </button>
                      </div>
                    )})}

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
                )}

                {/* Integrations Settings */}
                {activeTab === 'integrations' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Integrations
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        Connect with your favorite apps
                      </p>
                    </div>

                    {[
                      { key: 'googleCalendar', icon: Calendar, label: 'Google Calendar', desc: 'Sync tasks with your calendar' },
                      { key: 'slack', icon: Bell, label: 'Slack', desc: 'Get notifications in Slack' },
                      { key: 'github', icon: Globe, label: 'GitHub', desc: 'Link with GitHub issues' },
                    ].map((item) => {
                      const itemKey = item.key as keyof SettingsState;
                      return (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <item.icon className="h-5 w-5 text-white" />
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
                          onClick={() => updateSetting(itemKey, !settings[itemKey])}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            settings[itemKey]
                              ? 'bg-red-500 text-white hover:bg-red-600'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          {settings[itemKey] ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    )})}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}