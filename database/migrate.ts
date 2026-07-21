import { readdir, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Client, InStatement } from '@libsql/client'
import { getDatabase } from '../server/utils/database'

const migrationsDirectory = resolve(process.cwd(), 'database/migrations')

function splitStatements(sql: string) {
  return sql
    .split(';')
    .map(statement => statement.trim())
    .filter(Boolean)
}

export async function migrateDatabase(database: Client = getDatabase()) {
  await database.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    )
  `)

  const appliedResult = await database.execute('SELECT name FROM schema_migrations')
  const appliedMigrations = new Set(appliedResult.rows.map(row => String(row.name)))
  const migrationFiles = (await readdir(migrationsDirectory))
    .filter(fileName => fileName.endsWith('.sql'))
    .sort()

  const newlyApplied: string[] = []

  for (const fileName of migrationFiles) {
    if (appliedMigrations.has(fileName)) {
      continue
    }

    const sql = await readFile(resolve(migrationsDirectory, fileName), 'utf8')
    const statements: InStatement[] = splitStatements(sql)
    statements.push({
      sql: 'INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)',
      args: [fileName, new Date().toISOString()],
    })

    await database.batch(statements, 'write')
    newlyApplied.push(fileName)
  }

  return newlyApplied
}
