/**
 * Clerk authentication helpers
 * JWT validation, user extraction, auth state management
 */

import type { Region } from './region.js';

export interface ClerkUser {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  imageUrl?: string;
  homeRegion: Region;
  role: 'learner' | 'teacher' | 'org_admin' | 'platform_admin';
  orgId?: string;
  orgRole?: string;
}

export interface AuthState {
  userId: string;
  user: ClerkUser | null;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  region: Region;
  role: ClerkUser['role'];
  orgId?: string;
}

/**
 * Validate a Clerk JWT token
 * Returns the decoded claims if valid, throws if invalid
 */
export async function validateJWT(
  token: string,
  secretKey: string
): Promise<Record<string, unknown>> {
  // In production, use Clerk's backend SDK
  // This is a placeholder that will be replaced with actual Clerk validation
  const { verifyToken } = await import('@clerk/backend');
  
  const payload = await verifyToken(token, {
    secretKey,
  });
  
  return payload as Record<string, unknown>;
}

/**
 * Get the current user from a Clerk JWT token
 * Extracts user information and regional context
 */
export async function getCurrentUser(
  token: string,
  secretKey: string
): Promise<ClerkUser | null> {
  try {
    const claims = await validateJWT(token, secretKey);
    
    return {
      id: claims.sub as string,
      email: claims.email as string,
      emailVerified: claims.email_verified as boolean,
      firstName: claims.first_name as string | undefined,
      lastName: claims.last_name as string | undefined,
      displayName: claims.name as string | undefined,
      imageUrl: claims.image_url as string | undefined,
      homeRegion: (claims.home_region as Region) || 'EU',
      role: (claims.role as ClerkUser['role']) || 'learner',
      orgId: claims.org_id as string | undefined,
      orgRole: claims.org_role as string | undefined,
    };
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
}

/**
 * Get the full authentication state from a request
 * Combines user info with permissions context
 */
export async function getAuthState(
  token: string,
  secretKey: string
): Promise<AuthState> {
  const user = await getCurrentUser(token, secretKey);
  
  if (!user) {
    return {
      userId: '',
      user: null,
      isAuthenticated: false,
      isEmailVerified: false,
      region: 'EU',
      role: 'learner',
    };
  }
  
  return {
    userId: user.id,
    user,
    isAuthenticated: true,
    isEmailVerified: user.emailVerified,
    region: user.homeRegion,
    role: user.role,
    orgId: user.orgId,
  };
}

/**
 * Extract the Bearer token from an Authorization header
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
