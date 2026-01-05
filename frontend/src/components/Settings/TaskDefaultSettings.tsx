'use client';

import React, { useCallback } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { memo } from 'react';

const TaskDefaultSettings = () => {
  const { settings, updateSettings } = useSettings();

  const handlePriorityChange = useCallback((value: string) => {
    if (settings) {
      updateSettings({
        task_defaults: {
          ...settings.task_defaults,
          default_priority: value as 'low' | 'medium' | 'high'
        }
      });
    }
  }, [settings, updateSettings]);

  const handleViewChange = useCallback((value: string) => {
    if (settings) {
      updateSettings({
        task_defaults: {
          ...settings.task_defaults,
          default_view: value as 'list' | 'grid'
        }
      });
    }
  }, [settings, updateSettings]);

  const handleItemsPerPageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      const value = parseInt(e.target.value);
      if (!isNaN(value) && value > 0) {
        updateSettings({
          task_defaults: {
            ...settings.task_defaults,
            items_per_page: value
          }
        });
      }
    }
  }, [settings, updateSettings]);

  const handleAutoAssignChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (settings) {
      updateSettings({
        task_defaults: {
          ...settings.task_defaults,
          auto_assign_today: e.target.checked
        }
      });
    }
  }, [settings, updateSettings]);

  if (!settings) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Task Default Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="default-priority">Default Priority</Label>
          <Select
            value={settings.task_defaults.default_priority}
            onValueChange={handlePriorityChange}
          >
            <SelectTrigger id="default-priority">
              <SelectValue placeholder="Select default priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="default-view">Default View</Label>
          <Select
            value={settings.task_defaults.default_view}
            onValueChange={handleViewChange}
          >
            <SelectTrigger id="default-view">
              <SelectValue placeholder="Select default view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="grid">Grid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="items-per-page">Items Per Page</Label>
          <Input
            id="items-per-page"
            type="number"
            min="1"
            max="100"
            value={settings.task_defaults.items_per_page}
            onChange={handleItemsPerPageChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-assign-today">Auto-assign Today&apos;s Date</Label>
            <p className="text-sm text-muted-foreground">Automatically assign today&apos;s date to new tasks</p>
          </div>
          <Input
            id="auto-assign-today"
            type="checkbox"
            checked={settings.task_defaults.auto_assign_today}
            onChange={handleAutoAssignChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
export default memo(TaskDefaultSettings);
