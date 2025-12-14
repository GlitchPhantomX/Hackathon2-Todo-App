'use client'

import { Plus, Upload, Download, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

const quickActions = [
  {
    icon: Plus,
    label: 'New Task',
    description: 'Create a task',
    action: () => console.log('New task'),
  },
  {
    icon: Upload,
    label: 'Import',
    description: 'Import tasks',
    action: () => console.log('Import'),
  },
  {
    icon: Download,
    label: 'Export',
    description: 'Export data',
    action: () => console.log('Export'),
  },
  {
    icon: Settings,
    label: 'Settings',
    description: 'Preferences',
    action: () => console.log('Settings'),
  },
]

export function QuickActions() {
  return (
    <Card className="p-6 mt-6 animate-slideUp animation-delay-900">
      <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50 mb-6">
        Quick Actions
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={action.label}
            onClick={action.action}
            className="group p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300 text-left animate-scaleIn"
            style={{ animationDelay: `${900 + index * 100}ms` }}
          >
            <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-950 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <action.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="font-medium text-body-md text-gray-900 dark:text-gray-50 mb-1">
              {action.label}
            </div>
            <div className="text-body-sm text-gray-600 dark:text-gray-400">
              {action.description}
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}