import { createClient } from '@libsql/client'
import type { Client } from '@libsql/client'

let database: Client | undefined

export function getDatabase() {
  if (database) {
    return database
  }

  const databaseUrl = process.env.TURSO_DATABASE_URL
    ?? (process.env.NODE_ENV === 'test' ? 'file::memory:' : undefined)

  if (!databaseUrl) {
    throw new Error('TURSO_DATABASE_URL is required. Add it to .env locally and to the Vercel project environment variables.')
  }

  database = createClient({
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })

  return database
}
