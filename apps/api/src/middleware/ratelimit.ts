/**
 * Rate limiting middleware
 * Uses Cloudflare's built-in rate limiting or Upstash Redis
 */

import type { Context, Next } from 'hono';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (c: Context) => string;
}

/**
 * Simple in-memory rate limiter (for development)
 * In production, use Cloudflare Rate Limiting or Upstash Redis
 */
const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Rate limiting middleware
 */
export function rateLimit(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    // Generate key for rate limiting
    const key = config.keyGenerator 
      ? config.keyGenerator(c) 
      : getDefaultKey(c);
    
    const now = Date.now();
    const record = requestCounts.get(key);
    
    // Check if window has expired
    if (!record || record.resetAt < now) {
      requestCounts.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      await next();
      return;
    }
    
    // Check if limit exceeded
    if (record.count >= config.maxRequests) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      c.status(429);
      c.header('Retry-After', retryAfter.toString());
      c.header('X-RateLimit-Limit', config.maxRequests.toString());
      c.header('X-RateLimit-Remaining', '0');
      c.header('X-RateLimit-Reset', record.resetAt.toString());
      return c.json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter,
      });
    }
    
    // Increment count
    record.count++;
    requestCounts.set(key, record);
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', config.maxRequests.toString());
    c.header('X-RateLimit-Remaining', (config.maxRequests - record.count).toString());
    c.header('X-RateLimit-Reset', record.resetAt.toString());
    
    await next();
  };
}

/**
 * Generate default rate limit key (IP + path)
 */
function getDefaultKey(c: Context): string {
  const ip = c.req.header('CF-Connecting-IP') ?? 
             c.req.header('X-Forwarded-For') ?? 
             'unknown';
  const path = c.req.path;
  return `${ip}:${path}`;
}

/**
 * Rate limit presets
 */
export const rateLimits = {
  // Strict: 10 requests per minute
  strict: rateLimit({ windowMs: 60_000, maxRequests: 10 }),
  
  // Standard: 100 requests per minute
  standard: rateLimit({ windowMs: 60_000, maxRequests: 100 }),
  
  // Relaxed: 1000 requests per minute
  relaxed: rateLimit({ windowMs: 60_000, maxRequests: 1000 }),
  
  // API: 300 requests per minute
  api: rateLimit({ windowMs: 60_000, maxRequests: 300 }),
  
  // Auth: 5 requests per minute (for login/register)
  auth: rateLimit({ windowMs: 60_000, maxRequests: 5 }),
};
