import type { ApiFailure } from './failure';

/** UUID form accepted in reviewed parameterised targets. */
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

const FIXED_AUTHENTICATED_API_TARGETS = new Set([
  '/api/v1/billing/checkout',
  '/api/v1/billing/invoices',
  '/api/v1/billing/portal',
  '/api/v1/billing/subscription',
  '/api/v1/eligibility/status',
  '/api/v1/lessons/adaptive',
  '/api/v1/organisations',
  '/api/v1/privacy/requests',
  '/api/v1/progress',
  '/api/v1/progress/lessons',
  '/api/v1/progress/placement',
  '/api/v1/progress/placement/policy',
  '/api/v1/progress/stats',
  '/api/v1/progress/weakness',
  '/api/v1/sessions',
  '/api/v1/users/me',
  '/api/v1/users/me/locale',
  '/api/v1/users/me/preferences',
]);

const CANONICAL_ORGANISATION_AUTHENTICATED_API_TARGET = new RegExp(
  `^/api/v1/organisations/${UUID}(?:` +
    `|/dashboard` +
    `|/invite` +
    `|/members` +
    `|/members/${UUID}/performance` +
    `|/seats` +
    `|/seats/${UUID}` +
    `|/billing/seats` +
    `|/billing/seats/upgrade` +
    `)$`,
  'u'
);

const CANONICAL_SESSION_AUTHENTICATED_API_TARGET = new RegExp(
  `^/api/v1/sessions/${UUID}(?:/keystrokes)?$`,
  'u'
);

export function containsForbiddenAuthenticatedTargetCharacter(value: string): boolean {
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

/** Drops any query string and fragment so a path can be reviewed exactly. */
export function authenticatedTargetPath(value: string): string {
  const hashIndex = value.indexOf('#');
  const withoutHash = hashIndex === -1 ? value : value.slice(0, hashIndex);
  const queryIndex = withoutHash.indexOf('?');
  return queryIndex === -1 ? withoutHash : withoutHash.slice(0, queryIndex);
}

function isReviewedPath(path: string): boolean {
  return (
    FIXED_AUTHENTICATED_API_TARGETS.has(path) ||
    CANONICAL_ORGANISATION_AUTHENTICATED_API_TARGET.test(path) ||
    CANONICAL_SESSION_AUTHENTICATED_API_TARGET.test(path)
  );
}

/**
 * Exact reviewed targets for browser requests carrying a provider bearer.
 * Raw URL objects and broader /api/v1 prefixes are deliberately not accepted.
 */
export function isCanonicalAuthenticatedApiTarget(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !containsForbiddenAuthenticatedTargetCharacter(value) &&
    isReviewedPath(value)
  );
}

/**
 * Reviewed-target check for the shared authenticated fetch, which wraps the
 * typed RPC client and therefore may receive a query string appended by that
 * client. The path is still required to match a reviewed target exactly.
 */
export function isReviewedAuthenticatedApiTarget(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    !containsForbiddenAuthenticatedTargetCharacter(value) &&
    isReviewedPath(authenticatedTargetPath(value))
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
