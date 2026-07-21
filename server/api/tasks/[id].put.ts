import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireUser } from '../../utils/auth'
import { readTaskPayload } from '../../utils/readTaskPayload'
import { simulateDelay } from '../../utils/simulateDelay'
import { updateTask } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id') ?? ''
  const payload = await readTaskPayload(event)
  await simulateDelay()
  const task = updateTask(user.id, id, payload)

  if (!task) {
    throw createError({ statusCode: 404, statusMessage: 'Task not found.' })
  }

  return task
})
