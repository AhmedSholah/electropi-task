import { randomUUID } from 'node:crypto'
import { beforeAll, describe, expect, it } from 'vitest'
import { migrateDatabase } from '../database/migrate'
import { MOCK_USERS, seedDatabase } from '../database/seed'
import { createSession, resolveSession, revokeSession } from '../server/utils/sessionRepository'
import { createTask, deleteTask, findTask, listTasks, updateAssignedTaskStatus, updateTask } from '../server/utils/taskRepository'
import {
  createUser,
  DEMO_USER_ID,
  findUserByEmail,
  listAssignableUsers,
  verifyPassword,
} from '../server/utils/userRepository'

beforeAll(async () => {
  await migrateDatabase()
  await seedDatabase()
})

describe('persistent repositories', () => {
  it('seeds the demo account and four male mock accounts', async () => {
    const users = await listAssignableUsers(DEMO_USER_ID)
    const mockUsers = users.filter(user => user.email.endsWith('@taskflow.dev'))

    expect(mockUsers).toEqual(MOCK_USERS.map(({ id, name, email }) => ({ id, name, email })))

    for (const mockUser of MOCK_USERS) {
      const storedUser = await findUserByEmail(mockUser.email)
      expect(storedUser && verifyPassword(storedUser, 'password123')).toBe(true)
    }
  })

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

  it('creates new accounts without starter tasks', async () => {
    const email = `${randomUUID()}@example.com`
    const user = await createUser('New User', email, 'password123')
    const result = await listTasks(user!.id, {
      search: '',
      status: 'all',
      sort: 'due_asc',
      page: 1,
      pageSize: 10,
    })

    expect(result.items).toHaveLength(0)
    expect(result.stats).toEqual({ total: 0, pending: 0, inProgress: 0, done: 0 })
  })

  it('creates, updates, reads, and deletes an owned task', async () => {
    const email = `${randomUUID()}@example.com`
    const user = await createUser('Task Owner', email, 'password123')
    const task = await createTask(user!.id, {
      title: '  Persist this task  ',
      description: '  Stored in Turso  ',
      status: 'pending',
      dueDate: '2099-01-01',
      assigneeId: null,
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
      assigneeId: null,
    })
    expect(updatedTask).toMatchObject({ title: 'Persisted task', status: 'done' })

    expect(await deleteTask(user!.id, task.id)).toBe(true)
    expect(await findTask(user!.id, task.id)).toBeNull()
  })

  it('shows assigned tasks to assignees while limiting repository mutations', async () => {
    const owner = await createUser('Assignment Owner', `${randomUUID()}@example.com`, 'password123')
    const assignee = await createUser('Assignment User', `${randomUUID()}@example.com`, 'password123')
    const outsider = await createUser('Outside User', `${randomUUID()}@example.com`, 'password123')
    const task = await createTask(owner!.id, {
      title: 'Assigned work',
      description: 'Only the status can be changed by the assignee.',
      status: 'pending',
      dueDate: '2099-02-01',
      assigneeId: assignee!.id,
    })

    expect(task).toMatchObject({
      access: 'owner',
      assigneeId: assignee!.id,
      assignee: { id: assignee!.id, name: 'Assignment User' },
    })
    expect(await findTask(assignee!.id, task.id)).toMatchObject({
      id: task.id,
      access: 'assignee',
      owner: { id: owner!.id, name: 'Assignment Owner' },
    })
    expect(await findTask(outsider!.id, task.id)).toBeNull()

    const assignedTasks = await listTasks(assignee!.id, {
      search: 'Assigned work',
      status: 'all',
      sort: 'newest',
      page: 1,
      pageSize: 10,
    })
    expect(assignedTasks.items).toHaveLength(1)
    expect(assignedTasks.items[0]?.access).toBe('assignee')

    expect(await updateAssignedTaskStatus(assignee!.id, task.id, 'done')).toMatchObject({
      title: 'Assigned work',
      description: 'Only the status can be changed by the assignee.',
      status: 'done',
    })
    expect(await updateTask(assignee!.id, task.id, {
      title: 'Unauthorized change',
      description: 'Unauthorized change',
      status: 'pending',
      dueDate: '2099-03-01',
      assigneeId: null,
    })).toBeNull()
    expect(await deleteTask(assignee!.id, task.id)).toBe(false)
  })

  it('lists other registered users as assignment options', async () => {
    const currentUser = await createUser('Directory Current', `${randomUUID()}@example.com`, 'password123')
    const otherUser = await createUser('Directory Other', `${randomUUID()}@example.com`, 'password123')
    const users = await listAssignableUsers(currentUser!.id)

    expect(users.some(user => user.id === currentUser!.id)).toBe(false)
    expect(users).toContainEqual(otherUser)
  })
})
