import { randomUUID } from 'node:crypto'
import type { Row } from '@libsql/client'
import type { Task, TaskListResponse, TaskPayload, TaskSort, TaskStatus } from '#shared/types/task'
import { getDatabase } from './database'

interface StarterTask {
  title: string
  description: string
  status: TaskStatus
  daysFromToday: number
}

const starterTasks: StarterTask[] = [
  {
    title: 'Welcome to TaskFlow',
    description: 'Your workspace is ready. Mark this task complete when you are ready to get started.',
    status: 'done',
    daysFromToday: 1,
  },
  {
    title: 'Plan your first project',
    description: 'Break your next project into clear, manageable tasks.',
    status: 'in_progress',
    daysFromToday: 2,
  },
  {
    title: 'Create your first task',
    description: 'Add a task of your own, set a due date, and track its progress.',
    status: 'pending',
    daysFromToday: 3,
  },
]

function relativeDate(daysFromToday: number) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromToday)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function rowToTask(row: Row): Task {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    status: String(row.status) as TaskStatus,
    dueDate: String(row.due_date),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  }
}

interface ListTasksOptions {
  search: string
  status: TaskStatus | 'all'
  sort: TaskSort
  page: number
  pageSize: number
}

export async function listTasks(ownerId: string, options: ListTasksOptions): Promise<TaskListResponse> {
  const result = await getDatabase().execute({
    sql: `
      SELECT id, title, description, status, due_date, created_at, updated_at
      FROM tasks
      WHERE owner_id = ?
    `,
    args: [ownerId],
  })
  const ownerTasks = result.rows.map(rowToTask)
  const normalizedSearch = options.search.trim().toLowerCase()
  const filteredTasks = ownerTasks.filter((task) => {
    const matchesSearch = !normalizedSearch || task.title.toLowerCase().includes(normalizedSearch)
    const matchesStatus = options.status === 'all' || task.status === options.status

    return matchesSearch && matchesStatus
  })

  filteredTasks.sort((first, second) => {
    if (options.sort === 'newest') {
      return second.createdAt.localeCompare(first.createdAt)
    }

    if (options.sort === 'active_due_asc') {
      const firstIsDone = first.status === 'done' ? 1 : 0
      const secondIsDone = second.status === 'done' ? 1 : 0

      return firstIsDone - secondIsDone || first.dueDate.localeCompare(second.dueDate)
    }

    const direction = options.sort === 'due_desc' ? -1 : 1
    return first.dueDate.localeCompare(second.dueDate) * direction
  })

  const total = filteredTasks.length
  const totalPages = Math.max(1, Math.ceil(total / options.pageSize))
  const page = Math.min(options.page, totalPages)
  const offset = (page - 1) * options.pageSize

  return {
    items: filteredTasks.slice(offset, offset + options.pageSize),
    page,
    pageSize: options.pageSize,
    total,
    totalPages,
    stats: {
      total: ownerTasks.length,
      pending: ownerTasks.filter(task => task.status === 'pending').length,
      inProgress: ownerTasks.filter(task => task.status === 'in_progress').length,
      done: ownerTasks.filter(task => task.status === 'done').length,
    },
  }
}

export async function findTask(ownerId: string, id: string) {
  const result = await getDatabase().execute({
    sql: `
      SELECT id, title, description, status, due_date, created_at, updated_at
      FROM tasks
      WHERE owner_id = ? AND id = ?
      LIMIT 1
    `,
    args: [ownerId, id],
  })

  return result.rows[0] ? rowToTask(result.rows[0]) : null
}

export async function createTask(ownerId: string, payload: TaskPayload) {
  const timestamp = new Date().toISOString()
  const task: Task = {
    id: randomUUID(),
    title: payload.title.trim(),
    description: payload.description.trim(),
    status: payload.status,
    dueDate: payload.dueDate,
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  await getDatabase().execute({
    sql: `
      INSERT INTO tasks (
        id, owner_id, title, description, status, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      task.id,
      ownerId,
      task.title,
      task.description,
      task.status,
      task.dueDate,
      task.createdAt,
      task.updatedAt,
    ],
  })

  return task
}

export async function createStarterTasks(ownerId: string) {
  const timestamp = new Date().toISOString()
  const tasks: Task[] = starterTasks.map(task => ({
    id: randomUUID(),
    title: task.title,
    description: task.description,
    status: task.status,
    dueDate: relativeDate(task.daysFromToday),
    createdAt: timestamp,
    updatedAt: timestamp,
  }))

  await getDatabase().batch(tasks.map(task => ({
    sql: `
      INSERT INTO tasks (
        id, owner_id, title, description, status, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      task.id,
      ownerId,
      task.title,
      task.description,
      task.status,
      task.dueDate,
      task.createdAt,
      task.updatedAt,
    ],
  })), 'write')

  return tasks
}

export async function updateTask(ownerId: string, id: string, payload: TaskPayload) {
  const updatedAt = new Date().toISOString()
  const result = await getDatabase().execute({
    sql: `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, due_date = ?, updated_at = ?
      WHERE owner_id = ? AND id = ?
      RETURNING id, title, description, status, due_date, created_at, updated_at
    `,
    args: [
      payload.title.trim(),
      payload.description.trim(),
      payload.status,
      payload.dueDate,
      updatedAt,
      ownerId,
      id,
    ],
  })

  return result.rows[0] ? rowToTask(result.rows[0]) : null
}

export async function deleteTask(ownerId: string, id: string) {
  const result = await getDatabase().execute({
    sql: 'DELETE FROM tasks WHERE owner_id = ? AND id = ?',
    args: [ownerId, id],
  })

  return result.rowsAffected > 0
}
