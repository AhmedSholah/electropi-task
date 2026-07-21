import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto'
import type { Row } from '@libsql/client'
import type { AuthUser } from '#shared/types/auth'
import { getDatabase } from './database'

interface StoredUser extends AuthUser {
  passwordHash: string
  createdAt: string
}

export const DEMO_USER_ID = 'demo-user'

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')

  return `${salt}:${hash}`
}

function toStoredUser(row: Row): StoredUser {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    passwordHash: String(row.password_hash),
    createdAt: String(row.created_at),
  }
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export async function findUserByEmail(email: string) {
  const result = await getDatabase().execute({
    sql: `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE email = ? COLLATE NOCASE
      LIMIT 1
    `,
    args: [normalizeEmail(email)],
  })

  return result.rows[0] ? toStoredUser(result.rows[0]) : undefined
}

export async function findUserById(id: string) {
  const result = await getDatabase().execute({
    sql: `
      SELECT id, name, email, password_hash, created_at
      FROM users
      WHERE id = ?
      LIMIT 1
    `,
    args: [id],
  })

  return result.rows[0] ? toStoredUser(result.rows[0]) : undefined
}

export async function createUser(name: string, email: string, password: string) {
  const user: StoredUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizeEmail(email),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }
  const result = await getDatabase().execute({
    sql: `
      INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [user.id, user.name, user.email, user.passwordHash, user.createdAt],
  })

  return result.rowsAffected > 0 ? toPublicUser(user) : null
}

export function verifyPassword(user: StoredUser, password: string) {
  const [salt, storedHash] = user.passwordHash.split(':')

  if (!salt || !storedHash) {
    return false
  }

  const storedBuffer = Buffer.from(storedHash, 'hex')
  const suppliedBuffer = scryptSync(password, salt, 64)

  return storedBuffer.length === suppliedBuffer.length
    && timingSafeEqual(storedBuffer, suppliedBuffer)
}

export function getPublicUser(user: StoredUser) {
  return toPublicUser(user)
}
