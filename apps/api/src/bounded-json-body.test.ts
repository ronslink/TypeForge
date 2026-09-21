import { describe, expect, it, vi } from 'vitest';
import {
  BOUNDED_JSON_BODY_POLICIES,
  readBoundedJsonBody,
  type BoundedJsonBodyPolicy,
} from './bounded-json-body.js';

const encoder = new TextEncoder();

function source(
  chunks: ReadonlyArray<string | Uint8Array>,
  headers: Record<string, string> = {}
): Pick<Request, 'body' | 'headers'> {
  return {
    headers: new Headers(headers),
    body: new ReadableStream<Uint8Array>({
      start(controller) {
        for (const chunk of chunks) {
          controller.enqueue(typeof chunk === 'string' ? encoder.encode(chunk) : chunk);
        }
        controller.close();
      },
    }),
  };
}

function exactByteJson(byteLength: number): string {
  const prefix = '{"value":"';
  const suffix = '"}';
  const fixedBytes = encoder.encode(prefix + suffix).byteLength;
  if (byteLength < fixedBytes) throw new Error('Requested JSON byte length is too small.');
  return `${prefix}${'x'.repeat(byteLength - fixedBytes)}${suffix}`;
}

const TEST_POLICY: BoundedJsonBodyPolicy = Object.freeze({
  maxBytes: 64,
  maxDepth: 3,
  maxNodes: 8,
});

describe('bounded authenticated JSON body reader', () => {
  it('defines narrow per-contract policies instead of one ambient request limit', () => {
    expect(BOUNDED_JSON_BODY_POLICIES).toEqual({
      sessionSummary: { maxBytes: 65_536, maxDepth: 6, maxNodes: 4_096 },
      privacyRequest: { maxBytes: 4_096, maxDepth: 4, maxNodes: 128 },
      localePreference: { maxBytes: 1_024, maxDepth: 2, maxNodes: 16 },
      accountPreferences: { maxBytes: 4_096, maxDepth: 2, maxNodes: 64 },
      sessionSubmission: { maxBytes: 262_144, maxDepth: 6, maxNodes: 32_768 },
      keystrokeBatch: { maxBytes: 262_144, maxDepth: 6, maxNodes: 32_768 },
      sessionCompletion: { maxBytes: 4_096, maxDepth: 2, maxNodes: 32 },
      placementTestResult: { maxBytes: 4_096, maxDepth: 2, maxNodes: 32 },
      userLocalePreference: { maxBytes: 1_024, maxDepth: 2, maxNodes: 16 },
      userProfileUpdate: { maxBytes: 4_096, maxDepth: 2, maxNodes: 32 },
      userAccountPreferences: { maxBytes: 4_096, maxDepth: 2, maxNodes: 64 },
      adminAction: { maxBytes: 16_384, maxDepth: 4, maxNodes: 256 },
      billingCheckout: { maxBytes: 16_384, maxDepth: 4, maxNodes: 256 },
      contactRequest: { maxBytes: 16_384, maxDepth: 4, maxNodes: 256 },
      adaptiveDrillRequest: { maxBytes: 16_384, maxDepth: 4, maxNodes: 256 },
      organisationCreation: { maxBytes: 16_384, maxDepth: 4, maxNodes: 256 },
      organisationInvitation: { maxBytes: 4_096, maxDepth: 2, maxNodes: 32 },
      organisationSeatCheckout: { maxBytes: 16_384, maxDepth: 4, maxNodes: 256 },
      organisationSeatUpgrade: { maxBytes: 4_096, maxDepth: 2, maxNodes: 16 },
      organisationSeatDowngrade: { maxBytes: 4_096, maxDepth: 2, maxNodes: 16 },
      organisationSeatAssignment: { maxBytes: 4_096, maxDepth: 2, maxNodes: 32 },
    });
  });

  it('accepts an exact byte-limit body and rejects the next byte', async () => {
    const exact = exactByteJson(TEST_POLICY.maxBytes);
    const over = exactByteJson(TEST_POLICY.maxBytes + 1);

    await expect(readBoundedJsonBody(source([exact]), TEST_POLICY)).resolves.toEqual({
      ok: true,
      value: { value: 'x'.repeat(52) },
    });
    await expect(readBoundedJsonBody(source([over]), TEST_POLICY)).resolves.toEqual({
      ok: false,
      code: 'PAYLOAD_TOO_LARGE',
    });
  });

  it('enforces the stream cap without Content-Length and across chunk boundaries', async () => {
    const over = exactByteJson(TEST_POLICY.maxBytes + 1);
    await expect(
      readBoundedJsonBody(source([over.slice(0, 32), over.slice(32)]), TEST_POLICY)
    ).resolves.toEqual({ ok: false, code: 'PAYLOAD_TOO_LARGE' });
  });

  it('cancels a still-open request stream when streamed bytes cross the limit', async () => {
    const cancel = vi.fn();
    let pullCount = 0;
    const body = new ReadableStream<Uint8Array>({
      pull(controller) {
        controller.enqueue(new Uint8Array(pullCount === 0 ? 40 : 25));
        pullCount += 1;
      },
      cancel,
    });

    await expect(
      readBoundedJsonBody({ headers: new Headers(), body }, TEST_POLICY)
    ).resolves.toEqual({ ok: false, code: 'PAYLOAD_TOO_LARGE' });
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it('does not trust a smaller declared length than the streamed body', async () => {
    const over = exactByteJson(TEST_POLICY.maxBytes + 1);
    await expect(
      readBoundedJsonBody(source([over], { 'Content-Length': '1' }), TEST_POLICY)
    ).resolves.toEqual({ ok: false, code: 'PAYLOAD_TOO_LARGE' });
  });

  it('rejects a declared oversized body before reading and cancels its stream', async () => {
    const cancel = vi.fn();
    const body = new ReadableStream<Uint8Array>({ cancel });

    await expect(
      readBoundedJsonBody({ headers: new Headers({ 'Content-Length': '65' }), body }, TEST_POLICY)
    ).resolves.toEqual({ ok: false, code: 'PAYLOAD_TOO_LARGE' });
    expect(cancel).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['empty body', []],
    ['malformed JSON', ['{"value":']],
    ['malformed UTF-8', [new Uint8Array([0x22, 0xc3, 0x28, 0x22])]],
  ] as const)('returns one bounded invalid-JSON result for %s', async (_name, chunks) => {
    await expect(readBoundedJsonBody(source(chunks), TEST_POLICY)).resolves.toEqual({
      ok: false,
      code: 'INVALID_JSON_BODY',
    });
  });

  it.each([
    ['excessive depth', '[[[[0]]]]'],
    ['excessive node count', '{"a":1,"b":2,"c":3,"d":4,"e":5,"f":6,"g":7,"h":8}'],
  ])('rejects %s with an iterative structural bound', async (_name, body) => {
    await expect(readBoundedJsonBody(source([body]), TEST_POLICY)).resolves.toEqual({
      ok: false,
      code: 'PAYLOAD_TOO_COMPLEX',
    });
  });
});
