import { defineEventHandler, setResponseStatus } from 'h3'
import { requireUser } from '../../utils/auth'
import { readTaskPayload } from '../../utils/readTaskPayload'
import { simulateDelay } from '../../utils/simulateDelay'
import { createTask } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const payload = await readTaskPayload(event)
  await simulateDelay()
  const task = await createTask(user.id, payload)

  setResponseStatus(event, 201)
  return task
})
