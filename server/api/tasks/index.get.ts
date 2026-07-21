import { createError, defineEventHandler, getQuery } from 'h3'
import { TASK_SORTS, TASK_STATUSES } from '#shared/types/task'
import type { TaskSort, TaskStatus } from '#shared/types/task'
import { requireUser } from '../../utils/auth'
import { listTasks } from '../../utils/taskRepository'

const DEFAULT_PAGE_SIZE = 6
const MAX_PAGE_SIZE = 50

function readString(value: unknown) {
  if (Array.isArray(value)) {
    return readString(value[0])
  }

  return typeof value === 'string' ? value : undefined
}

function readPositiveInteger(value: unknown, fallback: number, maximum?: number) {
  const rawValue = readString(value)

  if (rawValue === undefined) {
    return fallback
  }

  if (!/^\d+$/.test(rawValue)) {
    throw createError({ statusCode: 400, statusMessage: 'Pagination values must be positive integers.' })
  }

  const parsedValue = Number(rawValue)

  if (!Number.isSafeInteger(parsedValue) || parsedValue < 1 || (maximum !== undefined && parsedValue > maximum)) {
    throw createError({ statusCode: 400, statusMessage: 'Pagination values are outside the allowed range.' })
  }

  return parsedValue
}

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const query = getQuery(event)
  const search = readString(query.search)?.trim() ?? ''
  const requestedStatus = readString(query.status) ?? 'all'
  const requestedSort = readString(query.sort) ?? 'active_due_asc'
  const page = readPositiveInteger(query.page, 1)
  const pageSize = readPositiveInteger(query.pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE)

  if (search.length > 100) {
    throw createError({ statusCode: 400, statusMessage: 'Search must be 100 characters or fewer.' })
  }

  if (requestedStatus !== 'all' && !TASK_STATUSES.includes(requestedStatus as TaskStatus)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task status.' })
  }

  if (!TASK_SORTS.includes(requestedSort as TaskSort)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task sort.' })
  }

  return await listTasks(user.id, {
    search,
    status: requestedStatus as TaskStatus | 'all',
    sort: requestedSort as TaskSort,
    page,
    pageSize,
  })
})
