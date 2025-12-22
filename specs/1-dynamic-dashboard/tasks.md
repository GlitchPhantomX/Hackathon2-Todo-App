# Implementation Tasks: Dynamic Dashboard Enhancement (COMPLETE)

## Feature Overview

Transform the static dashboard into a dynamic, professional dashboard with real-time data from the backend API. This includes implementing API integration for stats and charts, adding a dashboard navigation system, creating task management functionality directly on the dashboard, and fixing dark mode color issues.

## Implementation Strategy

**MVP Scope**: Implement the core dashboard functionality with stats and basic task management. This will include the DashboardNavbar, dynamic stats cards, and TaskManagementPanel as the foundational features.

**Incremental Delivery**:
- Phase 1: Setup and foundational components
- Phase 2: Helper utilities and shared functions
- Phase 3: Core dashboard functionality (stats, navbar, basic task management)
- Phase 4: Charts and data visualization
- Phase 5: Advanced features (edit, import/export, activity)
- Phase 6: Dark mode and polish
- Phase 7: Testing and integration

## Dependencies

- Backend API with Better Auth authentication must be running
- Existing taskService in `frontend/src/services/api.ts` must be functional
- Tailwind CSS configuration available for styling

## Parallel Execution Examples

Each user story can be developed independently with the following parallel opportunities:
- UI components (DashboardNavbar, TaskManagementPanel, AddTaskModal) can be developed in parallel
- Chart components can be developed in parallel after data transformation functions are established
- Dark mode fixes can be applied across components in parallel

---

## Phase 1: Setup & Configuration (2 tasks)

### T001: Create Auth Utilities
**File:** `frontend/src/lib/auth-utils.ts`  
**Priority:** CRITICAL  
**Time:** 20 min

**Implementation:**
```typescript
import { auth } from '@/lib/auth'

export async function getCurrentUserId(): Promise<string> {
  const session = await auth.getSession()
  if (!session?.user?.id) {
    throw new Error('User not authenticated')
  }
  return session.user.id
}

export async function getAuthToken(): Promise<string> {
  const session = await auth.getSession()
  if (!session?.accessToken) {
    throw new Error('No authentication token')
  }
  return session.accessToken
}

export async function getUserInfo() {
  const session = await auth.getSession()
  return {
    id: session?.user?.id || '',
    name: session?.user?.name || 'User',
    email: session?.user?.email || '',
    avatar: session?.user?.image || null,
    initials: getInitials(session?.user?.name || 'User'),
  }
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
```

**Success Criteria:**
- [ ] File created at correct location
- [ ] All functions implemented
- [ ] Proper error handling
- [ ] TypeScript types correct

---

### T002: Update Tailwind Config for Dark Mode
**File:** `frontend/tailwind.config.ts`  
**Priority:** HIGH  
**Time:** 20 min

**Implementation:**
```typescript
theme: {
  extend: {
    colors: {
      // Chart colors optimized for dark mode
      chart: {
        1: '#60a5fa',  // Bright blue
        2: '#4ade80',  // Bright green
        3: '#fbbf24',  // Bright amber
        4: '#f87171',  // Bright red
        5: '#a78bfa',  // Bright purple
      }
    }
  }
}
```

**Success Criteria:**
- [ ] Colors defined
- [ ] Build succeeds
- [ ] No errors

---

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

---

## Phase 3: Core Components (6 tasks)

### T007: Create DashboardNavbar Component
**File:** `frontend/src/components/dashboard/DashboardNavbar.tsx`  
**Priority:** CRITICAL  
**Time:** 30 min

**Implementation:**
Complete implementation from Specifications document.

**Success Criteria:**
- [ ] Component created
- [ ] All imports working
- [ ] No TypeScript errors
- [ ] Component exports correctly

---

### T008: Implement Navbar Search Functionality
**Location:** Inside DashboardNavbar  
**Priority:** HIGH  
**Time:** 15 min

**Success Criteria:**
- [ ] Search input updates state
- [ ] Callback prop works
- [ ] Debouncing implemented

---

### T009: Implement Navbar User Profile Dropdown
**Location:** Inside DashboardNavbar  
**Priority:** HIGH  
**Time:** 20 min

**Success Criteria:**
- [ ] Dropdown shows user info
- [ ] Menu items link correctly
- [ ] Avatar displays with initials

---

### T010: Implement Navbar Logout Functionality
**Location:** Inside DashboardNavbar  
**Priority:** CRITICAL  
**Time:** 15 min

**Success Criteria:**
- [ ] Logout API call works
- [ ] Redirects to login
- [ ] Session cleared

---

### T011: Create AddTaskModal Component
**File:** `frontend/src/components/dashboard/AddTaskModal.tsx`  
**Priority:** HIGH  
**Time:** 25 min

**Implementation:**
Complete implementation from Specifications document.

**Success Criteria:**
- [ ] Modal component created
- [ ] Form structure correct
- [ ] Dialog opens/closes

---

### T012: Create TaskManagementPanel Component
**File:** `frontend/src/components/dashboard/TaskManagementPanel.tsx`  
**Priority:** CRITICAL  
**Time:** 35 min

**Implementation:**
Complete implementation from Specifications document.

**Success Criteria:**
- [ ] Component structure correct
- [ ] All features included
- [ ] Proper state management

---

## Phase 4: [US1] Dynamic Stats Cards (5 tasks)

**Story Goal**: Replace hardcoded stats with real data from API

**Independent Test Criteria**:
- Stats cards display actual task counts from API
- Stats update automatically every 30 seconds
- Loading and error states are properly handled

### T013: Update Stats Structure to Use Client State
**File:** `frontend/src/components/dashboard/dashboard-stats.tsx`  
**Priority:** CRITICAL  
**Time:** 15 min

**Success Criteria:**
- [ ] Component converted to client component
- [ ] State hooks added
- [ ] Imports correct

---

### T014: Implement Stats Fetching from API
**Location:** Inside dashboard-stats.tsx  
**Priority:** CRITICAL  
**Time:** 20 min

**Success Criteria:**
- [ ] Stats fetch from API
- [ ] Calculations correct using calculateStats()
- [ ] Auto-refresh works (30s interval)
- [ ] Error handling present

---

### T015: Add Loading States for Stats
**Location:** Inside dashboard-stats.tsx  
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] StatsCardsSkeleton shows while loading
- [ ] Smooth transition
- [ ] No layout shift

---

### T016: Remove Number Animation
**Location:** Inside dashboard-stats.tsx  
**Priority:** LOW  
**Time:** 5 min

**Success Criteria:**
- [ ] Numbers display instantly
- [ ] No animation bugs
- [ ] Real numbers show correctly

---

### T017: Add Error Handling for Stats
**Location:** Inside dashboard-stats.tsx  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Error state displays
- [ ] Retry button works
- [ ] User-friendly error message

---

## Phase 5: [US2] Dashboard Navigation (4 tasks)

**Story Goal**: Add full navigation system to dashboard

**Independent Test Criteria**:
- Dashboard has a functional navbar with search and user profile
- Users can navigate between dashboard sections
- Logout functionality works correctly

### T018: Integrate DashboardNavbar into Dashboard Page
**File:** `frontend/src/app/dashboard/page.tsx`  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Navbar imported
- [ ] Navbar renders at top
- [ ] Props passed correctly

---

### T019: Implement Search Callback in Dashboard
**Location:** Dashboard page  
**Priority:** MEDIUM  
**Time:** 15 min

**Success Criteria:**
- [ ] Search filters tasks
- [ ] Results update in real-time
- [ ] Clear search works

---

### T020: Test Logout Flow
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Logout button works
- [ ] Session cleared
- [ ] Redirects to login

---

### T021: Test Responsive Navbar
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] Works on mobile
- [ ] Works on tablet
- [ ] Works on desktop
- [ ] No layout breaks

---

## Phase 6: [US3] Task Management on Dashboard (8 tasks)

**Story Goal**: Enable task management directly from dashboard

**Independent Test Criteria**:
- Users can add new tasks from dashboard
- Users can view and manage recent tasks
- Users can complete/incomplete tasks
- Users can delete tasks with confirmation
- Users can edit tasks

### T022: Integrate TaskManagementPanel into Dashboard
**File:** `frontend/src/app/dashboard/page.tsx`  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Panel imported
- [ ] Panel renders in correct position
- [ ] Receives necessary props

---

### T023: Implement Task Fetching in Panel
**Location:** TaskManagementPanel  
**Priority:** CRITICAL  
**Time:** 15 min

**Success Criteria:**
- [ ] Tasks load from API
- [ ] Search filters work
- [ ] Sorting correct (recent first)
- [ ] Shows recent 10 tasks

---

### T024: Implement Task Toggle Complete
**Location:** TaskManagementPanel  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Toggle works via API
- [ ] UI updates immediately
- [ ] No errors

---

### T025: Implement Task Delete with Confirmation
**Location:** TaskManagementPanel  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Confirmation dialog shows
- [ ] Delete works via API
- [ ] List refreshes

---

### T026: Implement Task Edit Flow
**Location:** TaskManagementPanel  
**Priority:** HIGH  
**Time:** 15 min

**Success Criteria:**
- [ ] Edit button opens EditTaskModal
- [ ] Modal pre-fills with task data
- [ ] Updates work correctly

---

### T027: Integrate AddTaskModal to Panel
**Location:** TaskManagementPanel  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Add button opens modal
- [ ] Modal creates task
- [ ] List refreshes after create

---

### T028: Implement Export Functionality
**Location:** TaskManagementPanel  
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] Export button works
- [ ] JSON file downloads
- [ ] Data includes all visible tasks

---

### T029: Implement Import Functionality
**File:** `frontend/src/components/dashboard/ImportTasksModal.tsx` (NEW)  
**Priority:** LOW  
**Time:** 25 min

**Implementation:**
```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
      
      // Import each task
      for (const task of tasks) {
        await taskService.createTask(userId, {
          title: task.title,
          description: task.description,
          priority: task.priority || 'medium',
          due_date: task.due_date,
        })
      }
      
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Import failed:', error)
      alert('Failed to import tasks')
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
```

**Success Criteria:**
- [ ] Import modal created
- [ ] File upload works
- [ ] JSON parsing correct
- [ ] Tasks created via API

---

## Phase 7: [US4] Dynamic Charts (10 tasks)

**Story Goal**: Replace static charts with real data visualizations

**Independent Test Criteria**:
- Charts display actual task data from API
- Charts update automatically when tasks change
- Charts are readable in both light and dark modes

### T030: Make Productivity Chart Dynamic
**File:** `frontend/src/components/dashboard/productivity-chart.tsx`  
**Priority:** CRITICAL  
**Time:** 25 min

**Success Criteria:**
- [ ] Fetches tasks from API
- [ ] Uses groupTasksByDay() utility
- [ ] Shows last 7 days
- [ ] Chart updates with real data

---

### T031: Fix Productivity Chart Dark Mode Colors
**Location:** productivity-chart.tsx  
**Priority:** HIGH  
**Time:** 10 min

**Implementation:**
```typescript
<Area
  stroke="#60a5fa"  // Bright blue
  fill="url(#completedGradient)"
/>
<Area
  stroke="#4ade80"  // Bright green
  fill="url(#createdGradient)"
/>
```

**Success Criteria:**
- [ ] Bright colors in dark mode
- [ ] Visible chart lines
- [ ] Good contrast

---

### T032: Add Loading State to Productivity Chart
**Location:** productivity-chart.tsx  
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] ChartSkeleton shows while loading
- [ ] Smooth transition
- [ ] No layout shift

---

### T033: Make Tasks Over Time Chart Dynamic
**File:** `frontend/src/components/dashboard/tasks-over-time-chart.tsx`  
**Priority:** CRITICAL  
**Time:** 25 min

**Success Criteria:**
- [ ] Fetches tasks from API
- [ ] Uses groupTasksByMonth() utility
- [ ] Shows last 6 months
- [ ] Bar heights accurate

---

### T034: Fix Tasks Over Time Dark Mode Colors
**Location:** tasks-over-time-chart.tsx  
**Priority:** HIGH  
**Time:** 10 min

**Success Criteria:**
- [ ] Bars visible in dark mode
- [ ] Uses bright blue (#3b82f6)
- [ ] Good contrast

---

### T035: Add Loading State to Tasks Over Time Chart
**Location:** tasks-over-time-chart.tsx  
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] Skeleton shows while loading
- [ ] Smooth transition

---

### T036: Make Priority Distribution Chart Dynamic
**File:** `frontend/src/components/dashboard/priority-distribution-chart.tsx`  
**Priority:** CRITICAL  
**Time:** 25 min

**Success Criteria:**
- [ ] Fetches tasks from API
- [ ] Uses groupTasksByPriority() utility
- [ ] Real priority counts
- [ ] Percentages accurate

---

### T037: Fix Priority Chart Dark Mode Colors
**Location:** priority-distribution-chart.tsx  
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] Colors visible in dark
- [ ] Legend readable
- [ ] Good contrast

---

### T038: Add Loading State to Priority Chart
**Location:** priority-distribution-chart.tsx  
**Priority:** MEDIUM  
**Time:** 10 min

**Success Criteria:**
- [ ] Skeleton shows while loading
- [ ] Smooth transition

---

### T039: Test All Charts Together
**Priority:** HIGH  
**Time:** 15 min

**Success Criteria:**
- [ ] All charts load data
- [ ] Data accuracy verified
- [ ] Dark mode tested
- [ ] Responsive tested
- [ ] No console errors

---

## Phase 8: Additional Dashboard Components (6 tasks)

### T040: Make Recent Activity Dynamic
**File:** `frontend/src/components/dashboard/recent-activity.tsx`  
**Priority:** HIGH  
**Time:** 20 min

**Implementation:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertCircle, Edit3 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { getRecentActivity } from '@/lib/task-utils'
import { Task } from '@/types/task'

export function RecentActivity() {
  const [activities, setActivities] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchActivity() {
      try {
        const userId = await getCurrentUserId()
        const tasks = await taskService.getTasks(userId)
        const recent = getRecentActivity(tasks, 5)
        setActivities(recent)
      } catch (error) {
        console.error('Failed to fetch activity:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  const getActivityIcon = (task: Task) => {
    if (task.completed) return CheckCircle2
    if (task.due_date && new Date(task.due_date) < new Date()) return AlertCircle
    return Clock
  }

  const getActivityColor = (task: Task) => {
    if (task.completed) return 'text-success-600 dark:text-success-400'
    if (task.due_date && new Date(task.due_date) < new Date()) return 'text-error-600 dark:text-error-400'
    return 'text-primary-600 dark:text-primary-400'
  }

  if (loading) {
    return <Card className="p-6"><TaskListSkeleton /></Card>
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Recent Activity
        </h3>
      </div>

      <div className="space-y-4">
        {activities.map((task) => {
          const Icon = getActivityIcon(task)
          return (
            <div
              key={task.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${getActivityColor(task)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                  {task.title}
                </p>
                <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
```

**Success Criteria:**
- [ ] Shows recent tasks from API
- [ ] Times formatted correctly
- [ ] Icons indicate task status
- [ ] Colors appropriate

---

### T041: Make Upcoming Tasks Dynamic
**File:** `frontend/src/components/dashboard/upcoming-tasks.tsx`  
**Priority:** HIGH  
**Time:** 20 min

**Implementation:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Flag } from 'lucide-react'
import { format } from 'date-fns'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'
import { getUpcomingTasks } from '@/lib/task-utils'
import { Task } from '@/types/task'

const priorityConfig = {
  high: { color: 'bg-error-500', label: 'High' },
  medium: { color: 'bg-warning-500', label: 'Medium' },
  low: { color: 'bg-gray-400 dark:bg-gray-600', label: 'Low' },
}

export function UpcomingTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const userId = await getCurrentUserId()
        const allTasks = await taskService.getTasks(userId)
        const upcoming = getUpcomingTasks(allTasks, 3)
        setTasks(upcoming)
      } catch (error) {
        console.error('Failed to fetch upcoming tasks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcoming()
  }, [])

  if (loading) {
    return <Card className="p-6"><TaskListSkeleton /></Card>
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-h3 text-gray-900 dark:text-gray-50">
          Upcoming Tasks
        </h3>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className="text-center py-8 text-gray-500">
            No upcoming tasks
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-body-sm font-medium text-gray-900 dark:text-gray-50 flex-1">
                  {task.title}
                </p>
                <Badge 
                  variant="secondary"
                  className={`${priorityConfig[task.priority].color} text-white gap-1`}
                >
                  <Flag className="w-3 h-3 fill-current" />
                  {priorityConfig[task.priority].label}
                </Badge>
              </div>
              {task.due_date && (
                <div className="flex items-center gap-2 text-body-xs text-gray-500 dark:text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(task.due_date), 'MMM d, h:mm a')}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
```

**Success Criteria:**
- [ ] Shows upcoming tasks from API
- [ ] Filtered by due date (future only)
- [ ] Sorted by due date (soonest first)
- [ ] Shows max 3 tasks

---

### T042: Update Quick Actions Component
**File:** `frontend/src/components/dashboard/quick-actions.tsx`  
**Priority:** MEDIUM  
**Time:** 15 min

**Implementation:**
Add import/export functionality to quick actions.

**Success Criteria:**
- [ ] Import button opens ImportTasksModal
- [ ] Export button downloads JSON
- [ ] Other actions work correctly

---

### T043: Add Auto-Refresh to All Components
**Priority:** MEDIUM  
**Time:** 20 min

**Implementation:**
Add interval-based refresh to all components that fetch data.

**Success Criteria:**
- [ ] All components refresh every 30s
- [ ] Intervals cleaned up on unmount
- [ ] No memory leaks

---

### T044: Create Dashboard Context for Shared State
**File:** `frontend/src/contexts/DashboardContext.tsx` (NEW)  
**Priority:** LOW  
**Time:** 30 min

**Implementation:**
```typescript
'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Task } from '@/types/task'
import { taskService } from '@/services/api'
import { getCurrentUserId } from '@/lib/auth-utils'

interface DashboardContextType {
  tasks: Task[]
  loading: boolean
  error: Error | null
  refreshTasks: () => Promise<void>
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshTasks = async () => {
    try {
      setLoading(true)
      const userId = await getCurrentUserId()
      const fetchedTasks = await taskService.getTasks(userId)
      setTasks(fetchedTasks)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshTasks, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <DashboardContext.Provider value={{ tasks, loading, error, refreshTasks }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (!context) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return context
}
```

**Success Criteria:**
- [ ] Context created
- [ ] Provider wraps dashboard
- [ ] All components use context
- [ ] Reduces duplicate API calls

---

### T045: Implement Error Boundaries
**File:** `frontend/src/components/dashboard/DashboardErrorBoundary.tsx` (NEW)  
**Priority:** MEDIUM  
**Time:** 20 min

**Implementation:**
```typescript
'use client'

import { Component, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Dashboard error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertCircle className="w-12 h-12 text-error-500 mb-4" />
          <h2 className="text-h3 font-heading mb-2">Something went wrong</h2>
          <p className="text-body-md text-gray-600 dark:text-gray-400 mb-4">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <Button onClick={() => window.location.reload()}>
            Reload Dashboard
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
```

**Success Criteria:**
- [ ] Error boundary created
- [ ] Catches component errors
- [ ] Shows user-friendly message
- [ ] Reload button works

---

## Phase 9: [US5] Dark Mode Enhancement (4 tasks)

**Story Goal**: Fix dark mode color issues throughout dashboard

**Independent Test Criteria**:
- All dashboard elements are visible and readable in dark mode
- Chart colors are bright and distinguishable in dark mode
- Text has proper contrast ratios in dark mode
- UI elements follow consistent dark mode styling

### T046: Update All Chart Colors for Dark Mode
**Files:** All chart components  
**Priority:** HIGH  
**Time:** 25 min

**Success Criteria:**
- [ ] All charts use bright colors
- [ ] Visible in dark mode
- [ ] Consistent color scheme

---

### T047: Fix Text Contrast in Dashboard
**Files:** All dashboard components  
**Priority:** MEDIUM  
**Time:** 15 min

**Success Criteria:**
- [ ] All text readable in dark
- [ ] Proper contrast ratios
- [ ] No low-contrast issues

---

### T048: Update Card Backgrounds for Dark Mode
**Files:** All card components  
**Priority:** MEDIUM  
**Time:** 15 min

**Success Criteria:**
- [ ] Cards visible in dark mode
- [ ] Good separation from background
- [ ] Professional appearance

---

### T049: Comprehensive Dark Mode Testing
**Priority:** HIGH  
**Time:** 30 min

**Test Checklist:**
- [ ] Toggle dark mode
- [ ] Check all components
- [ ] Verify chart visibility
- [ ] Check text readability
- [ ] Test on different screens
- [ ] Document any issues

**Success Criteria:**
- [ ] All elements visible
- [ ] Professional appearance
- [ ] Consistent styling

---

## Phase 10: Integration & Testing (8 tasks)

### T050: Update Dashboard Page Layout
**File:** `frontend/src/app/dashboard/page.tsx`  
**Priority:** CRITICAL  
**Time:** 20 min

**Implementation:**
```typescript
import { DashboardProvider } from '@/contexts/DashboardContext'
import { DashboardErrorBoundary } from '@/components/dashboard/DashboardErrorBoundary'
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar'
// ... all other imports

export default function DashboardPage() {
  return (
    <DashboardProvider>
      <DashboardErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <DashboardNavbar />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats */}
            <DashboardStats />

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <ProductivityChart />
              <TasksOverTimeChart />
            </div>

            {/* Secondary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <PriorityDistributionChart />
              <RecentActivity />
              <UpcomingTasks />
            </div>

            {/* Task Management */}
            <TaskManagementPanel />
          </div>
        </div>
      </DashboardErrorBoundary>
    </DashboardProvider>
  )
}
```

**Success Criteria:**
- [ ] All components integrated
- [ ] Layout correct
- [ ] Provider wraps correctly
- [ ] Error boundary in place

---

### T051: Add Page Loading State
**Location:** Dashboard page  
**Priority:** MEDIUM  
**Time:** 15 min

**Success Criteria:**
- [ ] Loading state shows on initial load
- [ ] Skeleton components used
- [ ] Smooth transition

---

### T052: Test Backend API Integration
**Priority:** CRITICAL  
**Time:** 30 min

**Test Checklist:**
- [ ] Backend running
- [ ] API endpoints responding
- [ ] Auth tokens working
- [ ] CRUD operations functional
- [ ] Error responses handled

**Success Criteria:**
- [ ] All API calls work
- [ ] No 401/403 errors
- [ ] Data flows correctly

---

### T053: Test Better Auth Integration
**Priority:** CRITICAL  
**Time:** 20 min

**Test Checklist:**
- [ ] Login works
- [ ] Session persists
- [ ] Token refresh works
- [ ] Logout works
- [ ] Protected routes work

**Success Criteria:**
- [ ] Auth fully functional
- [ ] No auth errors
- [ ] Session management correct

---

### T054: Functional Testing
**Priority:** CRITICAL  
**Time:** 45 min

**Complete Test Checklist:**
- [ ] Dashboard loads
- [ ] Stats show real numbers
- [ ] Charts display data
- [ ] Can add task
- [ ] Can edit task
- [ ] Can delete task
- [ ] Can toggle complete
- [ ] Search works
- [ ] Export works
- [ ] Import works
- [ ] Logout works
- [ ] Navbar responsive
- [ ] Auto-refresh works

**Success Criteria:**
- [ ] All features functional
- [ ] No console errors
- [ ] No visual bugs

---

### T055: Visual & Responsive Testing
**Priority:** HIGH  
**Time:** 30 min

**Test Checklist:**
- [ ] Light mode looks good
- [ ] Dark mode looks good
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Charts readable all sizes
- [ ] Text legible all sizes
- [ ] No horizontal scroll

**Success Criteria:**
- [ ] Professional appearance
- [ ] Fully responsive
- [ ] No layout breaks

---

### T056: Performance Testing
**Priority:** MEDIUM  
**Time:** 20 min

**Test Checklist:**
- [ ] Page load < 2s
- [ ] Charts render smooth
- [ ] No memory leaks
- [ ] API calls efficient
- [ ] No console warnings
- [ ] Bundle size reasonable

**Success Criteria:**
- [ ] Fast performance
- [ ] Smooth interactions
- [ ] No performance issues

---

### T057: Cross-Browser Testing
**Priority:** MEDIUM  
**Time:** 30 min

**Test On:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if Mac)
- [ ] Edge (latest)

**Success Criteria:**
- [ ] Works on all browsers
- [ ] No layout issues
- [ ] No functionality issues

---

## Summary

**Total Tasks:** 57  
**Estimated Time:** 18-22 hours

**Priority Breakdown:**
- CRITICAL: 16 tasks
- HIGH: 23 tasks
- MEDIUM: 16 tasks
- LOW: 2 tasks

**Phase Breakdown:**
- Phase 1: Setup (2 tasks)
- Phase 2: Utilities (4 tasks)
- Phase 3: Core Components (6 tasks)
- Phase 4: Stats (5 tasks)
- Phase 5: Navigation (4 tasks)
- Phase 6: Task Management (8 tasks)
- Phase 7: Charts (10 tasks)
- Phase 8: Additional Components (6 tasks)
- Phase 9: Dark Mode (4 tasks)
- Phase 10: Integration & Testing (8 tasks)

**Files to CREATE:**
1. lib/auth-utils.ts
2. lib/task-utils.ts
3. components/dashboard/skeletons.tsx
4. components/dashboard/DashboardNavbar.tsx
5. components/dashboard/AddTaskModal.tsx
6. components/dashboard/EditTaskModal.tsx
7. components/dashboard/TaskManagementPanel.tsx
8. components/dashboard/ImportTasksModal.tsx
9. components/dashboard/DashboardErrorBoundary.tsx
10. contexts/DashboardContext.tsx

**Files to MODIFY:**
1. tailwind.config.ts
2. services/api.ts
3. app/dashboard/page.tsx
4. components/dashboard/dashboard-stats.tsx
5. components/dashboard/productivity-chart.tsx
6. components/dashboard/tasks-over-time-chart.tsx
7. components/dashboard/priority-distribution-chart.tsx
8. components/dashboard/recent-activity.tsx
9. components/dashboard/upcoming-tasks.tsx
10. components/dashboard/quick-actions.tsx

**Files PROTECTED (Do Not Touch):**
- app/page.tsx
- All homepage components
- Authentication pages

---

**Ready for Claude Code implementation!** 🚀