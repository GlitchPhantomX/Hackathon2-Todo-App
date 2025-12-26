'use client';

import React, { useCallback, useMemo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function IntegrationSettings() {
  const { settings, updateSettings } = useSettings();

  const handleCalendarConnect = useCallback(() => {
    // Implementation for calendar connection would go here
    console.log("Calendar connection functionality would be implemented here");
    if (settings) {
      updateSettings({
        integrations: {
          ...settings.integrations,
          calendar_connected: !settings.integrations.calendar_connected
        }
      });
    }
  }, [settings, updateSettings]);

  const handleEmailConnect = useCallback(() => {
    // Implementation for email connection would go here
    console.log("Email connection functionality would be implemented here");
    if (settings) {
      updateSettings({
        integrations: {
          ...settings.integrations,
          email_connected: !settings.integrations.email_connected
        }
      });
    }
  }, [settings, updateSettings]);

  const handleWebhooksToggle = useCallback(() => {
    if (settings) {
      updateSettings({
        integrations: {
          ...settings.integrations,
          webhooks_enabled: !settings.integrations.webhooks_enabled
        }
      });
    }
  }, [settings, updateSettings]);

  // Memoize the connected services list to prevent unnecessary re-renders
  const connectedServicesList = useMemo(() => {
    if (!settings) return null;

    return settings.integrations.connected_services.length > 0 ? (
      <div className="space-y-2">
        {settings.integrations.connected_services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
            <span>{service}</span>
            <Button variant="outline" size="sm">
              Disconnect
            </Button>
          </div>
        ))}
      </div>
    ) : (
      <p className="text-sm text-muted-foreground">No services connected yet</p>
    );
  }, [settings?.integrations.connected_services]);

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Integration Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Calendar Integration</Label>
              <p className="text-sm text-muted-foreground">Connect with your calendar to sync events</p>
            </div>
            <Button
              variant={settings.integrations.calendar_connected ? "default" : "outline"}
              onClick={handleCalendarConnect}
            >
              {settings.integrations.calendar_connected ? "Connected" : "Connect"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Integration</Label>
              <p className="text-sm text-muted-foreground">Connect with your email to sync tasks</p>
            </div>
            <Button
              variant={settings.integrations.email_connected ? "default" : "outline"}
              onClick={handleEmailConnect}
            >
              {settings.integrations.email_connected ? "Connected" : "Connect"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Webhooks</Label>
              <p className="text-sm text-muted-foreground">Enable webhooks for external integrations</p>
            </div>
            <Button
              variant={settings.integrations.webhooks_enabled ? "default" : "outline"}
              onClick={handleWebhooksToggle}
            >
              {settings.integrations.webhooks_enabled ? "Enabled" : "Enable"}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-lg font-medium mb-4">Connected Services</h3>
          {connectedServicesList}
        </div>
      </CardContent>
    </Card>
  );
}