import type { Client, InStatement } from '@libsql/client'
import { getDatabase } from '../server/utils/database'
import { DEMO_USER_ID, hashPassword } from '../server/utils/userRepository'

interface SeedUser {
  id: string
  name: string
  email: string
}

export const MOCK_USERS: SeedUser[] = [
  {
    id: 'mock-user-ahmed',
    name: 'Ahmed Hassan',
    email: 'ahmed@taskflow.dev',
  },
  {
    id: 'mock-user-karim',
    name: 'Karim Mostafa',
    email: 'karim@taskflow.dev',
  },
  {
    id: 'mock-user-omar',
    name: 'Omar Khaled',
    email: 'omar@taskflow.dev',
  },
  {
    id: 'mock-user-youssef',
    name: 'Youssef Ali',
    email: 'youssef@taskflow.dev',
  },
]

const SEED_PASSWORD = 'password123'

export async function seedDatabase(database: Client = getDatabase()) {
  const timestamp = new Date().toISOString()
  const seedUsers: SeedUser[] = [
    {
      id: DEMO_USER_ID,
      name: 'Demo User',
      email: 'demo@taskflow.dev',
    },
    ...MOCK_USERS,
  ]
  const statements: InStatement[] = seedUsers.map(user => ({
    sql: `
      INSERT OR IGNORE INTO users (id, name, email, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: [user.id, user.name, user.email, hashPassword(SEED_PASSWORD), timestamp],
  }))

  const results = await database.batch(statements, 'write')
  const usersCreated = results
    .slice(0, seedUsers.length)
    .reduce((total, result) => total + result.rowsAffected, 0)

  return { usersCreated }
}
