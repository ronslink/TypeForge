/**
 * @typeforge/db — Database package entry point
 * Exports Drizzle ORM client and schema
 */

export * from './schema/index.js';
export { createDb, type DbClient } from './client.js';
