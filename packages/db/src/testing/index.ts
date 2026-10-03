/**
 * Test-only database harness.
 *
 * Runs the real `drizzle/` migrations against an in-process PostgreSQL (PGlite),
 * so constraints, enums and `ON CONFLICT` semantics are the genuine article
 * without needing a database service locally or in CI.
 *
 * Deliberately not exported from the package root: importing this pulls in
 * PGlite, which nothing in the application should depend on.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import type { DbClient } from '../client.js';
import * as schema from '../schema/index.js';

const DRIZZLE_DIR = fileURLToPath(new URL('../../drizzle/', import.meta.url));
const STATEMENT_BREAKPOINT = '--> statement-breakpoint';

interface MigrationJournal {
  entries: Array<{ idx: number; tag: string }>;
}

export interface Migration {
  tag: string;
  statements: string[];
}

/**
 * Read the migration journal and hand back each migration's statements in the
 * order the journal declares, so the harness applies exactly what
 * `drizzle-kit migrate` would.
 */
export function readMigrations(): Migration[] {
  const journal = JSON.parse(
    readFileSync(path.join(DRIZZLE_DIR, 'meta', '_journal.json'), 'utf8')
  ) as MigrationJournal;

  return [...journal.entries]
    .sort((left, right) => left.idx - right.idx)
    .map((entry) => ({
      tag: entry.tag,
      statements: readFileSync(path.join(DRIZZLE_DIR, `${entry.tag}.sql`), 'utf8')
        .split(STATEMENT_BREAKPOINT)
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0),
    }));
}

export interface TestDatabase {
  /** The Drizzle client the route handlers expect. */
  db: DbClient;
  /** Raw PGlite handle, for assertions that want to run their own SQL. */
  client: PGlite;
  /** Which migrations were applied, in order. */
  appliedMigrations: string[];
  close(): Promise<void>;
}

export interface TestDatabaseOptions {
  /** Set to false to get an empty database. Defaults to applying every migration. */
  applyMigrations?: boolean;
}

export async function createTestDatabase(
  options: TestDatabaseOptions = {}
): Promise<TestDatabase> {
  const client = new PGlite();
  await client.waitReady;

  const appliedMigrations: string[] = [];

  if (options.applyMigrations !== false) {
    for (const migration of readMigrations()) {
      for (const statement of migration.statements) {
        try {
          await client.exec(statement);
        } catch (error) {
          // Name the migration and the statement: a bare driver error here is
          // almost impossible to attribute otherwise.
          throw new Error(
            `Migration ${migration.tag} failed on statement:\n${statement.slice(0, 200)}\n\n${
              (error as Error).message
            }`
          );
        }
      }
      appliedMigrations.push(migration.tag);
    }
  }

  // Drizzle's query builder is driver-agnostic — the SQL it emits is identical
  // across adapters — so only the adapter *type* differs from production. This
  // cast is the single, deliberate boundary.
  const db = drizzle(client, { schema }) as unknown as DbClient;

  return {
    db,
    client,
    appliedMigrations,
    close: () => client.close(),
  };
}
