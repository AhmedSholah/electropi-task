import { createClient } from '@libsql/client'
import { describe, expect, it } from 'vitest'
import { resetDatabase } from '../database/reset'

describe('database reset', () => {
  it('recreates the schema and applies the complete seed to an existing database', async () => {
    const database = createClient({ url: 'file::memory:' })

    try {
      const firstReset = await resetDatabase(database)

      expect(firstReset.appliedMigrations).toEqual([
        '0001_initial.sql',
        '0002_task_assignments.sql',
      ])
      expect(firstReset.usersCreated).toBe(5)

      await database.execute(`
        INSERT INTO users (id, name, email, password_hash, created_at)
        VALUES ('temporary-user', 'Temporary User', 'temporary@example.com', 'test', '2026-01-01T00:00:00.000Z')
      `)

      const secondReset = await resetDatabase(database)
      const users = await database.execute('SELECT id FROM users ORDER BY id')
      const tasks = await database.execute('SELECT COUNT(*) AS count FROM tasks')

      expect(secondReset.usersCreated).toBe(5)
      expect(users.rows.map(row => String(row.id))).not.toContain('temporary-user')
      expect(users.rows).toHaveLength(5)
      expect(Number(tasks.rows[0]?.count)).toBe(0)
    }
    finally {
      database.close()
    }
  })
})
