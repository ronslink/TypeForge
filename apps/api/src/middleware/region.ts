/**
 * Regional database routing middleware
 * Routes requests to the correct regional database based on user's home region
 */

import type { Context, Next } from 'hono';
import { createRegionalDb, type DbClient, type Region } from '@typeforge/db';
import type { AuthState } from '@typeforge/auth';

// Extend Hono context with database client
declare module 'hono' {
  interface ContextVariableMap {
    db: DbClient;
    region: Region;
  }
}

/**
 * Middleware that provides the correct database client based on user's region
 * Must be used after authMiddleware
 */
export async function regionMiddleware(c: Context, next: Next) {
  const auth = c.get('auth');
  
  // Default to EU region if no auth context
  const region: Region = auth?.region ?? 'EU';
  
  // Get Hyperdrive bindings for all regions
  const hyperdrives = {
    EU: c.env.HYPERDRIVE_EU,
    US: c.env.HYPERDRIVE_US,
    AF: c.env.HYPERDRIVE_AF,
  };
  
  // Check if the region's Hyperdrive is configured
  const hyperdrive = hyperdrives[region];
  if (!hyperdrive) {
    console.error(`Hyperdrive not configured for region: ${region}`);
    c.status(500);
    return c.json({ 
      error: 'Database configuration error', 
      code: 'DB_CONFIG_ERROR',
      region 
    });
  }
  
  // Create database client for the region
  const db = createRegionalDb(region, hyperdrives);
  
  // Store in context
  c.set('db', db);
  c.set('region', region);
  
  await next();
}

/**
 * Get database client from context
 */
export function getDb(c: Context): DbClient {
  const db = c.get('db');
  if (!db) {
    throw new Error('Database client not available. Ensure regionMiddleware is used.');
  }
  return db;
}

/**
 * Get current region from context
 */
export function getRegion(c: Context): Region {
  return c.get('region') ?? 'EU';
}
