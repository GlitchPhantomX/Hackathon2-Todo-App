'use client';

import React, { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

import { memo } from 'react';

const AppearanceSettings = () => {
  const { settings, updateSettings } = useSettings();

  const handleThemeChange = useCallback((value: string) => {
    if (settings) {
      updateSettings({
        appearance: {
          ...settings.appearance,
          theme: value as 'light' | 'dark' | 'system'
        }
      });
    }
  }, [settings, updateSettings]);

  const handleAccentColorChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      updateSettings({
        appearance: {
          ...settings.appearance,
          accent_color: e.target.value
        }
      });
    }
  }, [settings, updateSettings]);

  const handleFontSizeChange = useCallback((value: string) => {
    if (settings) {
      updateSettings({
        appearance: {
          ...settings.appearance,
          font_size: value as 'S' | 'M' | 'L'
        }
      });
    }
  }, [settings, updateSettings]);

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Appearance Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="theme">Theme</Label>
          <Select
            value={settings.appearance.theme}
            onValueChange={handleThemeChange}
          >
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accent-color">Accent Color</Label>
          <div className="flex items-center space-x-2">
            <Input
              id="accent-color"
              type="color"
              value={settings.appearance.accent_color}
              onChange={handleAccentColorChange}
              className="w-16 h-10 p-1"
            />
            <span>{settings.appearance.accent_color}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="font-size">Font Size</Label>
          <Select
            value={settings.appearance.font_size}
            onValueChange={handleFontSizeChange}
          >
            <SelectTrigger id="font-size">
              <SelectValue placeholder="Select font size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="S">Small</SelectItem>
              <SelectItem value="M">Medium</SelectItem>
              <SelectItem value="L">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
export default memo(AppearanceSettings);
