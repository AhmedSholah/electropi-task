import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireUser } from '../../utils/auth'
import { simulateDelay } from '../../utils/simulateDelay'
import { findTask } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  await simulateDelay()
  const task = await findTask(user.id, id)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  return task
})
