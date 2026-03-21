/**
 * Database client factory
 * Creates a Drizzle ORM client connected via Hyperdrive or direct connection
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type DbClient = PostgresJsDatabase<typeof schema>;

/**
 * Create a database client for use in Cloudflare Workers with Hyperdrive
 */
export function createDb(hyperdriveConnectionString: string): DbClient {
  const client = postgres(hyperdriveConnectionString, {
    prepare: false, // Required for Hyperdrive
  });
  return drizzle(client, { schema });
}

/**
 * Create a database client for local development or server environments
 */
export function createLocalDb(connectionString: string): DbClient {
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema });
}
