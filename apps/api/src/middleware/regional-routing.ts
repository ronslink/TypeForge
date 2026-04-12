/**
 * Database routing middleware
 * Sets database client on the Hono context
 */

import type { Context, Next } from 'hono';
import { createDb, type DbClient } from '@typeforge/db';

// Extend Hono context with database variable
declare module 'hono' {
  interface ContextVariableMap {
    db: DbClient;
  }
}

/**
 * Database routing middleware
 * 
 * Injects a global Drizzle connection based on DATABASE_URL
 */
export async function dbMiddleware(c: Context, next: Next) {
  let dbUrl = (c.env as any)?.DATABASE_URL || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.error('Database connection string is missing from Hono context block!');
    return c.json(
      {
        error: 'Database configuration error',
        code: 'DB_CONFIG_ERROR',
      },
      500
    );
  }
  
  // Ensure unencoded base64 pg passwords resolve correctly for drizzle
  if (dbUrl.includes('+')) {
    dbUrl = dbUrl.replace(/\+/g, '%2B');
  }

  // Create database client
  const db = createDb(dbUrl);
  
  // Store in context
  c.set('db', db);
  
  await next();
}

/**
 * Get database client from context
 */
export function getDb(c: Context): DbClient {
  const db = c.get('db');
  if (!db) {
    throw new Error('Database client not available. Ensure dbMiddleware is used.');
  }
  return db;
}
