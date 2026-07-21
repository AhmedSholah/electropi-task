import './load-env'
import { seedDatabase } from '../database/seed'

const result = await seedDatabase()

if (result.demoTasksCreated === 0) {
  console.log('Demo data already exists; nothing was added.')
} else {
  console.log(`Created the demo user and ${result.demoTasksCreated} demo tasks.`)
}
