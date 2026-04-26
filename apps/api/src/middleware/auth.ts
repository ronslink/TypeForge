/**
 * Authentication middleware
 * Validates Clerk JWT and extracts user context
 */

import type { Context, Next } from 'hono';
import { getAuthState, extractBearerToken } from '@typeforge/auth';
import type { AuthState } from '@typeforge/auth';
import { getDb } from './regional-routing.js';
import { users, userProfiles, userPreferences } from '@typeforge/db';
import { eq } from 'drizzle-orm';

// Extend Hono context with auth state
declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthState;
  }
}

/**
 * Middleware that validates Clerk JWT and adds auth state to context
 */
export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  const token = extractBearerToken(authHeader || '');
  
  if (!token) {
    // No token provided - continue without auth (for public routes)
    await next();
    return;
  }
  
  let authState = await getAuthState(c);
  
  if (authState.isAuthenticated) {
    const db = getDb(c);
    const rawClerkId = authState.userId;
    authState.clerkId = rawClerkId;
    
    // Look up internal Postgres UUID 
    let [internalUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, rawClerkId))
      .limit(1);
      
    // JIT Auto-provisioning mechanism
    if (!internalUser) {
      if (!authState.user) throw new Error("Clerk User context required for auto-provisioning");
      
      const email = authState.user.email || `${rawClerkId}@placeholder.local`;
      [internalUser] = await db.insert(users).values({
        clerkId: rawClerkId,
        email,
        emailVerified: authState.user.emailVerified,
        firstName: authState.user.firstName,
        lastName: authState.user.lastName,
        displayName: authState.user.displayName,
        avatarUrl: authState.user.imageUrl,
        homeRegion: authState.region,
        role: authState.role,
      }).returning({ id: users.id });
      
      // Seed default sub-profiles
      try {
        await db.insert(userProfiles).values({ userId: internalUser!.id });
        await db.insert(userPreferences).values({ userId: internalUser!.id });
      } catch (e) {
        console.warn("Failed seeding initial user subprofiles: ", e);
      }
    }
    
    // Override the JWT id with the Native Postgres Internal UUID across the route scope
    authState.userId = internalUser!.id;
  }
  
  // Store auth state in context
  c.set('auth', authState);
  
  await next();
}

/**
 * Require authentication - returns 401 if not authenticated
 */
export async function requireAuth(c: Context, next: Next) {
  const auth = c.get('auth');
  
  if (!auth || !auth.isAuthenticated) {
    c.status(401);
    return c.json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }
  
  await next();
}

/**
 * Require email verification
 */
export async function requireVerifiedEmail(c: Context, next: Next) {
  const auth = c.get('auth');
  
  if (!auth || !auth.isAuthenticated) {
    c.status(401);
    return c.json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
  }
  
  if (!auth.isEmailVerified) {
    c.status(403);
    return c.json({ error: 'Email verification required', code: 'EMAIL_NOT_VERIFIED' });
  }
  
  await next();
}

/**
 * Require specific role
 */
export function requireRole(...roles: AuthState['role'][]) {
  return async (c: Context, next: Next) => {
    const auth = c.get('auth');
    
    if (!auth || !auth.isAuthenticated) {
      c.status(401);
      return c.json({ error: 'Authentication required', code: 'UNAUTHORIZED' });
    }
    
    if (!roles.includes(auth.role)) {
      c.status(403);
      return c.json({ error: 'Insufficient permissions', code: 'FORBIDDEN' });
    }
    
    await next();
  };
}

/**
 * Get auth state from context
 */
export function getAuth(c: Context): AuthState | undefined {
  return c.get('auth');
}

/**
 * Get current user ID from context
 */
export function getUserId(c: Context): string | undefined {
  return c.get('auth')?.userId;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(c: Context): boolean {
  const auth = c.get('auth');
  return auth?.isAuthenticated ?? false;
}
