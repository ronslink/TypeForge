/**
 * Tests for the pooler connection options.
 *
 * The important assertion is `prepare: false`. Reaching Postgres through a
 * transaction-mode pooler (DigitalOcean's managed pooler, or the proxy in front
 * of it) with named prepared statements enabled fails at query time, not at
 * connect time — so it is the kind of setting that appears to work right up
 * until production traffic arrives.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { poolerConnectionOptions } from './client.js';

const original = process.env.DB_POOL_MAX;

afterEach(() => {
  if (original === undefined) delete process.env.DB_POOL_MAX;
  else process.env.DB_POOL_MAX = original;
});

describe('poolerConnectionOptions', () => {
  it('disables prepared statements, which a transaction pooler cannot carry', () => {
    delete process.env.DB_POOL_MAX;
    expect(poolerConnectionOptions(5).prepare).toBe(false);
  });

  it('uses the caller default when DB_POOL_MAX is unset', () => {
    delete process.env.DB_POOL_MAX;
    expect(poolerConnectionOptions(5).max).toBe(5);
    expect(poolerConnectionOptions(3).max).toBe(3);
  });

  it('honours a valid DB_POOL_MAX', () => {
    process.env.DB_POOL_MAX = '12';
    expect(poolerConnectionOptions(5).max).toBe(12);
  });

  it.each(['0', '-4', 'abc', '', 'Infinity'])(
    'falls back to the default for a nonsensical DB_POOL_MAX (%s)',
    (value) => {
      process.env.DB_POOL_MAX = value;
      expect(poolerConnectionOptions(5).max).toBe(5);
    }
  );

  it('floors a fractional DB_POOL_MAX', () => {
    process.env.DB_POOL_MAX = '7.9';
    expect(poolerConnectionOptions(5).max).toBe(7);
  });

  it('keeps idle_timeout overridable and connect_timeout bounded', () => {
    const options = poolerConnectionOptions(3, { idleTimeoutSeconds: 30 });
    expect(options.idle_timeout).toBe(30);
    expect(options.connect_timeout).toBe(10);
    expect(poolerConnectionOptions(3).idle_timeout).toBe(20);
  });
});
