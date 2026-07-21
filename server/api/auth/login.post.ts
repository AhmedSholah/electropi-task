import { createError, defineEventHandler, readBody } from 'h3'
import type { LoginPayload } from '#shared/types/auth'
import { startUserSession } from '../../utils/auth'
import { simulateDelay } from '../../utils/simulateDelay'
import { findUserByEmail, getPublicUser, verifyPassword } from '../../utils/userRepository'

export default defineEventHandler(async (event) => {
  await simulateDelay()
  const body = await readBody<Partial<LoginPayload>>(event)
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Email and password are required.',
    })
  }

  const user = findUserByEmail(email)

  if (!user || !verifyPassword(user, password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'The email or password is incorrect.',
    })
  }

  startUserSession(event, user.id)

  return { user: getPublicUser(user) }
})
