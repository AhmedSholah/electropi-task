export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const
export const TASK_SORTS = ['due_asc', 'due_desc', 'newest'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]
export type TaskSort = (typeof TASK_SORTS)[number]

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface TaskPayload {
  title: string
  description: string
  status: TaskStatus
  dueDate: string
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
