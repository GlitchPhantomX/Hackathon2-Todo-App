'use client'

import { useState } from 'react'
import { Plus, Upload, Download, Settings } from 'lucide-react'
// import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ImportTasksModal } from './ImportTasksModal'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'

interface QuickActionsProps {
  onAddTask: () => void
}

export function QuickActions({ onAddTask }: QuickActionsProps) {
  const [showImportModal, setShowImportModal] = useState(false)

  async function handleExport() {
    try {
      const userId = await getCurrentUserId()
      const tasks = await taskService.getTasks(userId)

      const json = JSON.stringify(tasks, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `tasks-${new Date().toISOString().split('T')[0]}.json`
      a.click()

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
      alert('Failed to export tasks')
    }
  }

  const quickActions = [
    {
      icon: Plus,
      label: 'New Task',
      description: 'Create a task',
      action: onAddTask,
    },
    {
      icon: Upload,
      label: 'Import',
      description: 'Import tasks',
      action: () => setShowImportModal(true),
    },
    {
      icon: Download,
      label: 'Export',
      description: 'Export data',
      action: handleExport,
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Preferences',
      action: () => console.log('Settings'),
    },
  ]

  return (
    <>
      <Card className="p-6 mt-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50 mb-6">
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="group p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300 text-left"
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

      <ImportTasksModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={() => {
          // Refresh tasks after import
          window.location.reload()
        }}
      />
    </>
  )
}