/**
 * Database client factory
 * Creates a Drizzle ORM client connected via Hyperdrive or direct connection
 * Supports multi-region routing based on user's home region
 */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

// Type for the Drizzle database client with our schema
export type DbClient = PostgresJsDatabase<typeof schema>;

// Region type matching the schema enum
export type Region = 'EU' | 'US' | 'AF';

/**
 * Hyperdrive binding type from Cloudflare Workers
 * This matches the Cloudflare Workers Hyperdrive type
 */
export interface HyperdriveBinding {
  connectionString: string;
}

/**
 * Create a database client for use in Cloudflare Workers with Hyperdrive
 * This is the primary factory function used in production
 * 
 * @param hyperdrive - The Hyperdrive binding from Cloudflare Workers env
 * @returns Typed Drizzle ORM client
 * 
 * @example
 * ```typescript
 * // In a Cloudflare Worker
 * export default {
 *   async fetch(request, env) {
 *     const db = createDb(env.HYPERDRIVE_EU);
 *     const users = await db.select().from(schema.users);
 *     return Response.json(users);
 *   }
 * }
 * ```
 */
export function createDb(hyperdrive: HyperdriveBinding): DbClient {
  const client = postgres(hyperdrive.connectionString, {
    prepare: false, // Required for Hyperdrive
    ssl: false, // Hyperdrive handles SSL
  });
  return drizzle(client, { schema });
}

/**
 * Create a database client for a specific region
 * Routes to the correct Hyperdrive binding based on region
 * 
 * @param region - The user's home region
 * @param hyperdrives - Object containing all Hyperdrive bindings
 * @returns Typed Drizzle ORM client
 * 
 * @example
 * ```typescript
 * const db = createRegionalDb('EU', {
 *   EU: env.HYPERDRIVE_EU,
 *   US: env.HYPERDRIVE_US,
 *   AF: env.HYPERDRIVE_AF,
 * });
 * ```
 */
export function createRegionalDb(
  region: Region,
  hyperdrives: Record<Region, HyperdriveBinding>
): DbClient {
  const hyperdrive = hyperdrives[region];
  if (!hyperdrive) {
    throw new Error(`No Hyperdrive binding found for region: ${region}`);
  }
  return createDb(hyperdrive);
}

/**
 * Create a database client for local development or server environments
 * Uses direct PostgreSQL connection without Hyperdrive
 * 
 * @param connectionString - PostgreSQL connection string
 * @param options - Connection options
 * @returns Typed Drizzle ORM client
 * 
 * @example
 * ```typescript
 * // Local development
 * const db = createLocalDb('postgresql://user:pass@localhost:5432/typeforge_eu');
 * ```
 */
export function createLocalDb(
  connectionString: string,
  options: {
    max?: number;
    idle_timeout?: number;
    connect_timeout?: number;
  } = {}
): DbClient {
  const client = postgres(connectionString, {
    max: options.max ?? 10,
    idle_timeout: options.idle_timeout ?? 20,
    connect_timeout: options.connect_timeout ?? 10,
  });
  return drizzle(client, { schema });
}

/**
 * Create a read-only replica client for analytics queries
 * Useful for offloading read-heavy operations from the primary database
 * 
 * @param connectionString - PostgreSQL connection string for replica
 * @returns Typed Drizzle ORM client (read-only)
 */
export function createReadReplicaDb(connectionString: string): DbClient {
  const client = postgres(connectionString, {
    max: 5,
    idle_timeout: 30,
    prepare: true, // Can use prepared statements on replica
  });
  return drizzle(client, { schema });
}

/**
 * Extract region from Clerk JWT claims
 * Used to route requests to the correct regional database
 * 
 * @param claims - The JWT claims from Clerk
 * @returns The user's home region
 */
export function extractRegionFromClaims(claims: {
  home_region?: string;
  region?: string;
}): Region {
  const region = claims.home_region ?? claims.region ?? 'EU';
  if (!['EU', 'US', 'AF'].includes(region)) {
    return 'EU'; // Default to EU for compliance
  }
  return region as Region;
}

/**
 * Database context for request-scoped database access
 * Provides the correct database client based on user's region
 */
export interface DbContext {
  db: DbClient;
  region: Region;
}

/**
 * Create a database context for a request
 * Combines region extraction with database client creation
 * 
 * @param claims - JWT claims from Clerk
 * @param hyperdrives - Hyperdrive bindings for all regions
 * @returns Database context with client and region
 */
export function createDbContext(
  claims: { home_region?: string; region?: string },
  hyperdrives: Record<Region, HyperdriveBinding>
): DbContext {
  const region = extractRegionFromClaims(claims);
  const db = createRegionalDb(region, hyperdrives);
  return { db, region };
}
