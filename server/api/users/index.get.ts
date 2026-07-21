import { defineEventHandler } from 'h3'
import { requireUser } from '../../utils/auth'
import { listAssignableUsers } from '../../utils/userRepository'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event)
  return await listAssignableUsers(user.id)
})
