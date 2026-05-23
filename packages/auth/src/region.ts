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

