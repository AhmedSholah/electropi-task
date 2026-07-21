import { defineEventHandler } from 'h3'
import { requireUser } from '../../utils/auth'
import { simulateDelay } from '../../utils/simulateDelay'
import { listTasks } from '../../utils/taskRepository'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  await simulateDelay(650)

  return listTasks(user.id)
})
