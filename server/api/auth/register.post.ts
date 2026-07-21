import { createError, defineEventHandler, readBody, setResponseStatus } from 'h3'
import type { RegisterPayload } from '#shared/types/auth'
import { startUserSession } from '../../utils/auth'
import { createUser } from '../../utils/userRepository'

export default defineEventHandler(async (event) => {
  const body = await readBody<Partial<RegisterPayload>>(event)
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (name.length < 2) {
    throw createError({ statusCode: 422, statusMessage: 'Name must be at least 2 characters.' })
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw createError({ statusCode: 422, statusMessage: 'Enter a valid email address.' })
  }

  if (password.length < 8) {
    throw createError({ statusCode: 422, statusMessage: 'Password must be at least 8 characters.' })
  }

  const user = await createUser(name, email, password)

  if (!user) {
    throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists.' })
  }

  await startUserSession(event, user.id)
  setResponseStatus(event, 201)

  return { user }
})
