---
id: 1
title: advanced-todo-features-spec
stage: spec
date: 2026-01-16
surface: agent
model: sonnet-4-5-20250929
feature: advanced-todo-features
branch: 1-advanced-todo-features
user: claude
command: /sp.specify
labels: [specification, todo-app, recurring-tasks, reminders, kafka, dapr]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-advanced-todo-features/spec.md
  - specs/1-advanced-todo-features/checklists/requirements.md
tests: []
---

# Advanced Todo App Features Specification

## Prompt

```
# 🚀 ADVANCED TODO APP FEATURES SPECIFICATION
**Version:** 2.0
**Date:** January 16, 2026
**Focus:** Advanced Features Implementation

---

## 📋 TABLE OF CONTENTS
1. [Overview](#overview)
2. [Features to Implement](#features-to-implement)
3. [Architecture](#architecture)
4. [Recurring Tasks](#recurring-tasks)
5. [Due Dates & Reminders](#due-dates-reminders)
6. [Event-Driven Architecture (Kafka)](#event-driven-architecture)
7. [Dapr Integration](#dapr-integration)
8. [Implementation Guide](#implementation-guide)
9. [Testing](#testing)

---

## 1. OVERVIEW

### Scope
**SKIP** (Already Implemented):
- ❌ Priorities (high/medium/low)
- ❌ Tags management
- ❌ Search functionality
- ❌ Filter & Sort

**IMPLEMENT** (Advanced Features):
- ✅ Recurring Tasks (daily, weekly, monthly)
- ✅ Due Dates with timezone support
- ✅ Smart Reminders (15min, 1hr, 1day before)
- ✅ Event-Driven Architecture (Kafka/Redpanda)
- ✅ Dapr distributed runtime
- ✅ Real-time notifications with professional UI

---

## 2. FEATURES TO IMPLEMENT

### 2.1 Recurring Tasks ♻️
**Description:** Tasks that automatically recreate after completion

**User Stories:**
- As a user, I can set a task to repeat daily/weekly/monthly
- When I complete a recurring task, a new instance is created for next occurrence
- I can view all instances of a recurring task series
- I can edit/delete the entire series or single instance

**Database Changes:**
```sql
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN frequency VARCHAR(20); -- 'daily', 'weekly', 'monthly'
ALTER TABLE tasks ADD COLUMN recurrence_end_date TIMESTAMP;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN recurrence_pattern JSONB; -- For complex patterns
```

**Frequency Options:**
- Daily: Every day at same time
- Weekly: Every week on same day
- Monthly: Every month on same date
- Custom: Advanced patterns (e.g., every Monday and Friday)

---

### 2.2 Due Dates & Reminders ⏰
**Description:** Tasks with deadlines and smart notification system

**User Stories:**
- I can set due date with time for any task
- I receive notifications before task is due
- I can customize reminder timing (15min, 1hr, 1day before)
- Overdue tasks are highlighted in red
- Due today tasks show special indicator

**Database Changes:**
```sql
ALTER TABLE tasks ADD COLUMN reminder_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE tasks ADD COLUMN reminder_timing VARCHAR(20); -- '15min', '1hr', '1day'
ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
ALTER TABLE tasks ADD COLUMN is_overdue BOOLEAN GENERATED ALWAYS AS (
  due_date < NOW() AND completed = FALSE
) STORED;
```

**Reminder Types:**
| Type | Timing | Use Case |
|------|--------|----------|
| Urgent | 15 minutes before | Important meetings |
| Standard | 1 hour before | Regular tasks |
| Advanced | 1 day before | Long-term planning |
| Custom | User-defined | Flexible scheduling |

---

### 2.3 Event-Driven Architecture 🔄
**Description:** Kafka-based event streaming for real-time features

**Components:**
1. **Event Producer** (Backend API)
   - Publishes events on task operations
   - Topics: task-events, reminders, recurring-tasks

2. **Event Consumer** (Notification Service)
   - Consumes events from Kafka
   - Triggers notifications
   - Updates task states

3. **WebSocket Broker**
   - Maintains client connections
   - Broadcasts real-time updates

**Kafka Topics:**
```
task-events:
  - TASK_CREATED
  - TASK_UPDATED
  - TASK_COMPLETED
  - TASK_DELETED
  - TASK_RECURRING_CREATED

reminders:
  - REMINDER_DUE_15MIN
  - REMINDER_DUE_1HR
  - REMINDER_DUE_1DAY
  - REMINDER_OVERDUE

recurring-tasks:
  - RECURRENCE_TRIGGERED
  - RECURRENCE_SERIES_UPDATED
  - RECURRENCE_SERIES_DELETED
```

---

### 2.4 Dapr Integration 🎯
**Description:** Distributed Application Runtime for microservices

**Why Dapr?**
- Service-to-service invocation
- State management
- Pub/Sub messaging
- Observability & monitoring
- Secrets management

**Dapr Components:**
```yaml
# dapr/components/pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: task-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"
    - name: authType
      value: "sasl"
    - name: saslUsername
      value: "todo-app-user"
    - name: saslPassword
      value: "Admin12345"

---
# dapr/components/statestore.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      value: "postgresql://..."
```

---

## 3. RECURRING TASKS

### 3.1 Backend Implementation

#### Database Schema
```python
# models.py - Add to Task model
class Task(Base):
    # ... existing fields ...

    # Recurring task fields
    is_recurring = Column(Boolean, default=False)
    frequency = Column(String(20))  # 'daily', 'weekly', 'monthly', 'custom'
    recurrence_end_date = Column(DateTime(timezone=True))
    parent_task_id = Column(Integer, ForeignKey('tasks.id'))
    recurrence_pattern = Column(JSON)  # For complex patterns

    # Relationships
    parent_task = relationship("Task", remote_side=[id], backref="recurrences")
```

#### API Endpoints
```python
# routers/recurring_tasks.py

@router.post("/users/me/tasks", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Create task with optional recurring configuration
    """
    task = Task(
        title=task_data.title,
        description=task_data.description,
        due_date=task_data.due_date,
        is_recurring=task_data.is_recurring,
        frequency=task_data.frequency,
        recurrence_end_date=task_data.recurrence_end_date,
        user_id=current_user.id
    )

    db.add(task)
    db.commit()

    # Publish event
    await publish_kafka_event({
        "event_type": "TASK_CREATED",
        "task_id": task.id,
        "is_recurring": task.is_recurring,
        "frequency": task.frequency
    })

    return task


@router.put("/users/me/tasks/{task_id}/complete")
async def complete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session)
):
    """
    Complete task and create next occurrence if recurring
    """
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(404, "Task not found")

    # Mark as completed
    task.completed = True
    task.completed_at = datetime.utcnow()

    # If recurring, create next instance
    if task.is_recurring:
        next_due_date = calculate_next_occurrence(
            task.due_date,
            task.frequency
        )

        # Check if within recurrence period
        if not task.recurrence_end_date or next_due_date <= task.recurrence_end_date:
            new_task = Task(
                title=task.title,
                description=task.description,
                due_date=next_due_date,
                priority=task.priority,
                is_recurring=True,
                frequency=task.frequency,
                recurrence_end_date=task.recurrence_end_date,
                parent_task_id=task.parent_task_id or task.id,
                user_id=task.user_id
            )

            db.add(new_task)
            db.commit()

            # Publish recurring task created event
            await publish_kafka_event({
                "event_type": "TASK_RECURRING_CREATED",
                "task_id": new_task.id,
                "parent_task_id": task.id,
                "next_due_date": next_due_date.isoformat()
            })

    db.commit()
    return {"message": "Task completed", "recurring_created": task.is_recurring}


def calculate_next_occurrence(current_due: datetime, frequency: str) -> datetime:
    """Calculate next occurrence based on frequency"""
    if frequency == 'daily':
        return current_due + timedelta(days=1)
    elif frequency == 'weekly':
        return current_due + timedelta(weeks=1)
    elif frequency == 'monthly':
        # Add one month (handle edge cases)
        next_month = current_due.month + 1 if current_due.month < 12 else 1
        next_year = current_due.year if current_due.month < 12 else current_due.year + 1
        return current_due.replace(month=next_month, year=next_year)
    else:
        return current_due
```

#### Dapr Service Invocation
```python
# services/dapr_service.py

import httpx

class DaprService:
    def __init__(self):
        self.dapr_port = 3500
        self.base_url = f"http://localhost:{self.dapr_port}"

    async def publish_event(self, topic: str, event: dict):
        """Publish event via Dapr pubsub"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1.0/publish/task-pubsub/{topic}",
                json=event
            )
            return response.json()

    async def save_state(self, key: str, value: dict):
        """Save state via Dapr state store"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/v1.0/state/statestore",
                json=[{
                    "key": key,
                    "value": value
                }]
            )
            return response.status_code == 204

    async def get_state(self, key: str):
        """Get state via Dapr state store"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/v1.0/state/statestore/{key}"
            )
            return response.json()
```

---

### 3.2 Frontend Implementation

#### Schemas
```typescript
// types/task.types.ts

export interface RecurringConfig {
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  endDate?: string;
  pattern?: {
    daysOfWeek?: number[];  // [0-6] for Sunday-Saturday
    dayOfMonth?: number;    // 1-31
    interval?: number;      // Every N days/weeks/months
  };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';

  // Recurring fields
  isRecurring: boolean;
  recurringConfig?: RecurringConfig;
  parentTaskId?: string;
  recurrenceEndDate?: string;

  createdAt: string;
  updatedAt: string;
}
```

#### Components

**RecurringTaskModal.tsx**
```typescript
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';

interface RecurringTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: RecurringConfig) => void;
}

export default function RecurringTaskModal({ isOpen, onClose, onSave }: RecurringTaskModalProps) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [endDate, setEndDate] = useState<Date | undefined>();

  const handleSave = () => {
    if (isRecurring) {
      onSave({
        frequency,
        endDate: endDate?.toISOString(),
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recurring Task Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Enable Recurring */}
          <div className="flex items-center justify-between">
            <Label htmlFor="recurring">Make this task recurring</Label>
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
          </div>

          {isRecurring && (
            <>
              {/* Frequency */}
              <div className="space-y-2">
                <Label>Repeat every</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <option value="daily">Day</option>
                  <option value="weekly">Week</option>
                  <option value="monthly">Month</option>
                </Select>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End date (optional)</Label>
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => date < new Date()}
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**RecurringTaskBadge.tsx**
```typescript
'use client';

import { RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RecurringTaskBadgeProps {
  frequency: string;
  className?: string;
}

export default function RecurringTaskBadge({ frequency, className }: RecurringTaskBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={`flex items-center gap-1 ${className}`}
      style={{
        backgroundColor: 'var(--purple-100)',
        color: 'var(--purple-700)',
        border: '1px solid var(--purple-300)'
      }}
    >
      <RefreshCw className="h-3 w-3" />
      <span className="capitalize">{frequency}</span>
    </Badge>
  );
}
```

---

## 4. DUE DATES & REMINDERS

### 4.1 Backend Implementation

#### Notification Service
```python
# microservices/notification_service.py

import asyncio
from datetime import datetime, timedelta
from sqlalchemy import and_, or_
from aiokafka import AIOKafkaProducer
import json

class NotificationService:
    def __init__(self, db_session, kafka_producer):
        self.db = db_session
        self.producer = kafka_producer
        self.scan_interval = 30  # seconds

    async def start(self):
        """Start the notification service"""
        print("🚀 Notification Service Started")

        while True:
            await self.scan_and_notify()
            await asyncio.sleep(self.scan_interval)

    async def scan_and_notify(self):
        """Scan for tasks needing reminders"""
        now = datetime.utcnow()

        # Find tasks with reminders enabled
        tasks = self.db.query(Task).filter(
            and_(
                Task.completed == False,
                Task.due_date.isnot(None),
                Task.reminder_enabled == True,
                Task.reminder_sent == False
            )
        ).all()

        for task in tasks:
            time_until_due = task.due_date - now
            minutes_until_due = time_until_due.total_seconds() / 60

            # Check if reminder should be sent
            should_send = False
            reminder_type = None

            if task.reminder_timing == '15min' and 0 < minutes_until_due <= 15:
                should_send = True
                reminder_type = 'REMINDER_DUE_15MIN'
            elif task.reminder_timing == '1hr' and 0 < minutes_until_due <= 60:
                should_send = True
                reminder_type = 'REMINDER_DUE_1HR'
            elif task.reminder_timing == '1day' and 0 < minutes_until_due <= 1440:
                should_send = True
                reminder_type = 'REMINDER_DUE_1DAY'
            elif minutes_until_due < 0:
                should_send = True
                reminder_type = 'REMINDER_OVERDUE'

            if should_send:
                await self.send_reminder(task, reminder_type, minutes_until_due)

    async def send_reminder(self, task: Task, reminder_type: str, minutes_until_due: float):
        """Send reminder to Kafka"""
        event = {
            "event_type": reminder_type,
            "task_id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "due_date": task.due_date.isoformat(),
            "time_until_due_minutes": int(minutes_until_due),
            "priority": task.priority,
            "timestamp": datetime.utcnow().isoformat()
        }

        # Publish to Kafka
        await self.producer.send_and_wait(
            'reminders',
            value=json.dumps(event).encode('utf-8')
        )

        # Mark as sent
        task.reminder_sent = True
        self.db.commit()

        print(f"📤 Reminder sent: {task.title} ({reminder_type})")
```

#### Timezone Support
```python
# utils/timezone_utils.py

from datetime import datetime
import pytz

def ensure_utc_datetime(dt: datetime, user_timezone: str = 'UTC') -> datetime:
    """Convert datetime to UTC from user's timezone"""
    if dt is None:
        return None

    if dt.tzinfo is None:
        # Assume user's timezone
        user_tz = pytz.timezone(user_timezone)
        dt = user_tz.localize(dt)

    # Convert to UTC
    return dt.astimezone(pytz.UTC)

def format_due_date(dt: datetime, user_timezone: str = 'UTC') -> str:
    """Format datetime in user's timezone"""
    if dt is None:
        return None

    user_tz = pytz.timezone(user_timezone)
    local_dt = dt.astimezone(user_tz)

    return local_dt.strftime('%Y-%m-%d %H:%M %Z')
```

---

### 4.2 Frontend Implementation

#### Reminder Settings Component
```typescript
// components/ReminderSettings.tsx

'use client';

import { useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ReminderSettingsProps {
  enabled: boolean;
  timing: '15min' | '1hr' | '1day';
  onChange: (enabled: boolean, timing: string) => void;
}

export default function ReminderSettings({ enabled, timing, onChange }: ReminderSettingsProps) {
  const [reminderEnabled, setReminderEnabled] = useState(enabled);
  const [reminderTiming, setReminderTiming] = useState(timing);

  const handleEnabledChange = (checked: boolean) => {
    setReminderEnabled(checked);
    onChange(checked, reminderTiming);
  };

  const handleTimingChange = (value: string) => {
    setReminderTiming(value as '15min' | '1hr' | '1day');
    onChange(reminderEnabled, value);
  };

  return (
    <Card className="border" style={{ borderColor: 'var(--border)' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4" />
          Reminder Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Enable Reminder */}
        <div className="flex items-center justify-between">
          <Label htmlFor="reminder-enabled" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Enable reminder
          </Label>
          <Switch
            id="reminder-enabled"
            checked={reminderEnabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {/* Timing */}
        {reminderEnabled && (
          <div className="space-y-2">
            <Label>Remind me</Label>
            <Select value={reminderTiming} onValueChange={handleTimingChange}>
              <option value="15min">15 minutes before</option>
              <option value="1hr">1 hour before</option>
              <option value="1day">1 day before</option>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Due Date Indicator
```typescript
// components/DueDateIndicator.tsx

'use client';

import { Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface DueDateIndicatorProps {
  dueDate: string;
  completed: boolean;
}

export default function DueDateIndicator({ dueDate, completed }: DueDateIndicatorProps) {
  const due = new Date(dueDate);
  const now = new Date();
  const isOverdue = due < now && !completed;
  const isDueToday = due.toDateString() === now.toDateString();

  const getColor = () => {
    if (completed) return 'var(--muted-foreground)';
    if (isOverdue) return '#EF4444';
    if (isDueToday) return '#F59E0B';
    return 'var(--primary)';
  };

  const getIcon = () => {
    if (isOverdue) return <AlertCircle className="h-3 w-3" />;
    return <Clock className="h-3 w-3" />;
  };

  const getLabel = () => {
    if (completed) return 'Completed';
    if (isOverdue) return `Overdue ${formatDistanceToNow(due, { addSuffix: true })}`;
    if (isDueToday) return 'Due today';
    return `Due ${formatDistanceToNow(due, { addSuffix: true })}`;
  };

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1"
      style={{
        borderColor: getColor(),
        color: getColor()
      }}
    >
      {getIcon()}
      <span className="text-xs">{getLabel()}</span>
    </Badge>
  );
}
```

---

## 5. EVENT-DRIVEN ARCHITECTURE

### 5.1 Kafka Event Schema

```typescript
// Event Types
interface BaseEvent {
  event_type: string;
  timestamp: string;
  user_id: string;
}

interface TaskEvent extends BaseEvent {
  event_type:
    | 'TASK_CREATED'
    | 'TASK_UPDATED'
    | 'TASK_COMPLETED'
    | 'TASK_DELETED'
    | 'TASK_RECURRING_CREATED';
  task_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: string;
  is_recurring: boolean;
  frequency?: string;
}

interface ReminderEvent extends BaseEvent {
  event_type:
    | 'REMINDER_DUE_15MIN'
    | 'REMINDER_DUE_1HR'
    | 'REMINDER_DUE_1DAY'
    | 'REMINDER_OVERDUE';
  task_id: string;
  title: string;
  due_date: string;
  time_until_due_minutes: number;
  priority: string;
}

interface RecurringEvent extends BaseEvent {
  event_type:
    | 'RECURRENCE_TRIGGERED'
    | 'RECURRENCE_SERIES_UPDATED'
    | 'RECURRENCE_SERIES_DELETED';
  task_id: string;
  parent_task_id?: string;
  next_due_date?: string;
  frequency: string;
}
```

### 5.2 Event Producers

```python
# services/event_producer.py

from aiokafka import AIOKafkaProducer
import json
from datetime import datetime

class EventProducer:
    def __init__(self):
        self.producer = None

    async def start(self):
        """Initialize Kafka producer"""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=['d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
            security_protocol='SASL_SSL',
            sasl_mechanism='SCRAM-SHA-256',
            ssl_context=True,
            sasl_plain_username='todo-app-user',
            sasl_plain_password='Admin12345',
            value_serializer=lambda v: json.dumps(v).encode('utf-8')
        )
        await self.producer.start()

    async def publish_task_event(self, event_type: str, task: Task):
        """Publish task event to task-events topic"""
        event = {
            "event_type": event_type,
            "task_id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "description": task.description,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "priority": task.priority,
            "is_recurring": task.is_recurring,
            "frequency": task.frequency,
            "completed": task.completed,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.producer.send_and_wait('task-events', value=event)
        print(f"📤 Published {event_type} to task-events")

    async def publish_reminder_event(self, reminder_type: str, task: Task, minutes_until_due: int):
        """Publish reminder event to reminders topic"""
        event = {
            "event_type": reminder_type,
            "task_id": task.id,
            "user_id": task.user_id,
            "title": task.title,
            "due_date": task.due_date.isoformat(),
            "time_until_due_minutes": minutes_until_due,
            "priority": task.priority,
            "timestamp": datetime.utcnow().isoformat()
        }

        await self.producer.send_and_wait('reminders', value=event)
        print(f"📤 Published {reminder_type} to reminders")

    async def stop(self):
        """Stop producer"""
        if self.producer:
            await self.producer.stop()
```

### 5.3 Event Consumers

```python
# microservices/notification_consumer.py

from aiokafka import AIOKafkaConsumer
import json
from fastapi import FastAPI, WebSocket
from typing import Dict, Set

app = FastAPI()

# Store active WebSocket connections
connected_clients: Dict[int, Set[WebSocket]] = {}

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket endpoint for real-time notifications"""
    await websocket.accept()

    # Add to connected clients
    if user_id not in connected_clients:
        connected_clients[user_id] = set()
    connected_clients[user_id].add(websocket)

    try:
        # Keep connection alive with ping/pong
        while True:
            await websocket.receive_text()  # Wait for ping
            await websocket.send_text('pong')
    except:
        # Remove on disconnect
        connected_clients[user_id].remove(websocket)
        if not connected_clients[user_id]:
            del connected_clients[user_id]

async def consume_events():
    """Consume events from Kafka and broadcast to WebSocket clients"""
    consumer = AIOKafkaConsumer(
        'task-events',
        'reminders',
        'recurring-tasks',
        bootstrap_servers=['d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092'],
        security_protocol='SASL_SSL',
        sasl_mechanism='SCRAM-SHA-256',
        ssl_context=True,
        sasl_plain_username='todo-app-user',
        sasl_plain_password='Admin12345',
        value_deserializer=lambda m: json.loads(m.decode('utf-8')),
        group_id='notification-consumer-group'
    )

    await consumer.start()
    print("✅ Consumer started - listening to topics")

    try:
        async for message in consumer:
            event = message.value
            user_id = event.get('user_id')

            # Create notification based on event type
            notification = create_notification_from_event(event, message.topic)

            # Broadcast to user's WebSocket connections
            if user_id in connected_clients:
                for ws in connected_clients[user_id]:
                    try:
                        await ws.send_json(notification)
                    except:
                        pass  # Client disconnected
    finally:
        await consumer.stop()

def create_notification_from_event(event: dict, topic: str) -> dict:
    """Map Kafka event to notification format"""
    event_type = event.get('event_type')

    # Map event types to notification configs
    notification_config = {
        'TASK_CREATED': {
            'type': 'success',
            'title': 'Task Created',
            'icon': 'CheckCircle2'
        },
        'TASK_UPDATED': {
            'type': 'info',
            'title': 'Task Updated',
            'icon': 'Info'
        },
        'TASK_COMPLETED': {
            'type': 'success',
            'title': 'Task Completed',
            'icon': 'CheckCircle2'
        },
        'TASK_DELETED': {
            'type': 'warning',
            'title': 'Task Deleted',
            'icon': 'AlertTriangle'
        },
        'TASK_RECURRING_CREATED': {
            'type': 'info',
            'title': 'Recurring Task Created',
            'icon': 'RefreshCw'
        },
        'REMINDER_DUE_15MIN': {
            'type': 'reminder',
            'title': '⏰ Task Due Soon',
            'icon': 'Clock'
        },
        'REMINDER_DUE_1HR': {
            'type': 'reminder',
            'title': '⏰ Task Due in 1 Hour',
            'icon': 'Clock'
        },
        'REMINDER_DUE_1DAY': {
            'type': 'reminder',
            'title': '⏰ Task Due Tomorrow',
            'icon': 'Clock'
        },
        'REMINDER_OVERDUE': {
            'type': 'error',
            'title': '🔴 Task Overdue',
            'icon': 'AlertCircle'
        }
    }

    config = notification_config.get(event_type, {
        'type': 'info',
        'title': 'Notification',
        'icon': 'Info'
    })

    return {
        'type': config['type'],
        'title': config['title'],
        'message': event.get('title', 'Task updated'),
        'taskId': event.get('task_id'),
        'userId': event.get('user_id'),
        'timestamp': event.get('timestamp'),
        'icon': config['icon']
    }
```

---

## 6. DAPR INTEGRATION

### 6.1 Installation & Setup

```bash
# Install Dapr CLI
powershell -Command "iwr -useb https://raw.githubusercontent.com/dapr/cli/master/install/install.ps1 | iex"

# Initialize Dapr
dapr init

# Verify installation
dapr --version
```

### 6.2 Dapr Components

**pubsub.yaml**
```yaml
# dapr/components/pubsub.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: task-pubsub
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "d5k1l0mudu05l9vrg3lg.any.us-east-1.mpx.prd.cloud.redpanda.com:9092"
    - name: authType
      value: "sasl"
    - name: saslUsername
      value: "todo-app-user"
    - name: saslPassword
      value: "Admin12345"
    - name: saslMechanism
      value: "SCRAM-SHA-256"
    - name: tlsEnable
      value: "true"
```

**statestore.yaml**
```yaml
# dapr/components/statestore.yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      value: "host=localhost user=postgres password=postgres database=todo_db port=5432 sslmode=disable"
```

### 6.3 Backend with Dapr

```python
# Run backend with Dapr
# Command: dapr run --app-id backend-api --app-port 8000 --dapr-http-port 3500 -- python main.py

from fastapi import FastAPI
import httpx

app = FastAPI()
DAPR_HTTP_PORT = 3500

@app.post("/tasks")
async def create_task(task: TaskCreate):
    """Create task and publish event via Dapr"""

    # Save task to database
    task_obj = Task(**task.dict())
    db.add(task_obj)
    db.commit()

    # Publish event via Dapr Pub/Sub
    async with httpx.AsyncClient() as client:
        await client.post(
            f"http://localhost:{DAPR_HTTP_PORT}/v1.0/publish/task-pubsub/task-events",
            json={
                "event_type": "TASK_CREATED",
                "task_id": task_obj.id,
                "title": task_obj.title,
                # ... other fields
            }
        )

    return task_obj

@app.get("/tasks/{task_id}")
async def get_task(task_id: int):
    """Get task from Dapr state store"""

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"http://localhost:{DAPR_HTTP_PORT}/v1.0/state/statestore/task_{task_id}"
        )
        return response.json()
```

### 6.4 Frontend with Dapr (via API)

```typescript
// services/daprService.ts

const DAPR_HTTP_PORT = 3500;
const BACKEND_APP_ID = 'backend-api';

export class DaprService {
  // Invoke backend service via Dapr
  async invokeService(method: string, endpoint: string, data?: any) {
    const response = await fetch(
      `http://localhost:${DAPR_HTTP_PORT}/v1.0/invoke/${BACKEND_APP_ID}/method${endpoint}`,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      }
    );

    return response.json();
  }

  // Publish event
  async publishEvent(topic: string, event: any) {
    await fetch(
      `http://localhost:${DAPR_HTTP_PORT}/v1.0/publish/task-pubsub/${topic}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );
  }

  // Get state
  async getState(key: string) {
    const response = await fetch(
      `http://localhost:${DAPR_HTTP_PORT}/v1.0/state/statestore/${key}`
    );
    return response.json();
  }
}
```

---

## 7. IMPLEMENTATION GUIDE

### 7.1 File Structure

```
backend/
├── dapr/
│   └── components/
│       ├── pubsub.yaml
│       └── statestore.yaml
├── microservices/
│   ├── notification_consumer.py       ← UPDATE (add recurring events)
│   └── notification_service.py        ← UPDATE (add reminder logic)
├── routers/
│   ├── tasks.py                       ← UPDATE (add recurring support)
│   └── recurring_tasks.py             ← NEW
├── services/
│   ├── event_producer.py              ← NEW
│   └── dapr_service.py                ← NEW
├── utils/
│   └── timezone_utils.py              ← NEW
└── models.py                          ← UPDATE (add recurring fields)

frontend/
├── src/
│   ├── components/
│   │   ├── RecurringTaskModal.tsx     ← NEW
│   │   ├── RecurringTaskBadge.tsx     ← NEW
│   │   ├── ReminderSettings.tsx       ← NEW
│   │   ├── DueDateIndicator.tsx       ← NEW
│   │   ├── ToastProvider.tsx          ← KEEP (already done)
│   │   └── WebSocketNotificationListener.tsx ← UPDATE (add recurring events)
│   ├── services/
│   │   └── daprService.ts             ← NEW
│   └── types/
│       └── task.types.ts              ← UPDATE (add recurring types)
```

### 7.2 Implementation Steps

#### Phase 1: Database Schema (1 hour)
1. Run migrations to add recurring fields
2. Add reminder fields
3. Add timezone support

```sql
-- migrations/add_recurring_features.sql
ALTER TABLE tasks ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN frequency VARCHAR(20);
ALTER TABLE tasks ADD COLUMN recurrence_end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id);
ALTER TABLE tasks ADD COLUMN recurrence_pattern JSONB;
ALTER TABLE tasks ADD COLUMN reminder_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE tasks ADD COLUMN reminder_timing VARCHAR(20) DEFAULT '1hr';
ALTER TABLE tasks ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';
```

#### Phase 2: Backend Implementation (3-4 hours)
1. Update models.py
2. Create event_producer.py service
3. Update tasks.py router (add recurring logic)
4. Create recurring_tasks.py router
5. Update notification_service.py (add reminder scanning)
6. Update notification_consumer.py (handle recurring events)
7. Add timezone utilities

#### Phase 3: Dapr Setup (1 hour)
1. Install Dapr CLI
2. Create component files
3. Test Dapr pub/sub
4. Integrate with backend

#### Phase 4: Frontend Implementation (3-4 hours)
1. Update task types
2. Create RecurringTaskModal component
3. Create RecurringTaskBadge component
4. Create ReminderSettings component
5. Create DueDateIndicator component
6. Update WebSocketNotificationListener
7. Add Dapr service integration

#### Phase 5: Testing (2 hours)
1. Test recurring task creation
2. Test reminder notifications
3. Test Kafka event flow
4. Test Dapr integration
5. End-to-end testing

---

## 8. TESTING

### 8.1 Unit Tests

```python
# tests/test_recurring_tasks.py

import pytest
from datetime import datetime, timedelta

def test_create_recurring_task():
    """Test creating a recurring task"""
    task_data = {
        "title": "Daily standup",
        "is_recurring": True,
        "frequency": "daily",
        "due_date": datetime.now() + timedelta(days=1)
    }

    response = client.post("/api/users/me/tasks", json=task_data)
    assert response.status_code == 201
    assert response.json()["is_recurring"] == True
    assert response.json()["frequency"] == "daily"

def test_complete_recurring_task():
    """Test completing recurring task creates next instance"""
    # Create recurring task
    task = create_recurring_task()

    # Complete it
    response = client.put(f"/api/users/me/tasks/{task.id}/complete")
    assert response.status_code == 200

    # Verify next instance created
    tasks = client.get("/api/users/me/tasks").json()
    next_task = [t for t in tasks if t["parent_task_id"] == task.id][0]
    assert next_task is not None
    assert next_task["due_date"] > task["due_date"]

def test_reminder_notification():
    """Test reminder is sent at correct time"""
    # Create task due in 30 minutes
    due_date = datetime.now() + timedelta(minutes=30)
    task = create_task(due_date=due_date, reminder_timing="15min")

    # Wait for notification service to scan
    time.sleep(60)

    # Check reminder was sent
    task = get_task(task.id)
    assert task.reminder_sent == True
```

### 8.2 Integration Tests

```typescript
// tests/recurring-tasks.test.ts

describe('Recurring Tasks', () => {
  test('creates recurring task with daily frequency', async () => {
    const task = await createTask({
      title: 'Daily workout',
      isRecurring: true,
      recurringConfig: {
        frequency: 'daily',
      },
    });

    expect(task.isRecurring).toBe(true);
    expect(task.recurringConfig.frequency).toBe('daily');
  });

  test('completes recurring task and creates next instance', async () => {
    const task = await createRecurringTask();
    await completeTask(task.id);

    const tasks = await getTasks();
    const nextInstance = tasks.find(t => t.parentTaskId === task.id);

    expect(nextInstance).toBeDefined();
    expect(new Date(nextInstance.dueDate) > new Date(task.dueDate)).toBe(true);
  });

  test('displays recurring badge', async () => {
    render(<TaskList tasks={[recurringTask]} />);

    const badge = screen.getByText(/daily/i);
    expect(badge).toBeInTheDocument();
  });
});

describe('Reminders', () => {
  test('sends reminder 15 minutes before due time', async () => {
    const dueDate = addMinutes(new Date(), 20);
    await createTask({
      title: 'Important meeting',
      dueDate,
      reminderTiming: '15min'
    });

    // Wait for notification
    await waitFor(() => {
      expect(screen.getByText(/Important meeting/)).toBeInTheDocument();
    }, { timeout: 60000 });
  });
});
```

---

## 9. DEPLOYMENT CHECKLIST

### Backend
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Dapr initialized
- [ ] Notification service running
- [ ] Notification consumer running
- [ ] Kafka topics created

### Frontend
- [ ] Environment variables set
- [ ] WebSocket connection tested
- [ ] Dapr service integration tested
- [ ] UI components rendering correctly

### Monitoring
- [ ] Kafka consumer lag monitoring
- [ ] WebSocket connection monitoring
- [ ] Notification delivery rate
- [ ] Error rate tracking

---

## 10. SUMMARY

### New Features Added
✅ Recurring Tasks (daily, weekly, monthly)
✅ Due Dates with timezone support
✅ Smart Reminders (15min, 1hr, 1day before)
✅ Event-Driven Architecture (Kafka/Redpanda)
✅ Dapr Integration for microservices
✅ Professional notification UI (already done)
✅ Real-time WebSocket updates

### Files Created/Updated
**Backend:**
- ✅ models.py - Add recurring fields
- ✅ routers/recurring_tasks.py - New router
- ✅ services/event_producer.py - New service
- ✅ services/dapr_service.py - New service
- ✅ microservices/notification_consumer.py - Updated
- ✅ microservices/notification_service.py - Updated
- ✅ utils/timezone_utils.py - New utility

**Frontend:**
- ✅ components/RecurringTaskModal.tsx - New
- ✅ components/RecurringTaskBadge.tsx - New
- ✅ components/ReminderSettings.tsx - New
- ✅ components/DueDateIndicator.tsx - New
- ✅ services/daprService.ts - New
- ✅ types/task.types.ts - Updated

**Dapr:**
- ✅ dapr/components/pubsub.yaml - New
- ✅ dapr/components/statestore.yaml - New

### Estimated Timeline
- Database Schema: 1 hour
- Backend Implementation: 3-4 hours
- Dapr Setup: 1 hour
- Frontend Implementation: 3-4 hours
- Testing: 2 hours
**Total: 10-12 hours**

---

**END OF SPECIFICATION**
**Status:** Ready for Implementation
**Version:** 2.0
**Last Updated:** January 16, 2026 do not override and remove any existing specs just create a new folder and create specs in it
```

## Response

Created comprehensive specification for advanced todo app features:
- Created spec file at specs/1-advanced-todo-features/spec.md
- Created quality checklist at specs/1-advanced-todo-features/checklists/requirements.md
- Created new branch 1-advanced-todo-features
- Specification includes recurring tasks, due dates with timezone support, smart reminders, event-driven architecture with Kafka, and Dapr integration
- All requirements are testable and technology-agnostic
- Success criteria defined with measurable outcomes