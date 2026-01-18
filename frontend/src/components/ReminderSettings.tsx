import React from 'react';
import { ReminderConfig, ReminderTiming } from '../types/task.types';

interface ReminderSettingsProps {
  reminderConfig: ReminderConfig;
  onChange: (config: ReminderConfig) => void;
}

const ReminderSettings: React.FC<ReminderSettingsProps> = ({ reminderConfig, onChange }) => {
  const timingOptions: ReminderTiming[] = ['15min', '1hr', '1day'];

  const handleEnabledChange = (enabled: boolean) => {
    onChange({
      ...reminderConfig,
      reminderEnabled: enabled
    });
  };

  const handleTimingChange = (timing: ReminderTiming) => {
    onChange({
      ...reminderConfig,
      reminderTiming: timing
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reminderConfig.reminderEnabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="font-medium text-gray-700">Enable reminder</span>
        </label>
      </div>

      {reminderConfig.reminderEnabled && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reminder Timing
          </label>
          <div className="grid grid-cols-3 gap-2">
            {timingOptions.map((timing) => (
              <button
                key={timing}
                type="button"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  reminderConfig.reminderTiming === timing
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleTimingChange(timing)}
              >
                {timing === '15min' ? '15 minutes' :
                 timing === '1hr' ? '1 hour' :
                 '1 day'}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderSettings;