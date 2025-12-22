# Specifications: Dynamic Dashboard Enhancement

## Hackathon II Phase 2 - Dashboard Transformation

---

## Document Information

**Project:** Hackathon II - Todo App Phase 2
**Location:** `C:\hackathon2-todo-app\frontend`
**Focus:** Dashboard Dynamic Enhancement
**Current Status:** Homepage ✅ Complete | Dashboard ❌ Static
**Target:** Fully Dynamic, Professional Dashboard
**Created:** December 14, 2025

---

## Executive Summary

### Current State Analysis

**What's Working (DON'T TOUCH):**
- ✅ Homepage (app/page.tsx) - Professional, perfect design
- ✅ Homepage components (HeroSection, Features, etc.)
- ✅ Authentication flow (login/signup)
- ✅ Backend API (FastAPI + SQLModel + Neon DB)
- ✅ Better Auth integration (JWT tokens)

**What Needs Fixing (CRITICAL):**
- ❌ Dashboard completely static (fake data)
- ❌ No API integration on dashboard
- ❌ No dashboard navbar
- ❌ No task management interface
- ❌ Dark mode colors incorrect (dark on dark)
- ❌ Charts don't update with real data
- ❌ No logout functionality on dashboard

---

## Problem Statement

### Issue 1: Static Dashboard
```
Current Behavior:
- Stats show hardcoded numbers (156, 124, 23, 9)
- Charts display fake data arrays
- No connection to backend API
- Numbers never change

Required Behavior:
- Stats fetch from GET /api/{user_id}/tasks
- Calculate stats from real tasks
- Charts update based on actual data
- Real-time updates when tasks change
```

### Issue 2: Missing Dashboard Navigation
```
Current State:
- No navbar on dashboard
- No way to logout
- No way to go back to home
- No user profile access

Required:
- Full dashboard navbar
- Logout button with JWT invalidation
- Home navigation link
- User profile dropdown
- Search bar for tasks
```

### Issue 3: No Task Management
```
Current State:
- Dashboard only shows charts
- No way to add tasks from dashboard
- No task list on dashboard
- Must go to /tasks page

Required:
- Add task button on dashboard
- Quick task list view
- Edit/Delete inline
- Complete/Uncomplete toggle
- Search and filter
- Import/Export functionality
```

### Issue 4: Dark Mode Color Issues
```
Problem:
- Dark colors used even in dark mode
- Charts hard to see (dark blue on dark bg)
- Low contrast text
- Unprofessional appearance

Solution:
- Bright colors for dark mode
- High contrast text
- Visible chart lines
- Professional appearance
```

---

## Technical Specifications

### Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  Dashboard Page                  │
│              (app/dashboard/page.tsx)            │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │      Dashboard Navbar (NEW)            │    │
│  │  [Logo] [Search] [Profile] [Logout]   │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │       Stats Cards (DYNAMIC)            │    │
│  │  API: GET /api/{user_id}/tasks         │    │
│  │  Calculate: total, completed, etc.     │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │       Charts (DYNAMIC)                 │    │
│  │  - Productivity Chart                  │    │
│  │  - Tasks Over Time                     │    │
│  │  - Priority Distribution               │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │    Task Management Panel (NEW)         │    │
│  │  [Add] [Search] [Import] [Export]      │    │
│  │  Task List with Actions                │    │
│  └────────────────────────────────────────┘    │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## API Integration Specifications

### Backend API (Already Exists)

**Base URL:** `http://localhost:8000`

**Endpoints Available:**
```typescript
// List all tasks for user
GET /api/{user_id}/tasks
Response: {
  tasks: Task[]
}

// Get single task
GET /api/{user_id}/tasks/{task_id}
Response: Task

// Create new task
POST /api/{user_id}/tasks
Body: {
  title: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  due_date?: string (ISO format)
  tags?: string[]
}
Response: Task

// Update task
PUT /api/{user_id}/tasks/{task_id}
Body: Partial<Task>
Response: Task

// Delete task
DELETE /api/{user_id}/tasks/{task_id}
Response: { message: string }

// Toggle completion
PATCH /api/{user_id}/tasks/{task_id}/complete
Response: Task
```

**Task Type:**
```typescript
interface Task {
  id: string
  title: string
  description: string | null
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date: string | null
  created_at: string
  updated_at: string
  user_id: string
  tags: string[]
}
```

**Authentication:**
```typescript
// JWT token from Better Auth
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}

// Get token from Better Auth session
const session = await auth.getSession()
const token = session?.accessToken
```

### API Service (Already Exists)

**File:** `frontend/src/services/api.ts`

**Available Functions:**
```typescript
// Already implemented - USE THESE
export const taskService = {
  getTasks: (userId: string) => Promise<Task[]>
  getTask: (userId: string, taskId: string) => Promise<Task>
  createTask: (userId: string, data: CreateTaskData) => Promise<Task>
  updateTask: (userId: string, taskId: string, data: UpdateTaskData) => Promise<Task>
  deleteTask: (userId: string, taskId: string) => Promise<void>
  toggleComplete: (userId: string, taskId: string) => Promise<Task>
}
```

---

## Component Specifications

### 1. Dashboard Navbar (NEW)

**File:** `frontend/src/components/dashboard/DashboardNavbar.tsx`

**Purpose:** Navigation and actions within dashboard

**Design Requirements:**
```typescript
// Layout
height: 64px (desktop), 56px (mobile)
position: sticky top-0
background: bg-white/80 dark:bg-gray-950/80
backdrop-blur: lg
border-bottom: 1px solid border color
z-index: 50

// Sections (Left to Right)
1. Logo + Brand (links to /dashboard)
2. Search Bar (center) - searches tasks
3. Quick Add Button
4. Notifications Icon (optional)
5. User Profile Dropdown
6. Logout Button
```

**Implementation:**
```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, Plus, Bell, User, LogOut, Home,
  Settings, HelpCircle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardNavbarProps {
  onSearch?: (query: string) => void
  onAddTask?: () => void
}

export function DashboardNavbar({ onSearch, onAddTask }: DashboardNavbarProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = async () => {
    // Call Better Auth logout
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    onSearch?.(e.target.value)
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-200
dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="font-heading font-bold text-lg text-gray-900 dark:text-gray-50 hidden sm:block">
              TaskFlow
            </span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Add */}
            <Button
              onClick={onAddTask}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/avatar.jpg" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-gray-500">john@example.com</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-error-600 dark:text-error-400"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
```

---

### 2. Dynamic Stats Cards (MODIFY EXISTING)

**File:** `frontend/src/components/dashboard/dashboard-stats.tsx`

**Current Problem:** Shows hardcoded numbers

**Solution:** Fetch from API and calculate

**Implementation:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { taskService } from '@/services/api'

export function DashboardStats() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get user ID from auth session
        const userId = await getCurrentUserId()

        // Fetch all tasks
        const tasks = await taskService.getTasks(userId)

        // Calculate stats
        const now = new Date()
        const calculated = {
          total: tasks.length,
          completed: tasks.filter(t => t.completed).length,
          pending: tasks.filter(t => !t.completed).length,
          overdue: tasks.filter(t =>
            !t.completed &&
            t.due_date &&
            new Date(t.due_date) < now
          ).length
        }

        setStats(calculated)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <StatsCardsSkeleton />
  }

  // ... rest of component (render cards with real stats)
}
```

---

### 3. Dynamic Charts (MODIFY EXISTING)

**Files to Modify:**
- `productivity-chart.tsx`
- `tasks-over-time-chart.tsx`
- `priority-distribution-chart.tsx`

**Common Pattern:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { taskService } from '@/services/api'

export function ProductivityChart() {
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const userId = await getCurrentUserId()
        const tasks = await taskService.getTasks(userId)

        // Process tasks into chart data
        const processed = processTasksForChart(tasks)
        setChartData(processed)
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <ChartSkeleton />
  }

  // ... render chart with real data
}
```

---

### 4. Task Management Panel (NEW)

**File:** `frontend/src/components/dashboard/TaskManagementPanel.tsx`

**Purpose:** Quick task operations from dashboard

**Features:**
- Add new task (modal)
- Task list (recent 10 tasks)
- Edit/Delete inline
- Complete/Uncomplete toggle
- Search bar
- Import/Export buttons

**Implementation:**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Upload, Download, Edit, Trash2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { taskService } from '@/services/api'
import { AddTaskModal } from './AddTaskModal'

export function TaskManagementPanel() {
  const [tasks, setTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    try {
      const userId = await getCurrentUserId()
      const allTasks = await taskService.getTasks(userId)

      // Filter and sort
      const filtered = searchQuery
        ? allTasks.filter(t =>
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : allTasks

      // Show recent 10
      const recent = filtered
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)

      setTasks(recent)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleComplete(taskId: string) {
    try {
      const userId = await getCurrentUserId()
      await taskService.toggleComplete(userId, taskId)
      await fetchTasks() // Refresh
    } catch (error) {
      console.error('Failed to toggle task:', error)
    }
  }

  async function handleDelete(taskId: string) {
    if (!confirm('Delete this task?')) return

    try {
      const userId = await getCurrentUserId()
      await taskService.deleteTask(userId, taskId)
      await fetchTasks() // Refresh
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  function handleExport() {
    const json = JSON.stringify(tasks, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tasks-${new Date().toISOString()}.json`
    a.click()
  }

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
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            fetchTasks()
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
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-primary-300
dark:hover:border-primary-700 transition-colors"
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
                  size="icon-sm"
                  onClick={() => {/* Edit logic */}}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
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
    </Card>
  )
}
```

---

### 5. Add Task Modal (NEW)

**File:** `frontend/src/components/dashboard/AddTaskModal.tsx`

```typescript
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { taskService } from '@/services/api'

interface AddTaskModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddTaskModal({ open, onClose, onSuccess }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '',
  })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const userId = await getCurrentUserId()
      await taskService.createTask(userId, formData)

      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        due_date: '',
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Failed to create task:', error)
      alert('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          {/* Priority */}
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

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## Dark Mode Color Specifications

### Problem Analysis
```
Current (WRONG):
dark:bg-gray-900      ← Too dark
dark:text-gray-600    ← Too dark (low contrast)
Chart lines: #1e40af  ← Dark blue (invisible on dark bg)
```

### Solution
```
Corrected Dark Mode:
Background: #0a0a0a (very dark, almost black)
Cards: #1a1a1a (slightly lighter)
Text: #f5f5f5 (very light, high contrast)
Borders: #404040 (visible gray)

Charts:
- Lines: #60a5fa (bright blue)
- Areas: #3b82f680 (semi-transparent bright blue)
- Bars: #3b82f6 (solid bright blue)
- Grid: #404040 (visible gray)
```

**Complete Dark Mode Color System:**
```typescript
// tailwind.config.ts - Dark Mode Overrides
'.dark': {
  // Backgrounds
  background: {
    DEFAULT: '#0a0a0a',
    card: '#1a1a1a',
    muted: '#262626',
  },

  // Text (HIGH CONTRAST)
  foreground: {
    DEFAULT: '#f5f5f5',
    muted: '#a3a3a3',
  },

  // Borders (VISIBLE)
  border: {
    DEFAULT: '#404040',
    strong: '#525252',
  },

  // Chart Colors (BRIGHT)
  chart: {
    primary: '#60a5fa',      // Bright blue
    success: '#4ade80',      // Bright green
    warning: '#fbbf24',      // Bright amber
    error: '#f87171',        // Bright red
    grid: '#404040',         // Visible gray
  }
}
```

---

## File Modifications Required

### Files to CREATE (New):
```
1. components/dashboard/DashboardNavbar.tsx
2. components/dashboard/TaskManagementPanel.tsx
3. components/dashboard/AddTaskModal.tsx
4. lib/auth-utils.ts (helper for getting user ID)
```

### Files to MODIFY (Make Dynamic):
```
1. app/dashboard/page.tsx
   - Add DashboardNavbar
   - Add TaskManagementPanel
   - Remove static data

2. components/dashboard/dashboard-stats.tsx
   - Add API integration
   - Calculate from real tasks
   - Add loading states

3. components/dashboard/productivity-chart.tsx
   - Fetch real tasks
   - Process for chart data
   - Fix dark mode colors

4. components/dashboard/tasks-over-time-chart.tsx
   - Fetch real tasks
   - Group by time period
   - Fix dark mode colors

5. components/dashboard/priority-distribution-chart.tsx
   - Fetch real tasks
   - Count by priority
   - Fix dark mode colors

6. components/dashboard/recent-activity.tsx
   - Fetch real tasks
   - Show actual changes
   - Add time formatting

7. components/dashboard/upcoming-tasks.tsx
   - Fetch real tasks
   - Filter by due date
   - Sort by urgency

8. tailwind.config.ts
   - Update dark mode colors
   - Add chart color tokens
```

### Files to LEAVE UNCHANGED:
```
❌ app/page.tsx (homepage)
❌ components/HeroSection.tsx
❌ components/WhyChooseSection.tsx
❌ components/DemoPreviewSection.tsx
❌ components/TechStackSection.tsx
❌ components/AuthenticationCTASection.tsx
❌ components/layout/Footer.tsx
❌ All homepage-related components
```

---

## Helper Functions

### Get Current User ID
```typescript
// lib/auth-utils.ts
import { auth } from '@/lib/auth'

export async function getCurrentUserId(): Promise<string> {
  const session = await auth.getSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }
  return session.user.id
}

export async function getAuthToken(): Promise<string> {
  const session = await auth.getSession()
  if (!session?.accessToken) {
    throw new Error('No auth token')
  }
  return session.accessToken
}
```

---

## Testing Requirements

### Functionality Testing
```
✅ Dashboard loads without errors
✅ Stats show real numbers from API
✅ Charts display actual task data
✅ Can add new task
✅ Can edit existing task
✅ Can delete task
✅ Can toggle completion
✅ Search works
✅ Export works
✅ Logout works
✅ Navigation works
```

### Visual Testing
```
✅ Dark mode colors are bright/visible
✅ Charts readable in both modes
✅ Text has high contrast
✅ Navbar responsive
✅ Task list responsive
✅ Modal works on mobile
```

### Performance Testing
```
✅ Stats load within 1 second
✅ Charts render smoothly
✅ Task operations instant
✅ No console errors
✅ No memory leaks
```

---

## Success Criteria

### Technical Success
- [ ] All dashboard data from API
- [ ] Charts update in real-time
- [ ] CRUD operations functional
- [ ] Authentication working
- [ ] Error handling proper

### Design Success
- [ ] Dark mode colors correct
- [ ] Professional appearance
- [ ] Consistent with homepage
- [ ] Fully responsive
- [ ] Smooth animations

### User Experience
- [ ] Fast and responsive
- [ ] Intuitive navigation
- [ ] Clear feedback
- [ ] Easy task management
- [ ] No confusion

---

## Bonus Points Impact

**Current State:** Homepage ✅ Good design (some points)

**After Dashboard Enhancement:**
- ✅ Full CRUD functionality
- ✅ Professional dashboard
- ✅ Real-time updates
- ✅ Advanced features (search, filter, export)
- ✅ Perfect dark mode

**Expected Bonus Points:** +30-40 points for exceptional implementation

---

**Status:** 📋 Complete Specifications Ready
**Next Step:** Create detailed tasks.md document
**Target:** Professional, Dynamic Dashboard

---

*End of Specifications Document*