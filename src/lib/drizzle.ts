import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './db/schema'

type DrizzleDb = PostgresJsDatabase<typeof schema>

const globalForDb = globalThis as unknown as {
  client: postgres.Sql | undefined
  db: DrizzleDb | undefined
}

function createDb(): DrizzleDb {
  const url = process.env.POSTGRES_URL
  if (!url) {
    throw new Error('POSTGRES_URL is not set. Configure the database env vars to enable DB features.')
  }

  // Serverless isolates should stay tiny. Local/`next start` needs a few
  // concurrent connections — nested `"use cache"` + home fan-out deadlocks on max:1.
  const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)
  const maxConnections = isServerless ? 1 : 5

  const client =
    globalForDb.client ??
    postgres(url, {
      max: maxConnections,
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 20,
    })
  globalForDb.client = client

  const database = globalForDb.db ?? drizzle(client, { schema })
  globalForDb.db = database

  return database
}

function getDb(): DrizzleDb {
  return globalForDb.db ?? createDb()
}

export const db = new Proxy({} as DrizzleDb, {
  get(_target, prop) {
    if (prop === 'then') {
      return undefined
    }
    const database = getDb()
    const value = (database as any)[prop]
    return typeof value === 'function' ? value.bind(database) : value
  },
}) as DrizzleDb
