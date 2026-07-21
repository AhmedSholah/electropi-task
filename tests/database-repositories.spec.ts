import { randomUUID } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'
import { migrateDatabase } from '../database/migrate'
import { seedDatabase } from '../database/seed'
import { createSession, resolveSession, revokeSession } from '../server/utils/sessionRepository'
import { createTask, deleteTask, findTask, listTasks, updateTask } from '../server/utils/taskRepository'
import {
  createUser,
  findUserByEmail,
  verifyPassword,
} from '../server/utils/userRepository'

beforeAll(async () => {
  await migrateDatabase()
  await seedDatabase()
})

describe('persistent repositories', () => {
  it('creates users uniquely and persists revocable sessions', async () => {
    const email = `${randomUUID()}@example.com`
    const user = await createUser('Repository User', email, 'password123')

    expect(user).toMatchObject({ name: 'Repository User', email })
    expect(await createUser('Duplicate User', email.toUpperCase(), 'password123')).toBeNull()

    const storedUser = await findUserByEmail(email)
    expect(storedUser && verifyPassword(storedUser, 'password123')).toBe(true)

    const token = await createSession(user!.id)
    expect(await resolveSession(token)).toMatchObject({ userId: user!.id })

    await revokeSession(token)
    expect(await resolveSession(token)).toBeNull()
  })

  it('adds three starter tasks to every new account', async () => {
    const email = `${randomUUID()}@example.com`
    const user = await createUser('New User', email, 'password123')
    const result = await listTasks(user!.id, {
      search: '',
      status: 'all',
      sort: 'due_asc',
      page: 1,
      pageSize: 10,
    })

    expect(result.items).toHaveLength(3)
    expect(result.items.map(task => task.title)).toEqual([
      'Welcome to TaskFlow',
      'Plan your first project',
      'Create your first task',
    ])
    expect(result.stats).toEqual({ total: 3, pending: 1, inProgress: 1, done: 1 })
  })

  it('creates, updates, reads, and deletes an owned task', async () => {
    const email = `${randomUUID()}@example.com`
    const user = await createUser('Task Owner', email, 'password123')
    const task = await createTask(user!.id, {
      title: '  Persist this task  ',
      description: '  Stored in Turso  ',
      status: 'pending',
      dueDate: '2099-01-01',
    })

    expect(await findTask(user!.id, task.id)).toMatchObject({
      title: 'Persist this task',
      description: 'Stored in Turso',
    })

    const updatedTask = await updateTask(user!.id, task.id, {
      title: 'Persisted task',
      description: 'Updated in Turso',
      status: 'done',
      dueDate: '2099-01-02',
    })
    expect(updatedTask).toMatchObject({ title: 'Persisted task', status: 'done' })

    expect(await deleteTask(user!.id, task.id)).toBe(true)
    expect(await findTask(user!.id, task.id)).toBeNull()
  })
})
