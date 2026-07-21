import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import { findUserById, getPublicUser } from './userRepository'
import {
  SESSION_MAX_AGE_SECONDS,
  createSession,
  resolveSession,
  revokeSession,
} from './sessionRepository'

const SESSION_COOKIE = 'taskflow_session'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
}

export function startUserSession(event: H3Event, userId: string) {
  const token = createSession(userId)

  setCookie(event, SESSION_COOKIE, token, {
    ...cookieOptions,
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function endUserSession(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)

  if (token) {
    revokeSession(token)
  }

  deleteCookie(event, SESSION_COOKIE, cookieOptions)
}

export function getOptionalUser(event: H3Event) {
  const token = getCookie(event, SESSION_COOKIE)

  if (!token) {
    return null
  }

  const session = resolveSession(token)
  const user = session ? findUserById(session.userId) : null

  return user ? getPublicUser(user) : null
}

export function requireUser(event: H3Event) {
  const user = getOptionalUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Please sign in to continue.',
    })
  }

  return user
}
