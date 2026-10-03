/**
 * Tests for the API error-reporting seam and the production error handler.
 *
 * The contract that matters is twofold: an installed reporter must receive every
 * 500 the API produces, and reporting must never change the response the client
 * sees. Sentry itself is installed by the host app, so it is verified here
 * through the seam rather than by mocking the SDK.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Context } from 'hono';
import {
  hasApiErrorReporter,
  reportApiError,
  setApiErrorReporter,
  type ApiErrorContext,
} from './error-reporter.js';
import { handleApiError } from './index.js';

interface CapturedResponse {
  body?: Record<string, unknown>;
  status?: number;
}

function fakeContext(path = '/api/v1/sessions', method = 'POST') {
  const captured: CapturedResponse = {};
  const context = {
    req: { path, method },
    json: (body: Record<string, unknown>, status?: number) => {
      // Round-trip through JSON so assertions see exactly what the client
      // receives: `undefined` values are dropped by serialisation, which is how
      // the handler omits server detail in production.
      const serialized = JSON.stringify(body);
      captured.body = JSON.parse(serialized) as Record<string, unknown>;
      captured.status = status;
      return new Response(serialized, {
        status: status ?? 200,
        headers: { 'content-type': 'application/json' },
      });
    },
  } as unknown as Context;

  return { context, captured };
}

const originalNodeEnv = process.env.NODE_ENV;

beforeEach(() => {
  // The handler logs deliberately; keep the test output readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  setApiErrorReporter(null);
  process.env.NODE_ENV = originalNodeEnv;
  vi.restoreAllMocks();
});

describe('api error reporter seam', () => {
  it('is a no-op when no reporter is installed', () => {
    expect(hasApiErrorReporter()).toBe(false);

    expect(() =>
      reportApiError(new Error('boom'), { path: '/x', method: 'GET' })
    ).not.toThrow();
  });

  it('passes the error and its request context to the installed reporter', () => {
    const error = new Error('database is on fire');
    const calls: Array<{ error: unknown; context: ApiErrorContext }> = [];

    setApiErrorReporter((reportedError, context) => {
      calls.push({ error: reportedError, context });
    });

    expect(hasApiErrorReporter()).toBe(true);

    reportApiError(error, { path: '/api/v1/sessions', method: 'POST' });

    expect(calls).toHaveLength(1);
    expect(calls[0]!.error).toBe(error);
    expect(calls[0]!.context).toEqual({ path: '/api/v1/sessions', method: 'POST' });
  });

  it('contains a reporter that throws instead of breaking the response', () => {
    setApiErrorReporter(() => {
      throw new Error('the monitoring vendor is down too');
    });

    expect(() =>
      reportApiError(new Error('original'), { path: '/x', method: 'GET' })
    ).not.toThrow();

    expect(console.error).toHaveBeenCalledWith(
      'API error reporter threw:',
      expect.any(Error)
    );
  });

  it('can be uninstalled', () => {
    const reporter = vi.fn();
    setApiErrorReporter(reporter);
    setApiErrorReporter(null);

    reportApiError(new Error('ignored'), { path: '/x', method: 'GET' });

    expect(hasApiErrorReporter()).toBe(false);
    expect(reporter).not.toHaveBeenCalled();
  });
});

describe('handleApiError', () => {
  it('reports the failure with its path and method, and answers 500', async () => {
    const reported: Array<{ error: unknown; context: ApiErrorContext }> = [];
    setApiErrorReporter((error, context) => reported.push({ error, context }));

    const { context, captured } = fakeContext('/api/v1/sessions', 'POST');
    const error = new Error('connection refused');

    const response = handleApiError(error, context);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(500);
    expect(captured.status).toBe(500);
    expect(captured.body).toMatchObject({
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
    });

    expect(reported).toHaveLength(1);
    expect(reported[0]!.error).toBe(error);
    expect(reported[0]!.context).toEqual({
      path: '/api/v1/sessions',
      method: 'POST',
    });
  });

  it('omits server detail from production responses', () => {
    process.env.NODE_ENV = 'production';
    const { context, captured } = fakeContext();

    handleApiError(new Error('relation "users" does not exist'), context);

    expect(captured.body).not.toHaveProperty('message');
    expect(captured.body).not.toHaveProperty('stack');
  });

  it('includes server detail in development responses', () => {
    process.env.NODE_ENV = 'development';
    const { context, captured } = fakeContext();

    handleApiError(new Error('relation "users" does not exist'), context);

    expect(captured.body!.message).toBe('relation "users" does not exist');
    expect(captured.body).toHaveProperty('stack');
  });
});
