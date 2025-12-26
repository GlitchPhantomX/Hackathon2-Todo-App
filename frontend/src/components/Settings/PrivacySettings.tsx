'use client';

import React, { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PrivacySettings() {
  const { settings, updateSettings } = useSettings();

  const handleRetentionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value >= 0 && value <= 365) {
        updateSettings({
          privacy: {
            ...settings.privacy,
            data_retention_days: value
          }
        });
      }
    }
  }, [settings, updateSettings]);

  const handleExportDataChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      updateSettings({
        privacy: {
          ...settings.privacy,
          export_data_enabled: e.target.checked
        }
      });
    }
  }, [settings, updateSettings]);

  const handleAnalyticsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      updateSettings({
        privacy: {
          ...settings.privacy,
          analytics_enabled: e.target.checked
        }
      });
    }
  }, [settings, updateSettings]);

  const handleProfileVisibilityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      updateSettings({
        privacy: {
          ...settings.privacy,
          profile_visible: e.target.checked
        }
      });
    }
  }, [settings, updateSettings]);

  const handleDeleteAccount = useCallback(() => {
    // Implementation for account deletion would go here
    console.log("Delete account functionality would be implemented here");
  }, []);

  const handleExportData = useCallback(() => {
    // Implementation for data export would go here
    console.log("Export data functionality would be implemented here");
  }, []);

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="data-retention">Data Retention (days)</Label>
          <p className="text-sm text-muted-foreground">How long to retain your data (0 = forever, max 365)</p>
          <Input
            id="data-retention"
            type="number"
            min="0"
            max="365"
            value={settings.privacy.data_retention_days}
            onChange={handleRetentionChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="export-data">Export Data</Label>
            <p className="text-sm text-muted-foreground">Allow data export functionality</p>
          </div>
          <Input
            id="export-data"
            type="checkbox"
            checked={settings.privacy.export_data_enabled}
            onChange={handleExportDataChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="analytics">Analytics</Label>
            <p className="text-sm text-muted-foreground">Share usage analytics to improve the app</p>
          </div>
          <Input
            id="analytics"
            type="checkbox"
            checked={settings.privacy.analytics_enabled}
            onChange={handleAnalyticsChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="profile-visibility">Profile Visibility</Label>
            <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
          </div>
          <Input
            id="profile-visibility"
            type="checkbox"
            checked={settings.privacy.profile_visible}
            onChange={handleProfileVisibilityChange}
          />
        </div>

        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-medium">Account Management</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleExportData}
              className="w-full sm:w-auto"
            >
              Export My Data
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              className="w-full sm:w-auto"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}