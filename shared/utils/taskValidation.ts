import { TASK_STATUSES, type TaskPayload } from '../types/task'

export type TaskValidationErrors = Partial<Record<keyof TaskPayload, string>>

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getMinimumDueDate(date = new Date()) {
  const tomorrow = new Date(date)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return getLocalDateString(tomorrow)
}

export function validateTask(payload: Partial<TaskPayload> | null | undefined) {
  const errors: TaskValidationErrors = {}
  const title = typeof payload?.title === 'string' ? payload.title : ''
  const description = typeof payload?.description === 'string' ? payload.description : ''
  const dueDate = typeof payload?.dueDate === 'string' ? payload.dueDate : ''

  if (!title.trim()) {
    errors.title = 'Task title is required.'
  }
  else if (title.trim().length > 100) {
    errors.title = 'Title must be 100 characters or fewer.'
  }

  if (description.length > 500) {
    errors.description = 'Description must be 500 characters or fewer.'
  }

  if (!payload?.status || !TASK_STATUSES.includes(payload.status)) {
    errors.status = 'Choose a valid task status.'
  }

  if (!dueDate) {
    errors.dueDate = 'Due date is required.'
  }
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
    errors.dueDate = 'Enter a valid due date.'
  }
  else if (dueDate <= getLocalDateString()) {
    errors.dueDate = 'Due date must be in the future.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
