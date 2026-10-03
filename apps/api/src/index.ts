/**
 * TypeForge API — Hono Serverless Runtime
 * Vercel Edge/Serverless integration via SvelteKit
 */

import { Hono } from 'hono';
import type { Context } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';

// Middleware
import { authMiddleware } from './middleware/auth.js';
import { dbMiddleware } from './middleware/regional-routing.js';
import { rateLimits } from './middleware/ratelimit.js';
import { reportApiError } from './error-reporter.js';

// Routes
import {
  sessionsRoutes,
  lessonsRoutes,
  usersRoutes,
  organisationsRoutes,
  billingRoutes,
  adminRoutes,
  progressRoutes,
  contactRoutes,
} from './routes/index.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: [
      'https://typingscholar.com',
      'https://www.typingscholar.com',
      'https://typeforge.io',
      'https://www.typeforge.io',
      'https://typeforge.com',
      'https://www.typeforge.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-region'],
    credentials: true,
  })
);
app.use('*', prettyJSON());

const healthPayload = () => ({
  status: 'healthy' as const,
  timestamp: new Date().toISOString(),
  version: '0.0.1',
  environment: process.env.NODE_ENV || 'production',
});

// Keep health checks outside the authenticated/database-backed API middleware.
app.get('/health', (c) => c.json(healthPayload()));
app.get('/api/health', (c) => c.json(healthPayload()));

// Rate limiting
app.use('/api/*', rateLimits.api);

// Global database middleware
app.use('/api/*', dbMiddleware);

// Authentication middleware
app.use('/api/*', authMiddleware);

// Mount API routes
app.route('/api/v1/sessions', sessionsRoutes);
app.route('/api/v1/lessons', lessonsRoutes);
app.route('/api/v1/progress', progressRoutes);
app.route('/api/v1/users', usersRoutes);
app.route('/api/v1/organisations', organisationsRoutes);
app.route('/api/v1/billing', billingRoutes);
app.route('/api/v1/admin', adminRoutes);
app.route('/api/v1/contact', contactRoutes);

// API version info
app.get('/api/v1', (c) => {
  return c.json({
    name: 'TypeForge API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sessions: '/api/v1/sessions',
      lessons: '/api/v1/lessons',
      progress: '/api/v1/progress',
      users: '/api/v1/users',
      organisations: '/api/v1/organisations',
      billing: '/api/v1/billing',
      admin: '/api/v1/admin',
      contact: '/api/v1/contact',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404);
});

/**
 * The production error handler.
 *
 * Exported so it can be tested directly: the interesting behaviour (reporting
 * the error, and keeping server detail out of production responses) must not
 * depend on being able to provoke a real 500 through the middleware chain.
 */
export function handleApiError(err: Error, c: Context) {
  console.error('API Error:', err);

  // Hand the error to whatever reporter is installed (the host app wires Sentry
  // here). Hono's onError swallows the throw into a JSON response, so without
  // this explicit call API failures would never reach error tracking.
  reportApiError(err, {
    path: c.req.path,
    method: c.req.method,
  });

  const isDev = process.env.NODE_ENV === 'development';

  return c.json(
    {
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : undefined,
      stack: isDev ? err.stack : undefined,
    },
    500
  );
}

app.onError(handleApiError);

export default app;
export {
  setApiErrorReporter,
  reportApiError,
  hasApiErrorReporter,
  type ApiErrorReporter,
  type ApiErrorContext,
} from './error-reporter.js';
