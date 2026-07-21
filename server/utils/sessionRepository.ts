import { randomBytes } from 'node:crypto'

interface Session {
  userId: string
  expiresAt: number
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

const sessions = new Map<string, Session>()

export function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')

  sessions.set(token, {
    userId,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  })

  return token
}

export function resolveSession(token: string) {
  const session = sessions.get(token)

  if (!session) {
    return null
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return null
  }

  return session
}

export function revokeSession(token: string) {
  sessions.delete(token)
}
