import { Task } from '@/types/task.types'

// ✅ Add safety check helper
function ensureArray(data: any): Task[] {
  if (!data) return [];
  return Array.isArray(data) ? data : [];
}

export function calculateStats(tasks: Task[] | any) {
  const taskArray = ensureArray(tasks);
  const now = new Date();
  
  return {
    total: taskArray.length,
    completed: taskArray.filter((t: Task) => t.completed).length,
    pending: taskArray.filter((t: Task) => !t.completed).length,
    overdue: taskArray.filter((t: Task) =>
      !t.completed &&
      t.dueDate &&
      new Date(t.dueDate) < now
    ).length
  }
}

export function groupTasksByDay(tasks: Task[] | any, days: number = 7) {
  const taskArray = ensureArray(tasks);
  const result = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' })
    const dateStr = date.toISOString().split('T')[0]

    const dayTasks = taskArray.filter((t: Task) =>
      t.createdAt?.startsWith(dateStr)
    )

    result.push({
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Group tasks by month, given an array of tasks and a number of months to group.
 * @param tasks The array of tasks to group.
 * @param months The number of months to group tasks by. Defaults to 6.
 * @returns An array of objects with month names and the number of completed tasks in that month.
 */
/*******  4f98c2a9-1fb1-4041-b3ff-dd739a896b66  *******/      day: dayName,
      completed: dayTasks.filter((t: Task) => t.completed).length,
      created: dayTasks.length
    })
  }

  return result
}

export function groupTasksByMonth(tasks: Task[] | any, months: number = 6) {
  const taskArray = ensureArray(tasks);
  const result = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthName = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    const month = date.getMonth()

    const monthTasks = taskArray.filter((t: Task) => {
      const taskDate = new Date(t.createdAt)
      return taskDate.getFullYear() === year && taskDate.getMonth() === month
    })

    result.push({
      month: monthName,
      tasks: monthTasks.filter((t: Task) => t.completed).length
    })
  }

  return result
}

export function groupTasksByPriority(tasks: Task[] | any) {
  const taskArray = ensureArray(tasks);
  
  return {
    high: taskArray.filter((t: Task) => t.priority === 'high').length,
    medium: taskArray.filter((t: Task) => t.priority === 'medium').length,
    low: taskArray.filter((t: Task) => t.priority === 'low').length,
  }
}

export function getUpcomingTasks(tasks: Task[] | any, limit: number = 3) {
  const taskArray = ensureArray(tasks);
  const now = new Date();
  
  return taskArray
    .filter((t: Task) =>
      !t.completed &&
      t.dueDate &&
      new Date(t.dueDate) > now
    )
    .sort((a: Task, b: Task) =>
      new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
    )
    .slice(0, limit)
}

export function getRecentActivity(tasks: Task[] | any, limit: number = 5) {
  const taskArray = ensureArray(tasks);
  
  return taskArray
    .sort((a: Task, b: Task) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    .slice(0, limit)
}