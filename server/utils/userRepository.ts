import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import type { AuthUser } from '#shared/types/auth'

interface StoredUser extends AuthUser {
  passwordHash: string
  createdAt: string
}

const DEMO_USER_ID = 'demo-user'

function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')

  return `${salt}:${hash}`
}

function toPublicUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  }
}

const users: StoredUser[] = [
  {
    id: DEMO_USER_ID,
    name: 'Demo User',
    email: 'demo@taskflow.dev',
    passwordHash: hashPassword('password123'),
    createdAt: new Date().toISOString(),
  },
]

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function findUserByEmail(email: string) {
  return users.find(user => user.email === normalizeEmail(email))
}

export function findUserById(id: string) {
  return users.find(user => user.id === id)
}

export function createUser(name: string, email: string, password: string) {
  const user: StoredUser = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizeEmail(email),
    passwordHash: hashPassword(password),
    createdAt: new Date().toISOString(),
  }

  users.push(user)

  return toPublicUser(user)
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

export { DEMO_USER_ID }
