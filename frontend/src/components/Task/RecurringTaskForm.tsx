import React, { useState } from 'react';
import { TaskFormState, TaskFrequency, ReminderTiming } from '../types/task.types';

interface RecurringTaskFormProps {
  formState: TaskFormState;
  onChange: (field: keyof TaskFormState, value: any) => void;
}

const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({ formState, onChange }) => {
  const [showOptions, setShowOptions] = useState(false);

  const frequencyOptions: TaskFrequency[] = ['daily', 'weekly', 'monthly', 'custom'];
  const reminderOptions: ReminderTiming[] = ['15min', '1hr', '1day'];

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formState.isRecurring}
            onChange={(e) => onChange('isRecurring', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-700">Make this a recurring task</span>
        </label>
      </div>

      {formState.isRecurring && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recurrence Frequency
            </label>
            <select
              value={formState.frequency}
              onChange={(e) => onChange('frequency', e.target.value as TaskFrequency)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {frequencyOptions.map((freq) => (
                <option key={freq} value={freq}>
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date (optional)
            </label>
            <input
              type="date"
              value={formState.recurrenceEndDate || ''}
              onChange={(e) => onChange('recurrenceEndDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Custom recurrence pattern input */}
          {formState.frequency === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Recurrence Pattern
              </label>
              <textarea
                value={JSON.stringify(formState.recurrencePattern, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    onChange('recurrencePattern', parsed);
                  } catch {
                    // Invalid JSON, don't update
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder='{"interval": 2, "unit": "weeks"}'
              />
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formState.reminderEnabled}
            onChange={(e) => onChange('reminderEnabled', e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-700">Enable reminder</span>
        </label>
      </div>

      {formState.reminderEnabled && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reminder Timing
          </label>
          <select
            value={formState.reminderTiming}
            onChange={(e) => onChange('reminderTiming', e.target.value as ReminderTiming)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {reminderOptions.map((timing) => (
              <option key={timing} value={timing}>
                {timing === '15min' ? '15 minutes before' :
                 timing === '1hr' ? '1 hour before' :
                 '1 day before'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Timezone
        </label>
        <select
          value={formState.timezone}
          onChange={(e) => onChange('timezone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Chicago">Central Time (CT)</option>
          <option value="America/Denver">Mountain Time (MT)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT)</option>
          <option value="Europe/Berlin">Berlin (CET)</option>
          <option value="Asia/Tokyo">Tokyo (JST)</option>
          <option value="Asia/Shanghai">Shanghai (CST)</option>
        </select>
      </div>
    </div>
  );
};

export default RecurringTaskForm;