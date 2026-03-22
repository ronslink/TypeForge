/**
 * Regional routing middleware
 * Reads cf-ipcountry or x-region header, determines region from Clerk JWT claims,
 * and sets region and database client on the Hono context
 */

import type { Context, Next } from 'hono';
import type { Env } from '../../../../infra/contracts/bindings.js';
import { createRegionalDb, type DbClient, type Region } from '@typeforge/db';


// Extend Hono context with regional routing variables
declare module 'hono' {
  interface ContextVariableMap {
    region: Region;
    db: DbClient;
  }
}

/**
 * Regional hyperdrive bindings
 */
interface RegionalHyperdrives {
  EU: Hyperdrive;
  US: Hyperdrive;
  AF: Hyperdrive;
}

/**
 * Get region from Cloudflare IP Country header
 * Maps ISO country codes to TypeForge regions
 */
function getRegionFromIPCountry(countryCode: string | undefined): Region | null {
  if (!countryCode) return null;
  
  const countryCodeUpper = countryCode.toUpperCase();
  
  // EU countries (GDPR jurisdiction)
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
    'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES',
    'SE', 'GB', 'UK', 'IS', 'LI', 'NO', 'CH', 'ME', 'MK', 'AL', 'RS', 'TR', 'UA',
    'BY', 'MD', 'RU', 'KZ', 'UZ', 'KG', 'TJ', 'TM', 'AZ', 'AM', 'GE'
  ];
  
  // African countries
  const afCountries = [
    'ZA', 'NG', 'KE', 'EG', 'GH', 'UG', 'TZ', 'MZ', 'ZW', 'ZM', 'MW', 'BW', 'NA',
    'SZ', 'LS', 'MG', 'MU', 'SC', 'KM', 'RW', 'BI', 'SS', 'ET', 'ER', 'DJ', 'SO',
    'SD', 'TD', 'CF', 'CM', 'GQ', 'GA', 'CG', 'CD', 'AO', 'AO', 'ST', 'GN', 'GW',
    'SN', 'GM', 'ML', 'BF', 'NE', 'TG', 'BJ', 'CI', 'LR', 'SL', 'MR', 'MA', 'DZ',
    'TN', 'LY', 'EH'
  ];
  
  if (euCountries.includes(countryCodeUpper)) return 'EU';
  if (afCountries.includes(countryCodeUpper)) return 'AF';
  
  // Default to US for Americas, Asia, Oceania
  return 'US';
}

/**
 * Get region from Clerk JWT claims
 */
function getRegionFromAuth(c: Context<{ Bindings: Env }>): Region | null {
  const auth = c.get('auth');
  if (auth?.region) {
    return auth.region;
  }
  return null;
}

/**
 * Regional routing middleware
 * 
 * Priority for region determination:
 * 1. Clerk JWT claims (home_region) - most reliable
 * 2. x-region header (for testing/debugging)
 * 3. cf-ipcountry header from Cloudflare
 * 4. Default to EU for GDPR compliance
 */
export async function regionalRoutingMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  // Try to get region from auth first (most reliable)
  let region = getRegionFromAuth(c);
  
  // If no auth region, check headers
  if (!region) {
    // Check for explicit x-region header (useful for testing)
    const xRegion = c.req.header('x-region');
    if (xRegion && ['EU', 'US', 'AF'].includes(xRegion.toUpperCase())) {
      region = xRegion.toUpperCase() as Region;
    }
  }
  
  // If still no region, check Cloudflare IP country
  if (!region) {
    const cfIpCountry = c.req.header('cf-ipcountry');
    region = getRegionFromIPCountry(cfIpCountry);
  }
  
  // Default to EU for GDPR compliance
  if (!region) {
    region = 'EU';
  }
  
  // Get Hyperdrive bindings for all regions
  const hyperdrives: RegionalHyperdrives = {
    EU: c.env.HYPERDRIVE_EU,
    US: c.env.HYPERDRIVE_US,
    AF: c.env.HYPERDRIVE_AF,
  };
  
  // Check if the region's Hyperdrive is configured
  const hyperdrive = hyperdrives[region];
  if (!hyperdrive) {
    console.error(`Hyperdrive not configured for region: ${region}`);
    return c.json(
      {
        error: 'Database configuration error',
        code: 'DB_CONFIG_ERROR',
        region,
      },
      500
    );
  }
  
  // Create database client for the region
  const db = createRegionalDb(region, hyperdrives);
  
  // Store in context
  c.set('region', region);
  c.set('db', db);
  
  await next();
}

/**
 * Get database client from context
 */
export function getDb(c: Context): DbClient {
  const db = c.get('db');
  if (!db) {
    throw new Error('Database client not available. Ensure regionalRoutingMiddleware is used.');
  }
  return db;
}

/**
 * Get current region from context
 */
export function getRegion(c: Context): Region {
  return c.get('region') ?? 'EU';
}
