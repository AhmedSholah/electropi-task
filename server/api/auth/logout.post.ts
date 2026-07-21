import { defineEventHandler } from 'h3'
import { endUserSession } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await endUserSession(event)
  return { success: true }
})
