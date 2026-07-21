import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireUser } from '../../utils/auth'
import { deleteTask, findTask } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const task = await findTask(user.id, id)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  if (task.access !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Only the task owner can delete this task.' })
  }

  if (!await deleteTask(user.id, id)) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  return { success: true }
})
