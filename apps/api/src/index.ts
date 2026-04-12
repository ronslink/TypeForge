/**
 * TypeForge API — Hono Serverless Runtime
 * Vercel Edge/Serverless integration via SvelteKit
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';

// Middleware
import { authMiddleware } from './middleware/auth.js';
import { dbMiddleware } from './middleware/regional-routing.js';
import { rateLimits } from './middleware/ratelimit.js';

// Routes
import {
  sessionsRoutes,
  lessonsRoutes,
  usersRoutes,
  organisationsRoutes,
  billingRoutes,
  adminRoutes,
  progressRoutes,
} from './routes/index.js';

const app = new Hono();

// Global middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: [
      'https://typeforge.io',
      'https://www.typeforge.io',
      'https://typingscholar.com',
      'https://www.typingscholar.com',
      'http://localhost:5173',
      'http://localhost:3000',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'x-region'],
    credentials: true,
  })
);
app.use('*', prettyJSON());

// Rate limiting
app.use('/api/*', rateLimits.api);

// Authentication middleware
app.use('/api/*', authMiddleware);

// Global database middleware
app.use('/api/*', dbMiddleware);

// Health check (no auth required)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.0.1',
    environment: process.env.NODE_ENV || 'production',
  });
});

// Mount API routes
app.route('/api/v1/sessions', sessionsRoutes);
app.route('/api/v1/lessons', lessonsRoutes);
app.route('/api/v1/progress', progressRoutes);
app.route('/api/v1/users', usersRoutes);
app.route('/api/v1/organisations', organisationsRoutes);
app.route('/api/v1/billing', billingRoutes);
app.route('/api/v1/admin', adminRoutes);

// API version info
app.get('/api/v1', (c) => {
  return c.json({
    name: 'TypeForge API',
    version: '1.0.0',
    endpoints: {
      sessions: '/api/v1/sessions',
      lessons: '/api/v1/lessons',
      progress: '/api/v1/progress',
      users: '/api/v1/users',
      organisations: '/api/v1/organisations',
      billing: '/api/v1/billing',
      admin: '/api/v1/admin',
    },
  });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);

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
});

export default app;
