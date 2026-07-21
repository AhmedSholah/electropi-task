import { defineEventHandler } from 'h3'
import { endUserSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  endUserSession(event)
  return { success: true }
})
