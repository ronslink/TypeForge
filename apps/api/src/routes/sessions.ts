/**
 * Sessions routes
 * Typing session management
 */

import { Hono } from 'hono';
import { requireAuth, getAuth, getDb } from '../middleware/index.js';
import { sessions, keystrokeEvents } from '@typeforge/db';
import { eq, desc } from 'drizzle-orm';

const app = new Hono();

// All session routes require authentication
app.use('*', requireAuth);

/**
 * POST /sessions - Create a new typing session
 */
app.post('/', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const body = await c.req.json();
  const { lessonId, exerciseId, languageCode, layoutId } = body;
  
  const [session] = await db.insert(sessions).values({
    userId: auth.userId,
    lessonId,
    exerciseId,
    languageCode,
    layoutId,
    status: 'in_progress',
    startedAt: new Date(),
  }).returning();
  
  return c.json({ session }, 201);
});

/**
 * GET /sessions - List user's recent sessions
 */
app.get('/', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const limit = parseInt(c.req.query('limit') ?? '10');
  
  const userSessions = await db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, auth.userId))
    .orderBy(desc(sessions.startedAt))
    .limit(limit);
  
  return c.json({ sessions: userSessions });
});

/**
 * GET /sessions/:id - Get a specific session
 */
app.get('/:id', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const sessionId = c.req.param('id');
  
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);
  
  if (!session) {
    return c.json({ error: 'Session not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Ensure user owns this session
  if (session.userId !== auth.userId) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }
  
  return c.json({ session });
});

/**
 * PUT /sessions/:id - Update session (complete it)
 */
app.put('/:id', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const sessionId = c.req.param('id');
  
  const body = await c.req.json();
  const { 
    status, 
    durationSeconds, 
    totalCharacters, 
    correctCharacters, 
    errors, 
    wpm, 
    accuracy, 
    rawWpm, 
    consistency, 
    burstWpm 
  } = body;
  
  const [session] = await db
    .update(sessions)
    .set({
      status,
      completedAt: status === 'completed' ? new Date() : undefined,
      durationSeconds,
      totalCharacters,
      correctCharacters,
      errors,
      wpm,
      accuracy,
      rawWpm,
      consistency,
      burstWpm,
    })
    .where(eq(sessions.id, sessionId))
    .returning();
  
  if (!session) {
    return c.json({ error: 'Session not found', code: 'NOT_FOUND' }, 404);
  }
  
  return c.json({ session });
});

/**
 * POST /sessions/:id/keystrokes - Record keystroke events
 */
app.post('/:id/keystrokes', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const sessionId = c.req.param('id');
  
  const body = await c.req.json();
  const { keystrokes } = body as { keystrokes: Array<{
    character: string;
    expected: string;
    correct: boolean;
    timestamp: string;
    keyDownAt: string;
    keyUpAt?: string;
    dwellTime?: number;
    flightTime?: number;
    finger?: string;
    hand?: string;
  }>};
  
  // Insert keystroke events
  const events = keystrokes.map(k => ({
    sessionId,
    character: k.character,
    expected: k.expected,
    correct: k.correct,
    timestamp: new Date(k.timestamp),
    keyDownAt: new Date(k.keyDownAt),
    keyUpAt: k.keyUpAt ? new Date(k.keyUpAt) : null,
    dwellTime: k.dwellTime,
    flightTime: k.flightTime,
    finger: k.finger,
    hand: k.hand,
  }));
  
  if (events.length > 0) {
    await db.insert(keystrokeEvents).values(events);
  }
  
  return c.json({ recorded: events.length });
});

export default app;
