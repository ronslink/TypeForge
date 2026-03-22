/**
 * @typeforge/db — Database package entry point
 * Exports Drizzle ORM client and schema
 */

export * from './schema/index.js';
export {
  createDb,
  createRegionalDb,
  createLocalDb,
  createReadReplicaDb,
  createDbContext,
  extractRegionFromClaims,
  type DbClient,
  type Region,
  type HyperdriveBinding,
  type DbContext,
} from './client.js';
