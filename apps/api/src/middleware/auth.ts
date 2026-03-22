/**
 * Authentication middleware
 * Validates Clerk JWT and extracts user context
 */

import type { Context, Next } from 'hono';
import { getAuthState, extractBearerToken } from '@typeforge/auth';
import type { AuthState } from '@typeforge/auth';

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
  
  const authState = await getAuthState(c);
  
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
