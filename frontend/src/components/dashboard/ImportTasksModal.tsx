'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'

interface ImportTasksModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ImportTasksModal({ open, onClose, onSuccess }: ImportTasksModalProps) {
  const [loading, setLoading] = useState(false)

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      const text = await file.text()
      const tasks = JSON.parse(text)

      const userId = await getCurrentUserId()

      // Validate and import each task
      for (const task of tasks) {
        if (task.title) { // Only import tasks with a title
          await taskService.createTask(userId, {
            title: task.title,
            description: task.description || '',
            priority: task.priority || 'medium',
            due_date: task.due_date || null,
          })
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import tasks. Please ensure the file contains valid JSON tasks.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Tasks</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload a JSON file containing tasks to import
          </p>

          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-500">
            <Upload className="w-8 h-8 mb-2 text-gray-400" />
            <span className="text-sm text-gray-500">
              {loading ? 'Importing...' : 'Click to upload JSON file'}
            </span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileUpload}
              disabled={loading}
            />
          </label>
        </div>
      </DialogContent>
    </Dialog>
  )
}