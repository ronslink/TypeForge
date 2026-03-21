/**
 * Regional routing helpers
 * Extract and manage user region for database routing
 */

export type Region = 'EU' | 'US' | 'AF';

/**
 * Extract region from Clerk JWT claims
 * Falls back to EU for compliance if not specified
 */
export function extractRegionFromClaims(claims: {
  home_region?: string;
  region?: string;
  'https://typeforge.io/region'?: string;
}): Region {
  const region = 
    claims.home_region ?? 
    claims.region ?? 
    claims['https://typeforge.io/region'] ?? 
    'EU';
  
  if (!['EU', 'US', 'AF'].includes(region)) {
    return 'EU'; // Default to EU for GDPR compliance
  }
  
  return region as Region;
}

/**
 * Get region from a user object
 */
export function getRegionFromUser(user: { homeRegion?: string | null }): Region {
  if (!user.homeRegion) {
    return 'EU';
  }
  
  if (!['EU', 'US', 'AF'].includes(user.homeRegion)) {
    return 'EU';
  }
  
  return user.homeRegion as Region;
}

/**
 * Determine the best region for a new user
 * Based on request IP geolocation
 */
export function suggestRegionFromIP(ipAddress: string): Region {
  // This would integrate with a GeoIP service
  // For now, return EU as default
  // In production, use Cloudflare's country header or a GeoIP database
  
  // Simple heuristic based on IP ranges (placeholder)
  // Real implementation would use MaxMind or similar
  
  return 'EU';
}

/**
 * Region configuration
 */
export const regionConfig: Record<Region, {
  name: string;
  provider: string;
  location: string;
  compliance: string[];
}> = {
  EU: {
    name: 'Europe',
    provider: 'Hetzner',
    location: 'Frankfurt, Germany',
    compliance: ['GDPR', 'DSGVO'],
  },
  US: {
    name: 'United States',
    provider: 'Hetzner',
    location: 'Ashburn, Virginia',
    compliance: ['CCPA', 'FERPA'],
  },
  AF: {
    name: 'Africa',
    provider: 'Vultr',
    location: 'Johannesburg, South Africa',
    compliance: ['POPIA', 'Kenya DPA'],
  },
};
