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
 * Connection options for reaching Postgres through a connection pooler.
 *
 * TypeForge runs on serverless functions and reaches the database through a
 * pooler: DigitalOcean's managed pooler, or the proxy fronting it. Those are
 * PgBouncer in **transaction** mode, where a client connection is only bound to a
 * server connection for the duration of a transaction. Named prepared statements
 * cannot survive that — a statement prepared on one client connection may be
 * executed against another, which fails at runtime rather than at connect time.
 *
 * So `prepare: false` is a correctness requirement here, not a tuning choice.
 *
 * `max` stays small on purpose. Every function instance builds its own pool, and
 * the pooler exists to multiplex them; a large per-instance pool defeats that and
 * can exhaust the cluster's client connection limit during a traffic spike.
 * Override with `DB_POOL_MAX` if a workload genuinely needs more.
 */
export function poolerConnectionOptions(
  defaultMax: number,
  overrides: { idleTimeoutSeconds?: number } = {}
): {
  max: number;
  idle_timeout: number;
  connect_timeout: number;
  prepare: false;
} {
  const requested = Number(process.env.DB_POOL_MAX);
  const max = Number.isFinite(requested) && requested > 0 ? Math.floor(requested) : defaultMax;

  return {
    max,
    idle_timeout: overrides.idleTimeoutSeconds ?? 20,
    connect_timeout: 10,
    prepare: false,
  };
}

/**
 * Detect a connection string that will be attempted without TLS.
 *
 * postgres-js defaults to `ssl: false` and only turns TLS on when `sslmode` is
 * present in the connection string. Managed Postgres (DigitalOcean) *requires*
 * TLS, so omitting it does not degrade gracefully — the connection is refused,
 * and the error at that point is about encryption, not about the missing
 * parameter that caused it.
 *
 * Local and docker-hosted databases legitimately have no TLS, so they are exempt.
 *
 * @returns a warning to log, or null when the string is fine.
 */
export function tlsWarningFor(connectionString: string): string | null {
  const isLocal =
    /@(localhost|127\.0\.0\.1|\[::1\]|host\.docker\.internal|postgres)[:/]/.test(connectionString);
  if (isLocal) return null;
  if (/[?&]sslmode=/.test(connectionString)) return null;

  return (
    'DATABASE_URL has no sslmode. postgres-js defaults to ssl:false, and managed ' +
    'Postgres rejects unencrypted connections. Append ?sslmode=require (or ' +
    'verify-full with the provider CA) to the connection string.'
  );
}

/** Warn once per process rather than on every client construction. */
let warnedAboutTls = false;

function warnAboutMissingTls(connectionString: string): void {
  if (warnedAboutTls) return;
  const warning = tlsWarningFor(connectionString);
  if (!warning) return;
  warnedAboutTls = true;
  console.warn(warning);
}

/**
 * Create a database client using a standard Postgres connection string
 *
 * @param connectionString - PostgreSQL connection string
 * @returns Typed Drizzle ORM client
 */
export function createDb(connectionString: string): DbClient {
  warnAboutMissingTls(connectionString);
  return drizzle(postgres(connectionString, poolerConnectionOptions(5)), { schema });
}

/**
 * Create a read-only replica client for analytics queries
 *
 * @param connectionString - PostgreSQL connection string for replica
 * @returns Typed Drizzle ORM client (read-only)
 */
export function createReadReplicaDb(connectionString: string): DbClient {
  warnAboutMissingTls(connectionString);
  return drizzle(
    postgres(connectionString, poolerConnectionOptions(3, { idleTimeoutSeconds: 30 })),
    { schema }
  );
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
