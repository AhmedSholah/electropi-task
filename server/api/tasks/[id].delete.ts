import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireUser } from '../../utils/auth'
import { simulateDelay } from '../../utils/simulateDelay'
import { deleteTask } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  await simulateDelay()

  if (!deleteTask(user.id, id)) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  return { success: true }
})
