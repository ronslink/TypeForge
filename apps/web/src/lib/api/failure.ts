export type RecoveryAction =
  | 'retry_manually'
  | 'retry_after_delay'
  | 'reauthenticate'
  | 'resolve_eligibility'
  | 'change_request'
  | 'contact_support'
  | 'none';

export type FailureKind =
  | 'offline'
  | 'timeout'
  | 'invalid_response'
  | 'unauthenticated'
  | 'eligibility_blocked'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'client'
  | 'server'
  | 'unknown';

export type OutcomeState = 'verified_rejected' | 'unverified';

import {
  formatRecoveryMessage,
  recoveryMessage,
  type RecoveryMessage,
  type RecoveryTranslator,
} from '../i18n/recovery-message';

export interface ApiFailure {
  kind: FailureKind;
  code: string;
  status: number | null;
  requestId: string | null;
  retryAfterSeconds: number | null;
  recovery: RecoveryAction;
  outcome: OutcomeState;
  /** Safe product-owned prose. Server-provided prose is never copied here. */
  message: string;
}

interface ErrorBody {
  code?: unknown;
  requestId?: unknown;
  retryAfter?: unknown;
}

const ELIGIBILITY_CODES = new Set([
  'ACCOUNT_NOT_PROVISIONED',
  'ADULT_INSTITUTIONS_NOT_READY',
  'CHECKOUT_CONTEXT_REQUIRED',
  'COMMERCE_NOT_READY',
  'ELIGIBILITY_REQUIRED',
  'K12_NOT_READY',
  'MARKET_NOT_ELIGIBLE',
  'PRODUCT_NOT_AVAILABLE',
]);

// Only static product-owned codes may enter UI state or diagnostics. Unknown
// values collapse to the HTTP status so a provider or compromised response
// cannot smuggle a direct identifier through an error-code field.
const PUBLIC_ERROR_CODES = new Set([
  'ACCOUNT_NOT_PROVISIONED',
  'ACTIVE_REQUEST_CONFLICT',
  'ADULT_INSTITUTIONS_NOT_READY',
  'API_PROXY_FAILURE',
  'CHECKOUT_CONTEXT_REQUIRED',
  'COMMERCE_NOT_READY',
  'COOLDOWN_ACTIVE',
  'DB_CONFIG_ERROR',
  'ELIGIBILITY_REQUIRED',
  'FORBIDDEN',
  'IDEMPOTENCY_KEY_EXPIRED',
  'ACTIVITY_SNAPSHOT_NOT_CURRENT',
  'IDEMPOTENCY_KEY_REUSED',
  'IDEMPOTENCY_REQUEST_IN_PROGRESS',
  'INTERNAL_ERROR',
  'INVALID_COOLDOWN',
  'INVALID_DOWNGRADE',
  'INVALID_IDEMPOTENCY_KEY',
  'INVALID_INTERVAL',
  'INVALID_REQUEST',
  'INVALID_SIGNATURE',
  'INVALID_UI_LOCALE',
  'INVALID_USER_ID',
  'ITEM_NOT_FOUND',
  'K12_NOT_READY',
  'MARKET_NOT_ELIGIBLE',
  'NOT_FOUND',
  'NO_CUSTOMER',
  'NO_SUBSCRIPTION',
  'PREFERENCES_NOT_PROVISIONED',
  'PRODUCT_NOT_AVAILABLE',
  'RATE_LIMIT_EXCEEDED',
  'RAW_INPUT_PERSISTENCE_PROHIBITED',
  'RAW_KEYSTROKES_DEPRECATED',
  'TENANT_ANALYTICS_NOT_READY',
  'UNAUTHORIZED',
  'VALIDATION_ERROR',
]);

const REQUEST_ID_PATTERN =
  /^tsr_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function boundedSeconds(value: unknown): number | null {
  const number = typeof value === 'string' || typeof value === 'number' ? Number(value) : NaN;
  return Number.isFinite(number) && number >= 0 && number <= 86_400 ? Math.ceil(number) : null;
}

/** Accept only server-owned, opaque correlation identifiers. */
export function normalizeRequestId(value: unknown): string | null {
  return typeof value === 'string' && REQUEST_ID_PATTERN.test(value) ? value.toLowerCase() : null;
}

export function normalizeFailureCode(value: unknown, status: number | null): string {
  if (typeof value === 'string' && PUBLIC_ERROR_CODES.has(value)) return value;
  return status !== null && Number.isInteger(status) && status >= 100 && status <= 599
    ? `HTTP_${status}`
    : 'UNKNOWN_FAILURE';
}

function statusDecision(
  status: number,
  code: string
): Pick<ApiFailure, 'kind' | 'recovery' | 'message'> {
  if (status === 401) {
    return {
      kind: 'unauthenticated',
      recovery: 'reauthenticate',
      message: 'Your sign-in session could not be verified. Sign in again before retrying.',
    };
  }

  if (status === 403 && ELIGIBILITY_CODES.has(code)) {
    return {
      kind: 'eligibility_blocked',
      recovery: 'resolve_eligibility',
      message: 'This action is not available under the current account or launch eligibility.',
    };
  }

  if (status === 403) {
    return {
      kind: 'forbidden',
      recovery: 'none',
      message: 'The current account does not have permission to perform this action.',
    };
  }

  if (status === 408) {
    return {
      kind: 'timeout',
      recovery: 'retry_manually',
      message: 'The service timed out before the request outcome could be verified.',
    };
  }

  if (status === 404) {
    return {
      kind: 'not_found',
      recovery: 'none',
      message: 'The requested item is not available.',
    };
  }

  if (status === 409 && code === 'IDEMPOTENCY_REQUEST_IN_PROGRESS') {
    return {
      kind: 'conflict',
      recovery: 'retry_after_delay',
      message: 'The original request is still being processed. Wait before checking it again.',
    };
  }

  if (status === 409) {
    return {
      kind: 'conflict',
      recovery: 'change_request',
      message: 'This request conflicts with the current state. Review it before trying again.',
    };
  }

  if (status === 429) {
    return {
      kind: 'rate_limited',
      recovery: 'retry_after_delay',
      message: 'Too many requests were received. Wait before trying again.',
    };
  }

  if (status >= 500) {
    return {
      kind: 'server',
      recovery: 'retry_manually',
      message: 'The service could not complete this request. Its outcome may be unverified.',
    };
  }

  if (status >= 400) {
    return {
      kind: 'client',
      recovery: 'change_request',
      message: 'The request was not accepted. Review the information and try again.',
    };
  }

  return {
    kind: 'unknown',
    recovery: 'none',
    message: 'This request could not be completed or verified.',
  };
}

/**
 * Convert an unsuccessful API response into a safe, predictable recovery
 * decision. Server-supplied prose and validation values are intentionally not
 * rendered to users or copied into diagnostics.
 */
export async function readApiFailure(response: Response): Promise<ApiFailure> {
  let body: ErrorBody = {};
  try {
    body = (await response.clone().json()) as ErrorBody;
  } catch {
    // HTML, empty and malformed error bodies use the status-only fallback.
  }

  const code = normalizeFailureCode(body.code, response.status);
  const decision = statusDecision(response.status, code);
  const headerRequestId = normalizeRequestId(response.headers.get('x-request-id'));
  const bodyRequestId = normalizeRequestId(body.requestId);
  const retryHeader = boundedSeconds(response.headers.get('retry-after'));

  return {
    ...decision,
    code,
    status: response.status,
    requestId: headerRequestId ?? bodyRequestId,
    retryAfterSeconds: retryHeader ?? boundedSeconds(body.retryAfter),
    outcome: response.status === 408 || response.status >= 500 ? 'unverified' : 'verified_rejected',
  };
}

/** Build a safe failure when a nominally successful JSON response is malformed. */
export function invalidResponseFailure(response: Response): ApiFailure {
  return invalidDataFailure(
    response.status,
    normalizeRequestId(response.headers.get('x-request-id'))
  );
}

/** Build the same conservative state when parsed JSON fails a page-owned schema guard. */
export function invalidDataFailure(status: number, requestId: string | null): ApiFailure {
  return {
    kind: 'invalid_response',
    code: 'INVALID_API_RESPONSE',
    status,
    requestId: normalizeRequestId(requestId),
    retryAfterSeconds: null,
    recovery: 'contact_support',
    outcome: 'unverified',
    message: 'The service returned a response that could not be verified.',
  };
}

/** Build a local failure when an authenticated request has no usable session token. */
export function sessionTokenUnavailableFailure(): ApiFailure {
  return {
    kind: 'unauthenticated',
    code: 'UNAUTHORIZED',
    status: 401,
    requestId: null,
    retryAfterSeconds: null,
    recovery: 'reauthenticate',
    outcome: 'verified_rejected',
    message: 'Your sign-in session could not be verified. Sign in again before retrying.',
  };
}

/** Classify transport failures without assuming whether a mutation committed. */
export function readTransportFailure(error: unknown): ApiFailure {
  const isAbort =
    (typeof DOMException !== 'undefined' &&
      error instanceof DOMException &&
      error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError');

  return {
    kind: isAbort ? 'timeout' : 'offline',
    code: isAbort ? 'REQUEST_TIMEOUT' : 'NETWORK_UNAVAILABLE',
    status: null,
    requestId: null,
    retryAfterSeconds: null,
    recovery: 'retry_manually',
    outcome: 'unverified',
    message: isAbort
      ? 'The request timed out and its outcome is unverified.'
      : 'The service could not be reached and the request outcome is unverified.',
  };
}

export function formatFailureMessage(failure: ApiFailure): string {
  return failure.requestId ? `${failure.message} Reference: ${failure.requestId}` : failure.message;
}

/** Map stable failure facts to localizable presentation without changing recovery policy. */
export function apiFailureRecoveryMessage(failure: ApiFailure): RecoveryMessage {
  let key: RecoveryMessage['parts'][number];
  if (failure.kind === 'conflict' && failure.code === 'IDEMPOTENCY_REQUEST_IN_PROGRESS')
    key = 'recovery_in_progress';
  else if (failure.kind === 'invalid_response') key = 'recovery_invalid_response';
  else {
    key = (
      {
        offline: 'recovery_offline',
        timeout: 'recovery_timeout',
        unauthenticated: 'recovery_unauthenticated',
        eligibility_blocked: 'recovery_eligibility_blocked',
        forbidden: 'recovery_forbidden',
        not_found: 'recovery_not_found',
        conflict: 'recovery_conflict',
        rate_limited: 'recovery_rate_limited',
        client: 'recovery_client',
        server: 'recovery_server',
        unknown: 'recovery_unknown',
      } as const
    )[failure.kind];
  }
  return recoveryMessage(key, { requestId: failure.requestId });
}

export function formatLocalizedFailureMessage(
  failure: ApiFailure,
  translate: RecoveryTranslator
): string {
  const message = apiFailureRecoveryMessage(failure);
  const parts = [...message.parts];
  if (failure.kind === 'unauthenticated') parts.push('recovery_sign_in_again');
  if (failure.kind === 'conflict' && failure.code === 'IDEMPOTENCY_REQUEST_IN_PROGRESS')
    parts.push('recovery_wait_request');
  return formatRecoveryMessage(recoveryMessage(parts, { requestId: message.requestId }), translate);
}
