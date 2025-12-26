'use client';

import React, { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { memo } from 'react';

const NotificationSettings = () => {
  const { settings, updateSettings } = useSettings();

  const handleNotificationChange = useCallback((field: keyof any, value: boolean) => {
    if (settings) {
      updateSettings({
        notifications: {
          ...settings.notifications,
          [field]: value
        }
      });
    }
  }, [settings, updateSettings]);

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="notifications-enabled">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive notifications for tasks and updates</p>
          </div>
          <Checkbox
            id="notifications-enabled"
            checked={settings.notifications.enabled}
            onCheckedChange={(checked) => handleNotificationChange('enabled', checked as boolean)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sound-enabled">Notification Sound</Label>
            <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
          </div>
          <Checkbox
            id="sound-enabled"
            checked={settings.notifications.sound_enabled}
            onCheckedChange={(checked) => handleNotificationChange('sound_enabled', checked as boolean)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive email notifications</p>
          </div>
          <Checkbox
            id="email-notifications"
            checked={settings.notifications.email_notifications}
            onCheckedChange={(checked) => handleNotificationChange('email_notifications', checked as boolean)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">Receive push notifications on this device</p>
          </div>
          <Checkbox
            id="push-notifications"
            checked={settings.notifications.push_notifications}
            onCheckedChange={(checked) => handleNotificationChange('push_notifications', checked as boolean)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="task-reminders">Task Reminders</Label>
            <p className="text-sm text-muted-foreground">Receive reminders for upcoming tasks</p>
          </div>
          <Checkbox
            id="task-reminders"
            checked={settings.notifications.task_reminders}
            onCheckedChange={(checked) => handleNotificationChange('task_reminders', checked as boolean)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="daily-digest">Daily Digest</Label>
            <p className="text-sm text-muted-foreground">Receive a daily summary of tasks</p>
          </div>
          <Checkbox
            id="daily-digest"
            checked={settings.notifications.daily_digest}
            onCheckedChange={(checked) => handleNotificationChange('daily_digest', checked as boolean)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default memo(NotificationSettings);