import './load-env'
import { resetDatabase } from '../database/reset'

const result = await resetDatabase()

console.log('Database reset complete.')
console.log(`Applied ${result.appliedMigrations.length} migration(s).`)
console.log(`Created ${result.usersCreated} users and ${result.demoTasksCreated} demo tasks.`)
