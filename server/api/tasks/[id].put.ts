import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { TASK_STATUSES } from '#shared/types/task'
import type { TaskStatusPayload } from '#shared/types/task'
import { requireUser } from '../../utils/auth'
import { readTaskPayload } from '../../utils/readTaskPayload'
import { findTask, updateAssignedTaskStatus, updateTask } from '../../utils/taskRepository'
import { validateTaskAssignee } from '../../utils/validateTaskAssignee'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const existingTask = await findTask(user.id, id)

  if (!existingTask) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  if (existingTask.access === 'assignee') {
    const body = await readBody<Partial<TaskStatusPayload> & Record<string, unknown>>(event)
    const keys = body && typeof body === 'object' && !Array.isArray(body) ? Object.keys(body) : []

    if (keys.length !== 1 || keys[0] !== 'status') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Assigned users can only change the task status.',
      })
    }

    if (!body.status || !TASK_STATUSES.includes(body.status)) {
      throw createError({ statusCode: 422, statusMessage: 'Choose a valid task status.' })
    }

    const task = await updateAssignedTaskStatus(user.id, id, body.status)

    if (!task) {
      throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
    }

    return task
  }

  const payload = await readTaskPayload(event, { existingDueDate: existingTask.dueDate })
  await validateTaskAssignee(user.id, payload.assigneeId)
  const task = await updateTask(user.id, id, payload)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  return task
})
