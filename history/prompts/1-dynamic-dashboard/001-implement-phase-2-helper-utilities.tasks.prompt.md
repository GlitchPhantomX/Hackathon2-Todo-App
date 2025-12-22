---
id: 001
title: "Implement Phase 2 Helper Utilities"
stage: "tasks"
date: "2025-12-15"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "1-dynamic-dashboard"
branch: "1-dynamic-dashboard"
user: "user"
command: "/sp.implement"
labels: ["implementation", "dashboard", "utilities", "frontend"]
links:
  spec: "null"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
  - "frontend/src/lib/task-utils.ts"
  - "frontend/src/services/api.ts"
  - "frontend/src/components/dashboard/skeletons.tsx"
  - "frontend/src/components/dashboard/EditTaskModal.tsx"
  - "frontend/src/types/task.types.ts"
tests: []
outcome: "Successfully implemented all Phase 2 helper utilities including task utilities, API service updates, skeleton components, and edit task modal"
evaluation: "All required functions and components were created according to specifications with proper TypeScript types and error handling"
---

## User Input

```
## Phase 2: Helper Utilities (4 tasks)

### T003: Create Task Utilities
**File:** `frontend/src/lib/task-utils.ts`
**Priority:** CRITICAL
**Time:** 30 min

**Implementation:**
```typescript
import { Task } from '@/types/task'

export function calculateStats(tasks: Task[]) {
  const now = new Date()
  return {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length,
    overdue: tasks.filter(t =>
      !t.completed &&
      t.due_date &&
      new Date(t.due_date) < now
    ).length
  }
}

export function groupTasksByDay(tasks: Task[], days: number = 7) {
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = date.toISOString().split('T')[0]

    const dayTasks = tasks.filter(t =>
      t.created_at.startsWith(dateStr)
    )

    result.push({
      day: dayName,
      completed: dayTasks.filter(t => t.completed).length,
      created: dayTasks.length
    })
  }

  return result
}

export function groupTasksByMonth(tasks: Task[], months: number = 6) {
  const result = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const month = date.getMonth()

    const monthTasks = tasks.filter(t => {
      const taskDate = new Date(t.created_at)
      return taskDate.getFullYear() === year && taskDate.getMonth() === month
    })

    result.push({
      month: monthName,
      tasks: monthTasks.filter(t => t.completed).length
    })
  }

  return result
}

export function groupTasksByPriority(tasks: Task[]) {
  return {
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  }
}

export function getUpcomingTasks(tasks: Task[], limit: number = 3) {
  const now = new Date()
  return tasks
    .filter(t =>
      !t.completed &&
      t.due_date &&
      new Date(t.due_date) > now
    )
    .sort((a, b) =>
      new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime()
    )
    .slice(0, limit)
}

export function getRecentActivity(tasks: Task[], limit: number = 5) {
  return tasks
    .sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
    .slice(0, limit)
}
```

**Success Criteria:**
- [ ] All utility functions defined
- [ ] Proper TypeScript types
- [ ] Functions tested and working

---

### T004: Update API Service with Auth Headers
**File:** `frontend/src/services/api.ts`
**Priority:** HIGH
**Time:** 15 min

**Implementation:**
```typescript
import { getAuthToken } from '@/lib/auth-utils'

// Update all API calls to include auth token
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAuthToken()

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`)
  }

  return response.json()
}
```

**Success Criteria:**
- [ ] Auth token included in all requests
- [ ] Error handling improved
- [ ] No TypeScript errors

---

### T005: Create Skeleton Components
**File:** `frontend/src/components/dashboard/skeletons.tsx`
**Priority:** MEDIUM
**Time:** 20 min

**Implementation:**
```typescript
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="p-6">
          <Skeleton className="h-12 w-12 rounded-xl mb-4" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-20" />
        </Card>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className="h-64 w-full" />
    </Card>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-5 w-5 rounded" />
          <div className="flex-1">
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded" />
        </div>
      ))}
    </div>
  )
}
```

**Success Criteria:**
- [ ] All skeleton components created
- [ ] Match actual component layouts
- [ ] Smooth loading experience

---

### T006: Create Edit Task Modal
**File:** `frontend/src/components/dashboard/EditTaskModal.tsx`
**Priority:** HIGH
**Time:** 25 min

**Implementation:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { Task } from '@/types/task'

interface EditTaskModalProps {
  task: Task | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function EditTaskModal({ task, open, onClose, onSuccess }: EditTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        due_date: task.due_date || '',
      })
    }
  }, [task])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!task) return

    setLoading(true)

    try {
      const userId = await getCurrentUserId()
      await taskService.updateTask(userId, task.id, formData)

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to update task:', error)
      alert('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

**Success Criteria:**
- [ ] Modal opens with task data
- [ ] Form submits updates
- [ ] Validation works
- [ ] UI updates after edit
```

## Response Summary

Successfully implemented all four Phase 2 helper utilities for the dynamic dashboard:

1. **Task Utilities** (`frontend/src/lib/task-utils.ts`): Created all six required functions with proper TypeScript types and field name conversions to match the frontend Task interface.

2. **API Service Update** (`frontend/src/services/api.ts`): Added the `apiCall` function with proper auth headers while maintaining the existing axios interceptors.

3. **Skeleton Components** (`frontend/src/components/dashboard/skeletons.tsx`): Created all three skeleton components with proper UI structure.

4. **Edit Task Modal** (`frontend/src/components/dashboard/EditTaskModal.tsx`): Created a fully functional modal with proper form handling and field name conversions.

5. **Task Types Update** (`frontend/src/types/task.types.ts`): Updated the Task interface to include priority and tags fields as expected by the dashboard components.

All implementations follow TypeScript best practices and maintain compatibility with existing code.