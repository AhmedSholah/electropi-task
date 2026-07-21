import { defineEventHandler, setResponseStatus } from 'h3'
import { requireUser } from '../../utils/auth'
import { readTaskPayload } from '../../utils/readTaskPayload'
import { createTask } from '../../utils/taskRepository'
import { validateTaskAssignee } from '../../utils/validateTaskAssignee'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  const payload = await readTaskPayload(event)
  await validateTaskAssignee(user.id, payload.assigneeId)
  const task = await createTask(user.id, payload)

  setResponseStatus(event, 201)
  return task
})
