const IDEMPOTENCY_SCOPE_PATTERN = /^[a-z][a-z0-9-]{1,31}$/;

export type RandomUuidSource = () => string;

/**
 * Create one opaque key for one summary-save operation. The caller must keep
 * the returned key stable across retries of the same payload and replace it
 * when a new typing activity begins. No user, lesson, locale or input content
 * is encoded in the key.
 */
export function createSessionSummaryIdempotencyKey(
  scope: string,
  randomUuid: RandomUuidSource = () => globalThis.crypto.randomUUID()
): string {
  if (!IDEMPOTENCY_SCOPE_PATTERN.test(scope)) {
    throw new Error('Idempotency scope is invalid.');
  }
  const uuid = randomUuid().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(uuid)) {
    throw new Error('Random UUID source returned an invalid value.');
  }
  return `session:${scope}:${uuid}`;
}

export function withSessionSummaryIdempotency(
  init: RequestInit | undefined,
  key: string
): RequestInit {
  const headers = new Headers(init?.headers);
  headers.set('Idempotency-Key', key);
  return { ...init, headers };
}
