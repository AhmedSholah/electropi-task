import type { TaskStatus } from '#shared/types/task'
import { getLocalDateString } from '#shared/utils/taskValidation'

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
}

export function getTaskDueMeta(dueDate: string, status: TaskStatus) {
  const today = getLocalDateString()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowString = getLocalDateString(tomorrow)
  const difference = Math.round((
    new Date(`${dueDate}T12:00:00Z`).getTime()
    - new Date(`${today}T12:00:00Z`).getTime()
  ) / 86_400_000)

  if (status !== 'done' && dueDate < today) {
    return { label: difference === -1 ? 'Due yesterday' : `${Math.abs(difference)} days overdue`, overdue: true }
  }

  if (dueDate === today) {
    return { label: 'Due today', overdue: status !== 'done' }
  }

  if (dueDate === tomorrowString) {
    return { label: 'Due tomorrow', overdue: false }
  }

  if (difference > 1 && difference <= 7) {
    return { label: `Due in ${difference} days`, overdue: false }
  }

  return { label: `Due ${formatDate(dueDate)}`, overdue: false }
}
