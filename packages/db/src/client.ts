/**
 * Database client factory
 * Creates a Drizzle ORM client connected via Hyperdrive or direct connection
 * Supports multi-region routing based on user's home region
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DbClient = PostgresJsDatabase<typeof schema>;

/**
 * Create a database client using a standard Postgres connection string
 * 
 * @param connectionString - PostgreSQL connection string
 * @returns Typed Drizzle ORM client
 */
export function createDb(connectionString: string): DbClient {
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}

/**
 * Create a read-only replica client for analytics queries
 * 
 * @param connectionString - PostgreSQL connection string for replica
 * @returns Typed Drizzle ORM client (read-only)
 */
export function createReadReplicaDb(connectionString: string): DbClient {
  const client = postgres(connectionString, {
    max: 5,
    idle_timeout: 30,
    prepare: true,
  });
  return drizzle(client, { schema });
}

/**
 * Database context for request-scoped database access
 */
export interface DbContext {
  db: DbClient;
}

/**
 * Create a database context for a request
 * 
 * @returns Database context with client
 */
export function createDbContext(connectionString?: string): DbContext {
  const dbUrl = connectionString || process.env.DATABASE_URL;
  if (!dbUrl) {
    throw new Error('DATABASE_URL is not set');
  }
  const db = createDb(dbUrl);
  return { db };
}
