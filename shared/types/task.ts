export const TASK_STATUSES = ['pending', 'in_progress', 'done'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

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

export const taskStatusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
}
