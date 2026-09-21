import type { ApiFailure } from './failure';

const FIXED_AUTHENTICATED_API_TARGETS = new Set([
  '/api/v1/billing/invoices',
  '/api/v1/billing/subscription',
  '/api/v1/eligibility/status',
  '/api/v1/organisations',
  '/api/v1/privacy/requests',
  '/api/v1/progress',
  '/api/v1/sessions',
  '/api/v1/users/me',
  '/api/v1/users/me/locale',
  '/api/v1/users/me/preferences',
]);
const CANONICAL_ORGANISATION_AUTHENTICATED_API_TARGET =
  /^\/api\/v1\/organisations\/[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}(?:\/members)?(?![\s\S])/u;

function containsForbiddenAuthenticatedTargetCharacter(value: string): boolean {
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    if (
      codePoint === undefined ||
      codePoint <= 0x1f ||
      codePoint === 0x7f ||
      codePoint === 0x2028 ||
      codePoint === 0x2029
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Exact reviewed targets for browser requests carrying a provider bearer.
 * Raw URL objects and broader /api/v1 prefixes are deliberately not accepted.
 */
export function isCanonicalAuthenticatedApiTarget(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !containsForbiddenAuthenticatedTargetCharacter(value) &&
    (FIXED_AUTHENTICATED_API_TARGETS.has(value) ||
      CANONICAL_ORGANISATION_AUTHENTICATED_API_TARGET.test(value))
  );
}

/**
 * A rooted path can still follow a cross-origin document base. The browser
 * check is repeated after token lookup; non-browser source tests have no base.
 */
export function resolvesAgainstCurrentBrowserOrigin(target: string): boolean {
  if (typeof globalThis.location === 'undefined') return true;
  if (!globalThis.location.origin || globalThis.location.origin === 'null') return false;

  try {
    const base =
      typeof globalThis.document === 'undefined'
        ? `${globalThis.location.origin}/`
        : globalThis.document.baseURI;
    return new URL(target, base).origin === globalThis.location.origin;
  } catch {
    return false;
  }
}

export function invalidAuthenticatedApiTargetFailure(): ApiFailure {
  return {
    kind: 'client',
    code: 'INVALID_REQUEST',
    status: null,
    requestId: null,
    retryAfterSeconds: null,
    recovery: 'none',
    outcome: 'verified_rejected',
    message: 'This authenticated request could not be sent safely.',
  };
}
