import type { AuthUser } from './auth'

export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskSort = 'active_due_asc' | 'due_asc' | 'due_desc' | 'newest'
export const TASK_SORTS = ['active_due_asc', 'due_asc', 'due_desc', 'newest'] as const satisfies readonly TaskSort[]
export type TaskAccess = 'owner' | 'assignee'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  createdAt: string
  updatedAt: string
  owner: AuthUser
  assignee: AuthUser | null
  assigneeId: string | null
  access: TaskAccess
}

export interface TaskPayload {
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  assigneeId: string | null
}

export interface TaskStatusPayload {
  status: TaskStatus
}

export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  done: number
}

export interface TaskListResponse {
  items: Task[]
  page: number
  pageSize: number
  total: number
  totalPages: number
  stats: TaskStats
}

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
}
