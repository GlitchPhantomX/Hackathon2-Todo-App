'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Upload, Download, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { AddTaskModal } from './AddTaskModal'
import { EditTaskModal } from './EditTaskModal'
import { ImportTasksModal } from './ImportTasksModal'
import { TaskListSkeleton } from './skeletons'
import { Task } from '@/types/task.types'

interface TaskManagementPanelProps {
  searchQuery?: string;
}

export function TaskManagementPanel({ searchQuery: propSearchQuery }: TaskManagementPanelProps = {}) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [internalSearchQuery, setInternalSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  const currentSearchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const userId = await getCurrentUserId()
      const allTasks = await taskService.getTasks(userId)

      // Use the appropriate search query (prop takes precedence)
      const searchQuery = propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery;

      // Filter and sort
      const filtered = searchQuery
        ? allTasks.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : allTasks

      // Show recent 10
      const recent = filtered
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)

      setTasks(recent)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [propSearchQuery, internalSearchQuery])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  useEffect(() => {
    // Debounced search
    const timer = setTimeout(() => {
      fetchTasks()
    }, 300)

    return () => clearTimeout(timer)
  }, [currentSearchQuery, fetchTasks])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTasks, 30000)
    return () => clearInterval(interval)
  }, [fetchTasks])

  const handleToggleComplete = useCallback(async (taskId: string) => {
    try {
      const userId = await getCurrentUserId()
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        await taskService.updateTask(userId, taskId, {
          ...task,
          completed: !task.completed
        })
        await fetchTasks() // Refresh
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }, [tasks, fetchTasks])

  const handleDelete = useCallback(async (taskId: string) => {
    if (!confirm('Delete this task?')) return

    try {
      const userId = await getCurrentUserId()
      await taskService.deleteTask(userId, taskId)
      await fetchTasks() // Refresh
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }, [fetchTasks])

  const handleExport = useCallback(() => {
    const json = JSON.stringify(tasks, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-${new Date().toISOString()}.json`
    a.click()
    // Clean up the URL object to prevent memory leaks
    URL.revokeObjectURL(url)
  }, [tasks])

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Task Management
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportModal(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search tasks..."
          value={propSearchQuery !== undefined ? propSearchQuery : internalSearchQuery}
          onChange={(e) => {
            if (propSearchQuery === undefined) {
              setInternalSearchQuery(e.target.value)
            }
          }}
          className="pl-10"
        />
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {loading ? (
          <TaskListSkeleton />
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No tasks found
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              {/* Checkbox */}
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => handleToggleComplete(task.id)}
              />

              {/* Task Info */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  task.completed
                    ? 'line-through text-gray-500'
                    : 'text-gray-900 dark:text-gray-50'
                }`}>
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-gray-500 truncate">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Priority Badge */}
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                task.priority === 'high'
                  ? 'bg-error-100 text-error-700 dark:bg-error-950 dark:text-error-300'
                  : task.priority === 'medium'
                  ? 'bg-warning-100 text-warning-700 dark:bg-warning-950 dark:text-warning-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {task.priority}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingTask(task)
                    setShowEditModal(true)
                  }}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 className="w-4 h-4 text-error-600" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchTasks}
      />

      {/* Edit Task Modal */}
      <EditTaskModal
        task={editingTask}
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingTask(null)
        }}
        onSuccess={fetchTasks}
      />

      {/* Import Tasks Modal */}
      <ImportTasksModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={fetchTasks}
      />
    </Card>
  )
}