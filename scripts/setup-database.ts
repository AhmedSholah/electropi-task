import './load-env'
import { migrateDatabase } from '../database/migrate'
import { seedDatabase } from '../database/seed'

const appliedMigrations = await migrateDatabase()
const seedResult = await seedDatabase()

console.log(`Applied ${appliedMigrations.length} migration(s).`)
console.log(`Created ${seedResult.usersCreated} user(s).`)
console.log(`Created ${seedResult.demoTasksCreated} demo task(s).`)
