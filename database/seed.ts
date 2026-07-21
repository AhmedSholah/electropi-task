import { randomUUID } from 'node:crypto'
import type { Client, InStatement } from '@libsql/client'
import type { TaskStatus } from '../shared/types/task'
import { getDatabase } from '../server/utils/database'
import { DEMO_USER_ID, hashPassword } from '../server/utils/userRepository'

interface DemoTask {
  title: string
  description: string
  status: TaskStatus
  daysFromToday: number
}

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

const demoTasks: DemoTask[] = [
  {
    title: 'Update Documentation',
    description: 'Review and update API endpoints documentation for the v2 release cycle. Ensure all new parameters are covered.',
    status: 'in_progress',
    daysFromToday: 1,
  },
  {
    title: 'Client Onboarding',
    description: 'Prepare initial configuration and welcome packet for Acme Corp. Schedule the kickoff call.',
    status: 'pending',
    daysFromToday: 2,
  },
  {
    title: 'Fix Login Bug',
    description: 'Investigate and patch the OAuth timeout issue reported on the mobile staging environment.',
    status: 'pending',
    daysFromToday: -1,
  },
  {
    title: 'Publish Release Notes',
    description: 'Summarize the improvements included in the upcoming product release.',
    status: 'done',
    daysFromToday: 5,
  },
  {
    title: 'Review Analytics',
    description: 'Review the weekly product analytics and share key findings with the team.',
    status: 'in_progress',
    daysFromToday: 4,
  },
  {
    title: 'Archive Sprint Board',
    description: 'Close completed tickets and archive the previous sprint board.',
    status: 'done',
    daysFromToday: 3,
  },
]

function relativeDate(daysFromToday: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysFromToday)
  return date.toISOString().slice(0, 10)
}

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

  const existingTasks = await database.execute({
    sql: 'SELECT COUNT(*) AS count FROM tasks WHERE owner_id = ?',
    args: [DEMO_USER_ID],
  })
  const taskCount = Number(existingTasks.rows[0]?.count ?? 0)

  if (taskCount === 0) {
    statements.push(...demoTasks.map(task => ({
      sql: `
        INSERT INTO tasks (
          id, owner_id, title, description, status, due_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      args: [
        randomUUID(),
        DEMO_USER_ID,
        task.title,
        task.description,
        task.status,
        relativeDate(task.daysFromToday),
        timestamp,
        timestamp,
      ],
    })))
  }

  const results = await database.batch(statements, 'write')
  const usersCreated = results
    .slice(0, seedUsers.length)
    .reduce((total, result) => total + result.rowsAffected, 0)

  return {
    usersCreated,
    demoTasksCreated: taskCount === 0 ? demoTasks.length : 0,
  }
}
