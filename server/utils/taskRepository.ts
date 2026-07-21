import { randomUUID } from 'node:crypto'
import type { Row } from '@libsql/client'
import type { Task, TaskListResponse, TaskPayload, TaskSort, TaskStatus } from '#shared/types/task'
import { getDatabase } from './database'

const taskSelection = `
  t.id,
  t.title,
  t.description,
  t.status,
  t.due_date,
  t.created_at,
  t.updated_at,
  t.owner_id,
  owner.name AS owner_name,
  owner.email AS owner_email,
  t.assignee_id,
  assignee.name AS assignee_name,
  assignee.email AS assignee_email
`

function rowToTask(row: Row, viewerId: string): Task {
  const ownerId = String(row.owner_id)
  const assigneeId = row.assignee_id === null ? null : String(row.assignee_id)

  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    status: String(row.status) as TaskStatus,
    dueDate: String(row.due_date),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    owner: {
      id: ownerId,
      name: String(row.owner_name),
      email: String(row.owner_email),
    },
    assignee: assigneeId
      ? {
          id: assigneeId,
          name: String(row.assignee_name),
          email: String(row.assignee_email),
        }
      : null,
    assigneeId,
    access: ownerId === viewerId ? 'owner' : 'assignee',
  }
}

interface ListTasksOptions {
  search: string
  status: TaskStatus | 'all'
  sort: TaskSort
  page: number
  pageSize: number
}

export async function listTasks(userId: string, options: ListTasksOptions): Promise<TaskListResponse> {
  const result = await getDatabase().execute({
    sql: `
      SELECT ${taskSelection}
      FROM tasks t
      JOIN users owner ON owner.id = t.owner_id
      LEFT JOIN users assignee ON assignee.id = t.assignee_id
      WHERE t.owner_id = ? OR t.assignee_id = ?
    `,
    args: [userId, userId],
  })
  const visibleTasks = result.rows.map(row => rowToTask(row, userId))
  const normalizedSearch = options.search.trim().toLowerCase()
  const filteredTasks = visibleTasks.filter((task) => {
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
      total: visibleTasks.length,
      pending: visibleTasks.filter(task => task.status === 'pending').length,
      inProgress: visibleTasks.filter(task => task.status === 'in_progress').length,
      done: visibleTasks.filter(task => task.status === 'done').length,
    },
  }
}

export async function findTask(userId: string, id: string) {
  const result = await getDatabase().execute({
    sql: `
      SELECT ${taskSelection}
      FROM tasks t
      JOIN users owner ON owner.id = t.owner_id
      LEFT JOIN users assignee ON assignee.id = t.assignee_id
      WHERE t.id = ? AND (t.owner_id = ? OR t.assignee_id = ?)
      LIMIT 1
    `,
    args: [id, userId, userId],
  })

  return result.rows[0] ? rowToTask(result.rows[0], userId) : null
}

export async function createTask(ownerId: string, payload: TaskPayload) {
  const timestamp = new Date().toISOString()
  const id = randomUUID()

  await getDatabase().execute({
    sql: `
      INSERT INTO tasks (
        id, owner_id, assignee_id, title, description, status, due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      ownerId,
      payload.assigneeId,
      payload.title.trim(),
      payload.description.trim(),
      payload.status,
      payload.dueDate,
      timestamp,
      timestamp,
    ],
  })

  return (await findTask(ownerId, id))!
}

export async function updateTask(ownerId: string, id: string, payload: TaskPayload) {
  const updatedAt = new Date().toISOString()
  const result = await getDatabase().execute({
    sql: `
      UPDATE tasks
      SET title = ?, description = ?, status = ?, due_date = ?, assignee_id = ?, updated_at = ?
      WHERE owner_id = ? AND id = ?
    `,
    args: [
      payload.title.trim(),
      payload.description.trim(),
      payload.status,
      payload.dueDate,
      payload.assigneeId,
      updatedAt,
      ownerId,
      id,
    ],
  })

  return result.rowsAffected > 0 ? await findTask(ownerId, id) : null
}

export async function updateAssignedTaskStatus(assigneeId: string, id: string, status: TaskStatus) {
  const result = await getDatabase().execute({
    sql: `
      UPDATE tasks
      SET status = ?, updated_at = ?
      WHERE assignee_id = ? AND id = ?
    `,
    args: [status, new Date().toISOString(), assigneeId, id],
  })

  return result.rowsAffected > 0 ? await findTask(assigneeId, id) : null
}

export async function deleteTask(ownerId: string, id: string) {
  const result = await getDatabase().execute({
    sql: 'DELETE FROM tasks WHERE owner_id = ? AND id = ?',
    args: [ownerId, id],
  })

  return result.rowsAffected > 0
}
