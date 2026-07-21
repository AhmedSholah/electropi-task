import { defineEventHandler, setResponseStatus } from 'h3'
import { requireUser } from '../../utils/auth'
import { readTaskPayload } from '../../utils/readTaskPayload'
import { createTask } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const payload = await readTaskPayload(event)
  const task = await createTask(user.id, payload)

  setResponseStatus(event, 201)
  return task
})
