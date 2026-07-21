import './load-env'
import { seedDatabase } from '../database/seed'

const result = await seedDatabase()
const created: string[] = []

if (result.usersCreated > 0) {
  created.push(`${result.usersCreated} user${result.usersCreated === 1 ? '' : 's'}`)
}

console.log(created.length > 0
  ? `Created ${created.join(' and ')}.`
  : 'Seed data already exists; nothing was added.')
