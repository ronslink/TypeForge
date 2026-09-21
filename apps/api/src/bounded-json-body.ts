import type { Context } from 'hono';

export type BoundedJsonBodyPolicy = Readonly<{
  maxBytes: number;
  maxDepth: number;
  maxNodes: number;
}>;

export const BOUNDED_JSON_BODY_POLICIES = Object.freeze({
  sessionSummary: Object.freeze({ maxBytes: 65_536, maxDepth: 6, maxNodes: 4_096 }),
  privacyRequest: Object.freeze({ maxBytes: 4_096, maxDepth: 4, maxNodes: 128 }),
  localePreference: Object.freeze({ maxBytes: 1_024, maxDepth: 2, maxNodes: 16 }),
  accountPreferences: Object.freeze({ maxBytes: 4_096, maxDepth: 2, maxNodes: 64 }),
} satisfies Record<string, BoundedJsonBodyPolicy>);

export const PAYLOAD_TOO_LARGE = Object.freeze({
  error: 'Request payload is too large',
  code: 'PAYLOAD_TOO_LARGE',
});

export const INVALID_JSON_BODY = Object.freeze({
  error: 'Request body is not valid JSON',
  code: 'INVALID_JSON_BODY',
});

export const PAYLOAD_TOO_COMPLEX = Object.freeze({
  error: 'Request payload is too complex',
  code: 'PAYLOAD_TOO_COMPLEX',
});

type BoundedJsonBodyFailure = Readonly<{
  ok: false;
  code: 'PAYLOAD_TOO_LARGE' | 'INVALID_JSON_BODY' | 'PAYLOAD_TOO_COMPLEX';
}>;

export type BoundedJsonBodyResult = Readonly<{ ok: true; value: unknown }> | BoundedJsonBodyFailure;

type RequestBodySource = Pick<Request, 'body' | 'headers'>;

function declaredBodyIsTooLarge(headers: Headers, maxBytes: number): boolean {
  const value = headers.get('content-length');
  if (value === null || !/^(?:0|[1-9]\d*)$/u.test(value)) return false;
  if (value.length > 16) return true;
  return Number(value) > maxBytes;
}

async function cancelBody(body: ReadableStream<Uint8Array> | null): Promise<void> {
  if (!body || body.locked) return;
  try {
    await body.cancel();
  } catch {
    // Cancellation is best effort. The bounded response must not expose stream errors.
  }
}

function exceedsStructuralLimits(value: unknown, policy: BoundedJsonBodyPolicy): boolean {
  const pending: Array<Readonly<{ value: unknown; depth: number }>> = [{ value, depth: 0 }];
  let visited = 0;

  while (pending.length > 0) {
    const current = pending.pop()!;
    visited += 1;
    if (visited > policy.maxNodes || current.depth > policy.maxDepth) return true;

    if (Array.isArray(current.value)) {
      for (let index = current.value.length - 1; index >= 0; index -= 1) {
        pending.push({ value: current.value[index], depth: current.depth + 1 });
      }
      continue;
    }

    if (current.value !== null && typeof current.value === 'object') {
      const values = Object.values(current.value);
      for (let index = values.length - 1; index >= 0; index -= 1) {
        pending.push({ value: values[index], depth: current.depth + 1 });
      }
    }
  }

  return false;
}

/**
 * Read one authenticated JSON request through an authoritative streaming byte
 * cap, then apply stack-safe structural limits before any route-domain work.
 * Content-Length is only an early rejection hint; the stream remains bounded
 * when that header is absent, malformed, or smaller than the actual body.
 */
export async function readBoundedJsonBody(
  request: RequestBodySource,
  policy: BoundedJsonBodyPolicy
): Promise<BoundedJsonBodyResult> {
  if (declaredBodyIsTooLarge(request.headers, policy.maxBytes)) {
    await cancelBody(request.body);
    return { ok: false, code: 'PAYLOAD_TOO_LARGE' };
  }

  if (!request.body) return { ok: false, code: 'INVALID_JSON_BODY' };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      totalBytes += result.value.byteLength;
      if (totalBytes > policy.maxBytes) {
        try {
          await reader.cancel();
        } catch {
          // Cancellation is best effort and never changes the stable denial.
        }
        return { ok: false, code: 'PAYLOAD_TOO_LARGE' };
      }
      chunks.push(result.value);
    }
  } catch {
    try {
      await reader.cancel();
    } catch {
      // Keep stream failures out of the response contract.
    }
    return { ok: false, code: 'INVALID_JSON_BODY' };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  let value: unknown;
  try {
    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    value = JSON.parse(text) as unknown;
  } catch {
    return { ok: false, code: 'INVALID_JSON_BODY' };
  }

  if (exceedsStructuralLimits(value, policy)) {
    return { ok: false, code: 'PAYLOAD_TOO_COMPLEX' };
  }

  return { ok: true, value };
}

export function boundedJsonBodyFailureResponse(c: Context, failure: BoundedJsonBodyFailure) {
  c.header('Cache-Control', 'private, no-store');
  if (failure.code === 'PAYLOAD_TOO_LARGE') return c.json(PAYLOAD_TOO_LARGE, 413);
  if (failure.code === 'PAYLOAD_TOO_COMPLEX') return c.json(PAYLOAD_TOO_COMPLEX, 400);
  return c.json(INVALID_JSON_BODY, 400);
}
