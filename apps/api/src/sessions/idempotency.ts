import { createHash } from 'node:crypto';

export const SESSION_IDEMPOTENCY_VERSION = 'typeforge-session-idempotency-v1' as const;
export const IDEMPOTENCY_RETENTION_DAYS = 7;
export const IDEMPOTENCY_KEY_MIN_LENGTH = 8;
export const IDEMPOTENCY_KEY_MAX_LENGTH = 128;

export type SessionOperation = 'create' | 'update';
export type IdempotencyStatus = 'pending' | 'completed';

const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]*$/;

/**
 * Accept only an opaque, well-formed client key. A key that is missing or
 * malformed must never be silently coerced, because doing so would make two
 * different attempts collide.
 */
export function normalizeIdempotencyKey(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length >= IDEMPOTENCY_KEY_MIN_LENGTH &&
    normalized.length <= IDEMPOTENCY_KEY_MAX_LENGTH &&
    KEY_PATTERN.test(normalized)
    ? normalized
    : null;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, child]) => child !== undefined)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)])
    );
  }
  return typeof value === 'string' ? value.normalize('NFC') : value;
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

/** The raw key is never persisted; only this digest is. */
export function hashIdempotencyKey(key: string): string {
  return sha256(`${SESSION_IDEMPOTENCY_VERSION}:key:${key}`);
}

/**
 * Fingerprint the logical request so that reusing a key with a different body
 * is detectable rather than silently replaying the wrong response.
 */
export function fingerprintSessionRequest(input: {
  operation: SessionOperation;
  operationTarget: string;
  payload: unknown;
}): string {
  return sha256(
    JSON.stringify(
      canonicalize({
        version: SESSION_IDEMPOTENCY_VERSION,
        operation: input.operation,
        operationTarget: input.operationTarget,
        payload: input.payload,
      })
    )
  );
}

export function idempotencyIdentity(input: {
  userId: string;
  operation: SessionOperation;
  operationTarget: string;
  key: string;
}) {
  return {
    userId: input.userId,
    operation: input.operation,
    operationTarget: input.operationTarget,
    keyHash: hashIdempotencyKey(input.key),
  } as const;
}

export function idempotencyExpiry(now: Date): Date {
  return new Date(now.getTime() + IDEMPOTENCY_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export type ExistingIdempotencyDecision =
  | { kind: 'mismatch' }
  | { kind: 'in_progress' }
  | { kind: 'expired' }
  | { kind: 'invalid_replay' }
  | { kind: 'replay'; responseStatus: number; responseBody: Record<string, unknown> };

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Decide what an existing record means for an incoming request. A stored body
 * that cannot be replayed is reported as invalid rather than re-run, so a
 * corrupt record can never cause duplicate work.
 */
export function decideExistingIdempotency(
  record: {
    requestHash: string;
    status: string;
    responseStatus: number | null;
    responseBody: unknown;
    expiresAt: Date;
  },
  requestHash: string,
  now: Date
): ExistingIdempotencyDecision {
  if (record.requestHash !== requestHash) return { kind: 'mismatch' };
  if (record.expiresAt.getTime() <= now.getTime()) return { kind: 'expired' };

  if (record.status === 'completed') {
    if (
      record.responseStatus === null ||
      record.responseStatus < 200 ||
      record.responseStatus > 299 ||
      !isPlainObject(record.responseBody)
    ) {
      return { kind: 'invalid_replay' };
    }
    return {
      kind: 'replay',
      responseStatus: record.responseStatus,
      responseBody: record.responseBody,
    };
  }

  return { kind: 'in_progress' };
}
