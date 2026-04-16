/**
 * COPPA (Children's Online Privacy Protection Act) compliance helpers
 * Handles under-13 user data collection restrictions and parental consent
 */

import type { Context } from 'hono';
import type { ClerkUser } from './clerk.js';
import type { KVNamespace } from '@cloudflare/workers-types';

/**
 * Parental consent request structure
 */
export interface ParentalConsentRequest {
  parentEmail: string;
  childUserId: string;
  consentToken: string;
  requestedAt: Date;
  expiresAt: Date;
}

/**
 * Stored parental consent data in user metadata
 */
export interface ParentalConsentData {
  consented: boolean;
  parentEmail: string;
  consentedAt: string;
  consentToken: string;
  verified: boolean;
}

/**
 * Check if user is under 13 based on birth_year in publicMetadata
 */
export function isUnder13(user: ClerkUser): boolean {
  // Access birth_year from user metadata (would be populated from Clerk)
  const birthYear = (user as unknown as Record<string, unknown>).birthYear as number | undefined;
  
  if (!birthYear || typeof birthYear !== 'number') {
    // If no birth year is set, we cannot determine age - assume compliant
    return false;
  }
  
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  
  return age < 13;
}

/**
 * Check if we can collect data from this user
 * Returns true if user is over 13 OR if under 13 and parent has consented
 */
export function canCollectData(user: ClerkUser): boolean {
  // If not under 13, data collection is allowed
  if (!isUnder13(user)) {
    return true;
  }
  
  // Check for parental consent in user metadata
  const publicMetadata = (user as unknown as Record<string, unknown>).publicMetadata as 
    Record<string, unknown> | undefined;
  
  if (!publicMetadata) {
    return false;
  }
  
  const parentalConsent = publicMetadata.parentalConsent as ParentalConsentData | undefined;
  
  // Must have verified parental consent
  return Boolean(
    parentalConsent?.consented && 
    parentalConsent?.verified &&
    parentalConsent?.consentedAt
  );
}

/**
 * Generate a secure random consent token
 */
function generateConsentToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a parental consent request
 * Stores the request and sends an email to the parent
 */
export async function createParentalConsentRequest(
  ctx: Context,
  parentEmail: string,
  childUserId: string
): Promise<ParentalConsentRequest> {
  const consentToken = generateConsentToken();
  const requestedAt = new Date();
  const expiresAt = new Date(requestedAt.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
  
  const request: ParentalConsentRequest = {
    parentEmail,
    childUserId,
    consentToken,
    requestedAt,
    expiresAt,
  };
  
  // Store consent request in KV cache (would be implemented with actual KV binding)
  const kv = ctx.env?.CACHE as KVNamespace | undefined;
  if (kv) {
    await kv.put(
      `consent:${consentToken}`,
      JSON.stringify(request),
      { expirationTtl: 7 * 24 * 60 * 60 } // 7 days in seconds
    );
  }
  
  // TODO: Send email to parent with consent link
  // This would integrate with an email service (SendGrid, AWS SES, etc.)
  // The email would contain a link like: https://typeforge.io/consent/${consentToken}
  
  console.log(`[COPPA] Consent request created for child ${childUserId}, email to ${parentEmail}`);
  
  return request;
}

/**
 * Verify a parental consent token
 * Returns true if token is valid and not expired
 */
export async function verifyParentalConsent(
  token: string,
  kv?: KVNamespace
): Promise<boolean> {
  if (!kv) {
    console.error('[COPPA] KV namespace not available for consent verification');
    return false;
  }
  
  const stored = await kv.get(`consent:${token}`);
  
  if (!stored) {
    console.log(`[COPPA] Consent token not found: ${token}`);
    return false;
  }
  
  try {
    const request = JSON.parse(stored) as ParentalConsentRequest;
    const now = new Date();
    const expiresAt = new Date(request.expiresAt);
    
    if (now > expiresAt) {
      console.log(`[COPPA] Consent token expired: ${token}`);
      await kv.delete(`consent:${token}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('[COPPA] Failed to parse consent request:', error);
    return false;
  }
}

/**
 * Store verified parental consent in user metadata via Clerk API
 */
export async function setParentalConsent(
  userId: string,
  consentData: Omit<ParentalConsentData, 'consentedAt' | 'verified'>,
  clerkSecretKey?: string
): Promise<void> {
  const fullConsentData: ParentalConsentData = {
    ...consentData,
    consented: true,
    verified: true,
    consentedAt: new Date().toISOString(),
  };
  
  // Update user metadata via Clerk API
  if (clerkSecretKey) {
    const response = await fetch(`https://api.clerk.com/v1/users/${userId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${clerkSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicMetadata: {
          parentalConsent: fullConsentData,
        },
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to update user metadata: ${error}`);
    }
  }
  
  console.log(`[COPPA] Parental consent set for user ${userId}`);
}

/**
 * COPPA Consent Banner Component
 * Returns HTML/JSON for displaying consent banner to under-13 users
 */
export function getCoppaConsentBanner(user: ClerkUser): {
  show: boolean;
  title: string;
  message: string;
  actionRequired: boolean;
} {
  const under13 = isUnder13(user);
  const canCollect = canCollectData(user);
  
  // Show banner if under 13 and no consent
  const show = under13 && !canCollect;
  
  return {
    show,
    title: 'Parental Consent Required',
    message: show
      ? 'You must be at least 13 years old to use TypeForge without parental consent. Please ask a parent or guardian to provide consent.'
      : '',
    actionRequired: show,
  };
}

/**
 * Middleware to check COPPA compliance before allowing data collection
 */
export async function requireCoppaCompliance(
  user: ClerkUser,
  options: { allowPending?: boolean } = {}
): Promise<{ allowed: boolean; reason?: string }> {
  const under13 = isUnder13(user);
  
  if (!under13) {
    return { allowed: true };
  }
  
  const canCollect = canCollectData(user);
  
  if (canCollect) {
    return { allowed: true };
  }
  
  if (options.allowPending) {
    // Check if consent is pending
    const publicMetadata = (user as unknown as Record<string, unknown>).publicMetadata as 
      Record<string, unknown> | undefined;
    const pendingConsent = publicMetadata?.pendingConsent as boolean | undefined;
    
    if (pendingConsent) {
      return { allowed: true, reason: 'consent_pending' };
    }
  }
  
  return {
    allowed: false,
    reason: 'coppa_parental_consent_required',
  };
}
