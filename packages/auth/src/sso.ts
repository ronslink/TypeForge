/**
 * Google Workspace SSO for schools
 * Handles OAuth flow for educational institutions using Google Workspace
 */

import type { Context } from 'hono';

/**
 * Google OAuth tokens response
 */
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  id_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

/**
 * Google user info from ID token
 */
export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  hd?: string; // Hosted domain (for Workspace users)
}

/**
 * Workspace configuration for an organization
 */
export interface WorkspaceConfig {
  orgId: string;
  domain: string;
  verified: boolean;
  ssoEnabled: boolean;
  defaultRole: 'learner' | 'teacher' | 'org_admin';
  autoProvision: boolean;
  allowedRoles?: string[];
}

/**
 * Clerk organization membership helper result
 */
export interface OrgMembershipResult {
  success: boolean;
  membershipId?: string;
  error?: string;
}

/**
 * Generate Google OAuth URL with Workspace-specific parameters
 */
export function getGoogleAuthUrl(
  state: string,
  options: {
    clientId: string;
    redirectUri: string;
    scopes?: string[];
    hd?: string; // Hosted domain hint
    prompt?: string;
  }
): string {
  const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

  const defaultScopes = ['openid', 'email', 'profile'];

  const scopes = options.scopes || defaultScopes;

  const params = new URLSearchParams({
    client_id: options.clientId,
    redirect_uri: options.redirectUri,
    response_type: 'code',
    scope: scopes.join(' '),
    state,
    access_type: 'offline',
    include_granted_scopes: 'true',
  });

  // Add hosted domain hint if specified (restricts to Workspace domain)
  if (options.hd) {
    params.append('hd', options.hd);
  }

  // Prompt for consent to ensure we get refresh token
  if (options.prompt) {
    params.append('prompt', options.prompt);
  } else {
    params.append('prompt', 'consent select_account');
  }

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Exchange authorization code for Google OAuth tokens
 */
export async function exchangeGoogleCode(
  code: string,
  options: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }
): Promise<GoogleTokens> {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const body = new URLSearchParams({
    code,
    client_id: options.clientId,
    client_secret: options.clientSecret,
    redirect_uri: options.redirectUri,
    grant_type: 'authorization_code',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  const tokens = (await response.json()) as GoogleTokens;
  return tokens;
}

/**
 * Decode and verify Google ID token
 * Note: In production, you should verify the token signature
 */
export function decodeGoogleIdToken(idToken: string): GoogleUserInfo {
  const parts = idToken.split('.');

  if (parts.length !== 3) {
    throw new Error('Invalid ID token format');
  }

  // Decode the payload (middle part)
  const payload = parts[1];
  if (!payload) {
    throw new Error('Invalid ID token format: missing payload');
  }
  const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

  return JSON.parse(decodedPayload) as GoogleUserInfo;
}

/**
 * Extract domain from email address
 */
export function getWorkspaceDomain(email: string): string | null {
  const match = email.match(/@(.+)$/);
  if (!match) return null;
  const domain = match[1];
  return domain ? domain.toLowerCase() : null;
}

/**
 * Verify if a workspace domain is registered for an organization
 * Checks against the database for verified domains
 */
export async function verifyWorkspaceDomain(
  domain: string,
  db?: { select: () => unknown } // Simplified DB interface
): Promise<WorkspaceConfig | null> {
  // In a real implementation, this would query the database
  // For now, we'll return a mock implementation

  if (!db) {
    console.warn('[SSO] No database provided for domain verification');
    return null;
  }

  // This would typically query an org_settings or org_domains table
  // Example query (pseudo-code):
  // const config = await db
  //   .select()
  //   .from(orgDomains)
  //   .where(and(
  //     eq(orgDomains.domain, domain),
  //     eq(orgDomains.verified, true),
  //     eq(orgDomains.ssoEnabled, true)
  //   ))
  //   .innerJoin(organisations, eq(orgDomains.orgId, organisations.id))
  //   .limit(1);

  console.log(`[SSO] Verifying workspace domain: ${domain}`);

  // Return null to indicate domain not found or not verified
  // In production, this would return the actual workspace config
  return null;
}

/**
 * Link a user to an organization via Clerk
 * Creates organization membership for SSO users
 */
export async function linkUserToOrg(
  userId: string,
  orgId: string,
  role: 'learner' | 'teacher' | 'org_admin' = 'learner',
  clerkSecretKey?: string
): Promise<OrgMembershipResult> {
  if (!clerkSecretKey) {
    return {
      success: false,
      error: 'Clerk secret key not configured',
    };
  }

  try {
    // Check if user is already a member
    const checkResponse = await fetch(
      `https://api.clerk.com/v1/organizations/${orgId}/memberships?user_id=${userId}`,
      {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
        },
      }
    );

    if (checkResponse.ok) {
      const existing = (await checkResponse.json()) as { data: unknown[] };
      if (existing.data && existing.data.length > 0) {
        return {
          success: true,
          membershipId: (existing.data[0] as { id: string }).id,
        };
      }
    }

    // Create new membership
    const response = await fetch(`https://api.clerk.com/v1/organizations/${orgId}/memberships`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        role: mapRoleToClerkRole(role),
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create org membership: ${error}`);
    }

    const result = (await response.json()) as { id: string };

    console.log(`[SSO] Linked user ${userId} to org ${orgId} with role ${role}`);

    return {
      success: true,
      membershipId: result.id,
    };
  } catch (error) {
    console.error('[SSO] Failed to link user to org:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Map internal roles to Clerk organization roles
 */
function mapRoleToClerkRole(role: 'learner' | 'teacher' | 'org_admin'): string {
  const roleMap: Record<string, string> = {
    learner: 'org:member',
    teacher: 'org:teacher',
    org_admin: 'org:admin',
  };

  return roleMap[role] || 'org:member';
}

/**
 * Handle the complete Google Workspace SSO flow
 */
export async function handleGoogleWorkspaceSSO(
  _ctx: Context,
  options: {
    code: string;
    state: string;
    googleClientId: string;
    googleClientSecret: string;
    redirectUri: string;
    clerkSecretKey: string;
  }
): Promise<{
  success: boolean;
  user?: GoogleUserInfo;
  orgId?: string;
  error?: string;
}> {
  try {
    // Exchange code for tokens
    const tokens = await exchangeGoogleCode(options.code, {
      clientId: options.googleClientId,
      clientSecret: options.googleClientSecret,
      redirectUri: options.redirectUri,
    });

    // Decode ID token to get user info
    const userInfo = decodeGoogleIdToken(tokens.id_token);

    // Verify email is from a Workspace domain
    if (!userInfo.hd) {
      return {
        success: false,
        error: 'Not a Google Workspace account',
      };
    }

    // Verify the workspace domain is registered
    const workspaceConfig = await verifyWorkspaceDomain(userInfo.hd);

    if (!workspaceConfig) {
      return {
        success: false,
        error: 'Workspace domain not registered',
      };
    }

    // Link user to organization
    const linkResult = await linkUserToOrg(
      userInfo.sub,
      workspaceConfig.orgId,
      workspaceConfig.defaultRole,
      options.clerkSecretKey
    );

    if (!linkResult.success) {
      return {
        success: false,
        error: linkResult.error || 'Failed to link user to organization',
      };
    }

    return {
      success: true,
      user: userInfo,
      orgId: workspaceConfig.orgId,
    };
  } catch (error) {
    console.error('[SSO] Workspace SSO failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'SSO failed',
    };
  }
}

/**
 * Generate state parameter for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Store OAuth state in KV for verification
 */
export async function storeOAuthState(
  state: string,
  data: Record<string, unknown>,
  kv: any,
  ttlSeconds: number = 600 // 10 minutes
): Promise<void> {
  await kv.put(`oauth:state:${state}`, JSON.stringify(data), {
    expirationTtl: ttlSeconds,
  });
}

/**
 * Verify and retrieve OAuth state
 */
export async function verifyOAuthState(
  state: string,
  kv: any
): Promise<Record<string, unknown> | null> {
  const key = `oauth:state:${state}`;
  const stored = await kv.get(key);

  if (!stored) {
    return null;
  }

  // Delete after retrieval (one-time use)
  await kv.delete(key);

  try {
    return JSON.parse(stored) as Record<string, unknown>;
  } catch {
    return null;
  }
}
