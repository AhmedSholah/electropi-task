import type { Client, InStatement } from '@libsql/client'
import { getDatabase } from '../server/utils/database'
import { migrateDatabase } from './migrate'
import { seedDatabase } from './seed'

const resetStatements: InStatement[] = [
  'DROP TABLE IF EXISTS sessions',
  'DROP TABLE IF EXISTS tasks',
  'DROP TABLE IF EXISTS users',
  'DROP TABLE IF EXISTS schema_migrations',
]

export async function resetDatabase(database: Client = getDatabase()) {
  await database.batch(resetStatements, 'write')

  const appliedMigrations = await migrateDatabase(database)
  const seedResult = await seedDatabase(database)

  return {
    appliedMigrations,
    ...seedResult,
  }
}
