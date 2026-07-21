import { createHash, randomBytes } from 'node:crypto'
import { getDatabase } from './database'

interface Session {
  userId: string
  expiresAt: number
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString('hex')
  const timestamp = Date.now()

  await getDatabase().batch([
    {
      sql: 'DELETE FROM sessions WHERE expires_at <= ?',
      args: [timestamp],
    },
    {
      sql: 'INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)',
      args: [hashToken(token), userId, timestamp + SESSION_MAX_AGE_SECONDS * 1000],
    },
  ], 'write')

  return token
}

export async function resolveSession(token: string): Promise<Session | null> {
  const tokenHash = hashToken(token)
  const result = await getDatabase().execute({
    sql: 'SELECT user_id, expires_at FROM sessions WHERE token_hash = ? LIMIT 1',
    args: [tokenHash],
  })
  const row = result.rows[0]

  if (!row) {
    return null
  }

  const session = {
    userId: String(row.user_id),
    expiresAt: Number(row.expires_at),
  }

  if (session.expiresAt <= Date.now()) {
    await getDatabase().execute({
      sql: 'DELETE FROM sessions WHERE token_hash = ?',
      args: [tokenHash],
    })
    return null
  }

  return session
}

export async function revokeSession(token: string) {
  await getDatabase().execute({
    sql: 'DELETE FROM sessions WHERE token_hash = ?',
    args: [hashToken(token)],
  })
}
