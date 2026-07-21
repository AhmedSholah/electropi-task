import './load-env'
import { migrateDatabase } from '../database/migrate'

const appliedMigrations = await migrateDatabase()

if (appliedMigrations.length === 0) {
  console.log('Database is already up to date.')
} else {
  console.log(`Applied migrations: ${appliedMigrations.join(', ')}`)
}
