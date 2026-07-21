import { beforeAll, describe, expect, it } from 'vitest'
import { migrateDatabase } from '../database/migrate'
import { seedDatabase } from '../database/seed'
import { listTasks } from '../server/utils/taskRepository'
import { DEMO_USER_ID } from '../server/utils/userRepository'

describe('task repository listing', () => {
  beforeAll(async () => {
    await migrateDatabase()
    await seedDatabase()
  })

  it('searches and filters case-insensitively before paginating', async () => {
    const result = await listTasks(DEMO_USER_ID, {
      search: 'ANALYTICS',
      status: 'in_progress',
      sort: 'due_asc',
      page: 1,
      pageSize: 1,
    })

    expect(result.items.map(task => task.title)).toEqual(['Review Analytics'])
    expect(result.total).toBe(1)
    expect(result.stats).toEqual({ total: 6, pending: 2, inProgress: 2, done: 2 })
  })

  it('sorts the full result set before selecting a page', async () => {
    const result = await listTasks(DEMO_USER_ID, {
      search: '',
      status: 'all',
      sort: 'due_asc',
      page: 2,
      pageSize: 2,
    })

    expect(result.items.map(task => task.title)).toEqual(['Client Onboarding', 'Archive Sprint Board'])
    expect(result).toMatchObject({ page: 2, pageSize: 2, total: 6, totalPages: 3 })
  })

  it('sorts active tasks by nearest due date before completed tasks', async () => {
    const result = await listTasks(DEMO_USER_ID, {
      search: '',
      status: 'all',
      sort: 'active_due_asc',
      page: 1,
      pageSize: 10,
    })

    expect(result.items.map(task => task.title)).toEqual([
      'Fix Login Bug',
      'Update Documentation',
      'Client Onboarding',
      'Review Analytics',
      'Archive Sprint Board',
      'Publish Release Notes',
    ])
    expect(result.items.slice(0, 4).every(task => task.status !== 'done')).toBe(true)
    expect(result.items.slice(4).every(task => task.status === 'done')).toBe(true)
  })
})
