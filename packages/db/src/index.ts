/**
 * @typeforge/db — Database package entry point
 * Exports Drizzle ORM client and schema
 */

export * from './schema/index.js';
export {
  createDb,
  createReadReplicaDb,
  createDbContext,
  type DbClient,
  type DbContext,
} from './client.js';
