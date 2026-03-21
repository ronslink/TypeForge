/**
 * TypeForge API — Hono on Cloudflare Workers
 * Regional routing via Cloudflare Hyperdrive to PostgreSQL
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';

// Environment bindings from wrangler.toml
interface Env {
  HYPERDRIVE_EU: Hyperdrive;
  HYPERDRIVE_US: Hyperdrive;
  HYPERDRIVE_AF: Hyperdrive;
  DB: D1Database;
  ASSETS: R2Bucket;
  JOBS: Queue;
  CACHE: KVNamespace;
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
  CLERK_SECRET_KEY: string;
  ENVIRONMENT: string;
}

// Regional context extracted from Clerk JWT or request headers
interface RegionalContext {
  userId: string;
  homeRegion: 'EU' | 'US' | 'AF';
  role: 'learner' | 'teacher' | 'org_admin' | 'platform_admin';
}

const app = new Hono<{ Bindings: Env }>();

// Middleware
app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: ['https://typeforge.io', 'https://www.typeforge.io'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.0.1',
    environment: c.env.ENVIRONMENT,
  });
});

// Regional routing middleware
app.use('/api/*', async (c, next) => {
  // Extract user context from Clerk JWT
  const authHeader = c.req.header('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    // TODO: Validate JWT with Clerk and extract regional context
    // For now, set a placeholder context
    c.set('regionalContext', {
      userId: 'placeholder',
      homeRegion: 'EU' as const,
      role: 'learner' as const,
    });
  }
  await next();
});

// API routes
app.get('/api/v1/user', (c) => {
  const ctx = c.get('regionalContext');
  return c.json({ user: ctx });
});

// Typing session routes
app.post('/api/v1/sessions', async (c) => {
  // TODO: Create typing session
  return c.json({ message: 'Session created' }, 201);
});

app.get('/api/v1/sessions/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Get session by ID
  return c.json({ sessionId: id });
});

// Lesson routes
app.get('/api/v1/lessons', async (c) => {
  // TODO: List lessons based on user's language and level
  return c.json({ lessons: [] });
});

app.get('/api/v1/lessons/:id', async (c) => {
  const id = c.req.param('id');
  // TODO: Get lesson by ID
  return c.json({ lessonId: id });
});

// Metrics routes
app.post('/api/v1/metrics', async (c) => {
  const body = await c.req.json();
  // TODO: Record typing metrics
  return c.json({ recorded: true });
});

app.get('/api/v1/metrics/summary', async (c) => {
  // TODO: Get user metrics summary
  return c.json({
    wpm: 0,
    accuracy: 0,
    streak: 0,
    totalLessons: 0,
  });
});

// Leaderboard routes
app.get('/api/v1/leaderboard', async (c) => {
  // TODO: Get leaderboard data
  return c.json({ leaderboard: [] });
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json(
    {
      error: 'Internal Server Error',
      code: 'INTERNAL_ERROR',
      message: c.env.ENVIRONMENT === 'development' ? err.message : undefined,
    },
    500
  );
});

export default app;
