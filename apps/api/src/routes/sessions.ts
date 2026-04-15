/**
 * Sessions routes
 * Typing session management
 */

import { Hono } from 'hono';
import { requireAuth, getAuth } from '../middleware/index.js';
import { getDb } from '../middleware/regional-routing.js';
import {
  typingSessions,
  keystrokeEvents,
  userXp,
  streaks,
  users,
  keyMastery,
  dailyStats,
  userProgress,
} from '@typeforge/db';
import { eq, desc, and, sql } from 'drizzle-orm';
const app = new Hono();

// All session routes require authentication
app.use('*', requireAuth);

/**
 * Type definitions
 */
interface SessionPayload {
  wpm: number;
  accuracy: number;
  keystrokes: Array<{
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
  }>;
  duration: number; // in seconds
  lessonId?: string;
  language: string;
  layout: string;
  totalCharacters?: number;
  correctCharacters?: number;
  errors?: number;
  rawWpm?: number;
  consistency?: number;
  burstWpm?: number;
}

interface SessionResponse {
  id: string;
  userId: string;
  lessonId: string | null;
  exerciseId: string | null;
  languageCode: string;
  layoutId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: Date;
  completedAt: Date | null;
  durationSeconds: number | null;
  totalCharacters: number;
  correctCharacters: number;
  errors: number;
  wpm: number | null;
  accuracy: number | null;
  rawWpm: number | null;
  consistency: number | null;
  burstWpm: number | null;
  createdAt: Date;
}

/**
 * Calculate XP earned from a session
 */
function calculateSessionXP(payload: SessionPayload): number {
  let xp = 0;

  // Base XP for completing a session
  xp += 10;

  // XP for accuracy (max 50)
  const accuracyBonus = Math.floor((payload.accuracy / 100) * 50);
  xp += accuracyBonus;

  // XP for speed (1 XP per 5 WPM, max 30)
  const speedBonus = Math.min(Math.floor(payload.wpm / 5), 30);
  xp += speedBonus;

  // XP for duration (1 XP per minute, max 20)
  const durationBonus = Math.min(Math.floor(payload.duration / 60), 20);
  xp += durationBonus;

  return xp;
}

/**
 * Update user streak
 */
async function updateUserStreak(
  db: ReturnType<typeof getDb>,
  userId: string
): Promise<number> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Get existing streak
  const [existingStreak] = await db
    .select({
      id: streaks.id,
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      lastActivityAt: streaks.lastActivityAt,
    })
    .from(streaks)
    .where(and(eq(streaks.userId, userId), eq(streaks.type, 'daily')))
    .limit(1);

  if (!existingStreak) {
    // Create new streak
    await db.insert(streaks).values({
      userId,
      type: 'daily',
      currentStreak: 1,
      longestStreak: 1,
      lastActivityAt: now,
    });
    return 1;
  }

  const lastActivity = new Date(existingStreak.lastActivityAt);
  const lastActivityDay = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate()
  );

  let newStreak = existingStreak.currentStreak;

  if (lastActivityDay.getTime() === today.getTime()) {
    // Already active today, no change
    return newStreak;
  } else if (lastActivityDay.getTime() === yesterday.getTime()) {
    // Continued streak
    newStreak = existingStreak.currentStreak + 1;
  } else {
    // Streak broken, start new
    newStreak = 1;
  }

  // Update streak
  const newLongest = Math.max(existingStreak.longestStreak, newStreak);
  await db
    .update(streaks)
    .set({
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityAt: now,
      updatedAt: now,
    })
    .where(eq(streaks.id, existingStreak.id));

  return newStreak;
}

/**
 * Update user XP
 */
async function updateUserXP(
  db: ReturnType<typeof getDb>,
  userId: string,
  xpEarned: number
): Promise<{ totalXp: number; currentLevel: number }> {
  const now = new Date();

  // Get existing XP record
  const [existingXp] = await db
    .select({
      totalXp: userXp.totalXp,
      currentLevel: userXp.currentLevel,
      xpToNextLevel: userXp.xpToNextLevel,
    })
    .from(userXp)
    .where(eq(userXp.userId, userId))
    .limit(1);

  if (!existingXp) {
    // Create new XP record
    const initialLevel = 1;
    const xpToNext = 100;
    await db.insert(userXp).values({
      userId,
      totalXp: xpEarned,
      currentLevel: initialLevel,
      xpToNextLevel: xpToNext,
      updatedAt: now,
    });
    return { totalXp: xpEarned, currentLevel: initialLevel };
  }

  // Calculate new XP and level
  let newTotalXp = existingXp.totalXp + xpEarned;
  let newLevel = existingXp.currentLevel;
  let xpToNext = existingXp.xpToNextLevel;

  // Level up logic (exponential growth)
  while (newTotalXp >= xpToNext) {
    newTotalXp -= xpToNext;
    newLevel++;
    xpToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));
  }

  // Update XP record
  await db
    .update(userXp)
    .set({
      totalXp: newTotalXp,
      currentLevel: newLevel,
      xpToNextLevel: xpToNext,
      updatedAt: now,
    })
    .where(eq(userXp.userId, userId));

  return { totalXp: newTotalXp, currentLevel: newLevel };
}

/**
 * POST /sessions - Create and complete a typing session
 * Accepts SessionPayload from browser, stores via createSession helper,
 * and updates user XP and streak server-side
 */
app.post('/', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const userId = auth.userId;

  const payload = await c.req.json<SessionPayload>();

  // Validate required fields
  if (
    typeof payload.wpm !== 'number' ||
    typeof payload.accuracy !== 'number' ||
    typeof payload.duration !== 'number'
  ) {
    return c.json(
      {
        error: 'Missing required fields: wpm, accuracy, duration',
        code: 'VALIDATION_ERROR',
      },
      400
    );
  }

  const now = new Date();

  // Create the session
  const [session] = await db
    .insert(typingSessions)
    .values({
      userId,
      lessonId: payload.lessonId || null,
      exerciseId: null,
      languageCode: payload.language,
      layoutId: payload.layout,
      status: 'completed',
      startedAt: new Date(now.getTime() - payload.duration * 1000),
      completedAt: now,
      durationSeconds: payload.duration,
      totalCharacters: payload.totalCharacters || payload.keystrokes.length,
      correctCharacters: payload.correctCharacters || payload.keystrokes.filter((k) => k.correct).length,
      errors: payload.errors || payload.keystrokes.filter((k) => !k.correct).length,
      wpm: payload.wpm,
      accuracy: payload.accuracy,
      rawWpm: payload.rawWpm || null,
      consistency: payload.consistency || null,
      burstWpm: payload.burstWpm || null,
    })
    .returning();

  // Store keystroke events if provided
  if (payload.keystrokes && payload.keystrokes.length > 0) {
    const events = payload.keystrokes.map((k) => ({
      sessionId: session!.id,
      character: k.character,
      expected: k.expected,
      correct: k.correct,
      timestamp: new Date(k.timestamp),
      keyDownAt: new Date(k.keyDownAt),
      keyUpAt: k.keyUpAt ? new Date(k.keyUpAt) : null,
      dwellTime: k.dwellTime || null,
      flightTime: k.flightTime || null,
      finger: k.finger || null,
      hand: k.hand || null,
    }));

    await db.insert(keystrokeEvents).values(events);
  }

  // Aggregate per-key stats from keystrokes
  const keyStats = new Map<string, { total: number; correct: number }>();
  for (const k of payload.keystrokes || []) {
    const stats = keyStats.get(k.expected) || { total: 0, correct: 0 };
    stats.total += 1;
    if (k.correct) stats.correct += 1;
    keyStats.set(k.expected, stats);
  }

  // Build today date (midnight UTC)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const totalChars = payload.totalCharacters || payload.keystrokes.length;
  const sessionMinutes = Math.floor(payload.duration / 60);
  const lessonCompleted = payload.lessonId ? 1 : 0;

  await Promise.all([
    // Operation A — keyMastery upsert
    ...Array.from(keyStats.entries()).map(([key, stats]) =>
      db
        .insert(keyMastery)
        .values({
          userId,
          layoutId: payload.layout,
          key,
          totalAttempts: stats.total,
          correctAttempts: stats.correct,
          masteryLevel: Math.min(100, Math.floor((stats.correct / stats.total) * 100)),
          lastPracticedAt: now,
        })
        .onConflictDoUpdate({
          target: [keyMastery.userId, keyMastery.layoutId, keyMastery.key],
          set: {
            totalAttempts: sql.raw(`key_mastery.total_attempts + ${stats.total}`),
            correctAttempts: sql.raw(`key_mastery.correct_attempts + ${stats.correct}`),
            masteryLevel: sql.raw(
              `LEAST(100, GREATEST(0, FLOOR((key_mastery.correct_attempts + ${stats.correct}) * 100.0 / NULLIF(key_mastery.total_attempts + ${stats.total}, 0))))`
            ),
            lastPracticedAt: now,
            updatedAt: now,
          },
        })
    ),

    // Operation B — dailyStats upsert
    db
      .insert(dailyStats)
      .values({
        userId,
        date: today,
        languageCode: payload.language,
        totalSessions: 1,
        totalMinutes: sessionMinutes,
        totalCharacters: totalChars,
        avgWpm: payload.wpm,
        avgAccuracy: payload.accuracy,
        bestWpm: payload.wpm,
        lessonsCompleted: lessonCompleted,
      })
      .onConflictDoUpdate({
        target: [dailyStats.userId, dailyStats.date, dailyStats.languageCode],
        set: {
          totalSessions: sql.raw('daily_stats.total_sessions + 1'),
          totalMinutes: sql.raw(`daily_stats.total_minutes + ${sessionMinutes}`),
          totalCharacters: sql.raw(`daily_stats.total_characters + ${totalChars}`),
          avgWpm: sql.raw(
            `(daily_stats.avg_wpm * daily_stats.total_sessions + ${payload.wpm}) / (daily_stats.total_sessions + 1)`
          ),
          avgAccuracy: sql.raw(
            `(daily_stats.avg_accuracy * daily_stats.total_sessions + ${payload.accuracy}) / (daily_stats.total_sessions + 1)`
          ),
          bestWpm: sql.raw(`GREATEST(daily_stats.best_wpm, ${payload.wpm})`),
          lessonsCompleted: sql.raw(`daily_stats.lessons_completed + ${lessonCompleted}`),
        },
      }),

    // Operation C — userProgress upsert (only if lessonId present)
    payload.lessonId
      ? db
          .insert(userProgress)
          .values({
            userId,
            lessonId: payload.lessonId,
            status: 'completed',
            bestWpm: payload.wpm,
            bestAccuracy: payload.accuracy,
            attempts: 1,
            completedAt: now,
            updatedAt: now,
          })
          .onConflictDoUpdate({
            target: [userProgress.userId, userProgress.lessonId],
            set: {
              status: 'completed',
              bestWpm: sql.raw(`GREATEST(user_progress.best_wpm, ${payload.wpm})`),
              bestAccuracy: sql.raw(`GREATEST(user_progress.best_accuracy, ${payload.accuracy})`),
              attempts: sql.raw('user_progress.attempts + 1'),
              completedAt: now,
              updatedAt: now,
            },
          })
      : Promise.resolve(),
  ]);

  // Calculate and award XP
  const xpEarned = calculateSessionXP(payload);
  const { totalXp, currentLevel } = await updateUserXP(db, userId, xpEarned);

  // Update streak
  const newStreak = await updateUserStreak(db, userId);

  // Update user's last active timestamp
  await db
    .update(users)
    .set({ lastActiveAt: now })
    .where(eq(users.id, userId));

  return c.json(
    {
      session: session as SessionResponse,
      xpEarned,
      totalXp,
      currentLevel,
      streak: newStreak,
    },
    201
  );
});

/**
 * GET /sessions - List user's recent sessions
 */
app.get('/', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);

  const limit = parseInt(c.req.query('limit') ?? '10');

  const userSessions = await db
    .select({
      id: typingSessions.id,
      userId: typingSessions.userId,
      lessonId: typingSessions.lessonId,
      exerciseId: typingSessions.exerciseId,
      languageCode: typingSessions.languageCode,
      layoutId: typingSessions.layoutId,
      status: typingSessions.status,
      startedAt: typingSessions.startedAt,
      completedAt: typingSessions.completedAt,
      durationSeconds: typingSessions.durationSeconds,
      totalCharacters: typingSessions.totalCharacters,
      correctCharacters: typingSessions.correctCharacters,
      errors: typingSessions.errors,
      wpm: typingSessions.wpm,
      accuracy: typingSessions.accuracy,
      rawWpm: typingSessions.rawWpm,
      consistency: typingSessions.consistency,
      burstWpm: typingSessions.burstWpm,
      createdAt: typingSessions.createdAt,
    })
    .from(typingSessions)
    .where(eq(typingSessions.userId, auth.userId))
    .orderBy(desc(typingSessions.startedAt))
    .limit(limit);

  return c.json({ sessions: userSessions as SessionResponse[] });
});

/**
 * GET /sessions/:id - Get a specific session by ID
 */
app.get('/:id', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const sessionId = c.req.param('id');

  const [session] = await db
    .select({
      id: typingSessions.id,
      userId: typingSessions.userId,
      lessonId: typingSessions.lessonId,
      exerciseId: typingSessions.exerciseId,
      languageCode: typingSessions.languageCode,
      layoutId: typingSessions.layoutId,
      status: typingSessions.status,
      startedAt: typingSessions.startedAt,
      completedAt: typingSessions.completedAt,
      durationSeconds: typingSessions.durationSeconds,
      totalCharacters: typingSessions.totalCharacters,
      correctCharacters: typingSessions.correctCharacters,
      errors: typingSessions.errors,
      wpm: typingSessions.wpm,
      accuracy: typingSessions.accuracy,
      rawWpm: typingSessions.rawWpm,
      consistency: typingSessions.consistency,
      burstWpm: typingSessions.burstWpm,
      createdAt: typingSessions.createdAt,
    })
    .from(typingSessions)
    .where(eq(typingSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return c.json({ error: 'Session not found', code: 'NOT_FOUND' }, 404);
  }

  // Ensure user owns this session
  if (session.userId !== auth.userId) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }

  return c.json({ session: session as SessionResponse });
});

/**
 * PUT /sessions/:id - Update session (complete it)
 * Legacy endpoint for completing sessions started with POST
 */
app.put('/:id', async (c) => {
  getAuth(c);
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
    burstWpm,
  } = body;

  const [session] = await db
    .update(typingSessions)
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
    .where(eq(typingSessions.id, sessionId))
    .returning({
      id: typingSessions.id,
      userId: typingSessions.userId,
      lessonId: typingSessions.lessonId,
      exerciseId: typingSessions.exerciseId,
      languageCode: typingSessions.languageCode,
      layoutId: typingSessions.layoutId,
      status: typingSessions.status,
      startedAt: typingSessions.startedAt,
      completedAt: typingSessions.completedAt,
      durationSeconds: typingSessions.durationSeconds,
      totalCharacters: typingSessions.totalCharacters,
      correctCharacters: typingSessions.correctCharacters,
      errors: typingSessions.errors,
      wpm: typingSessions.wpm,
      accuracy: typingSessions.accuracy,
      rawWpm: typingSessions.rawWpm,
      consistency: typingSessions.consistency,
      burstWpm: typingSessions.burstWpm,
      createdAt: typingSessions.createdAt,
    });

  if (!session) {
    return c.json({ error: 'Session not found', code: 'NOT_FOUND' }, 404);
  }

  return c.json({ session: session as SessionResponse });
});

/**
 * POST /sessions/:id/keystrokes - Record keystroke events
 */
app.post('/:id/keystrokes', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const sessionId = c.req.param('id');

  const body = await c.req.json();
  const { keystrokes } = body as {
    keystrokes: Array<{
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
    }>;
  };

  // Verify session ownership
  const [session] = await db
    .select({ userId: typingSessions.userId })
    .from(typingSessions)
    .where(eq(typingSessions.id, sessionId))
    .limit(1);

  if (!session) {
    return c.json({ error: 'Session not found', code: 'NOT_FOUND' }, 404);
  }

  if (session.userId !== auth.userId) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }

  // Insert keystroke events
  const events = keystrokes.map((k) => ({
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
