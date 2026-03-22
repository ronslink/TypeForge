/**
 * Progress routes
 * User progress tracking, stats, and analytics
 */

import { Hono } from 'hono';
import { requireAuth, getAuth } from '../middleware/index.js';
import { getDb } from '../middleware/regional-routing.js';
import { typingSessions, userXp, streaks } from '@typeforge/db';
import { eq, desc, and, gte, lte } from 'drizzle-orm';
import type { Env } from '../../../../infra/contracts/bindings.js';

const app = new Hono<{ Bindings: Env }>();

// All progress routes require authentication
app.use('*', requireAuth);

/**
 * Type definitions
 */
interface Session {
  id: string;
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
}

interface ProgressResponse {
  xp: number;
  level: number;
  streak: number;
  totalSessions: number;
  avgWpm: number;
  avgAccuracy: number;
  history: Session[];
}

interface WeeklyStats {
  sessions: number;
  wpm: number;
  accuracy: number;
}

interface StatsResponse {
  thisWeek: WeeklyStats;
  lastWeek: WeeklyStats;
  improvement: number;
}

/**
 * GET /progress - Get user's complete progress
 * Returns XP, level, streak, aggregated stats, and recent session history
 */
app.get('/', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const userId = auth.userId;

  // Get user XP and level
  const [xpRecord] = await db
    .select({
      totalXp: userXp.totalXp,
      currentLevel: userXp.currentLevel,
    })
    .from(userXp)
    .where(eq(userXp.userId, userId))
    .limit(1);

  // Get user's streak
  const [streakRecord] = await db
    .select({
      currentStreak: streaks.currentStreak,
    })
    .from(streaks)
    .where(and(eq(streaks.userId, userId), eq(streaks.type, 'daily')))
    .limit(1);

  // Get all completed sessions for stats calculation
  const userSessions = await db
    .select({
      id: typingSessions.id,
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
    })
    .from(typingSessions)
    .where(and(eq(typingSessions.userId, userId), eq(typingSessions.status, 'completed')))
    .orderBy(desc(typingSessions.startedAt))
    .limit(50);

  // Calculate aggregated stats
  const completedSessions = userSessions.filter((s) => s.status === 'completed');
  const totalSessions = completedSessions.length;

  let avgWpm = 0;
  let avgAccuracy = 0;

  if (totalSessions > 0) {
    const totalWpm = completedSessions.reduce((sum, s) => sum + (s.wpm || 0), 0);
    const totalAccuracy = completedSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0);
    avgWpm = Math.round((totalWpm / totalSessions) * 10) / 10;
    avgAccuracy = Math.round((totalAccuracy / totalSessions) * 10) / 10;
  }

  const response: ProgressResponse = {
    xp: xpRecord?.totalXp ?? 0,
    level: xpRecord?.currentLevel ?? 1,
    streak: streakRecord?.currentStreak ?? 0,
    totalSessions,
    avgWpm,
    avgAccuracy,
    history: userSessions as Session[],
  };

  return c.json(response);
});

/**
 * GET /progress/stats - Get weekly statistics
 * Returns this week vs last week comparison with improvement percentage
 */
app.get('/stats', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const userId = auth.userId;

  // Calculate date ranges
  const now = new Date();
  const startOfThisWeek = new Date(now);
  startOfThisWeek.setDate(now.getDate() - now.getDay()); // Start of current week (Sunday)
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const endOfLastWeek = new Date(startOfThisWeek);
  endOfLastWeek.setMilliseconds(-1);

  // Get this week's sessions
  const thisWeekSessions = await db
    .select({
      wpm: typingSessions.wpm,
      accuracy: typingSessions.accuracy,
    })
    .from(typingSessions)
    .where(
      and(
        eq(typingSessions.userId, userId),
        eq(typingSessions.status, 'completed'),
        gte(typingSessions.completedAt, startOfThisWeek)
      )
    );

  // Get last week's sessions
  const lastWeekSessions = await db
    .select({
      wpm: typingSessions.wpm,
      accuracy: typingSessions.accuracy,
    })
    .from(typingSessions)
    .where(
      and(
        eq(typingSessions.userId, userId),
        eq(typingSessions.status, 'completed'),
        gte(typingSessions.completedAt, startOfLastWeek),
        lte(typingSessions.completedAt, endOfLastWeek)
      )
    );

  // Calculate this week stats
  const thisWeekCount = thisWeekSessions.length;
  const thisWeekWpm =
    thisWeekCount > 0
      ? Math.round(
          (thisWeekSessions.reduce((sum, s) => sum + (s.wpm || 0), 0) / thisWeekCount) * 10
        ) / 10
      : 0;
  const thisWeekAccuracy =
    thisWeekCount > 0
      ? Math.round(
          (thisWeekSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / thisWeekCount) * 10
        ) / 10
      : 0;

  // Calculate last week stats
  const lastWeekCount = lastWeekSessions.length;
  const lastWeekWpm =
    lastWeekCount > 0
      ? Math.round(
          (lastWeekSessions.reduce((sum, s) => sum + (s.wpm || 0), 0) / lastWeekCount) * 10
        ) / 10
      : 0;
  const lastWeekAccuracy =
    lastWeekCount > 0
      ? Math.round(
          (lastWeekSessions.reduce((sum, s) => sum + (s.accuracy || 0), 0) / lastWeekCount) * 10
        ) / 10
      : 0;

  // Calculate improvement percentage
  // Weighted average of WPM and accuracy improvement
  let improvement = 0;
  if (lastWeekCount > 0 && thisWeekCount > 0) {
    const wpmImprovement = lastWeekWpm > 0 ? ((thisWeekWpm - lastWeekWpm) / lastWeekWpm) * 100 : 0;
    const accuracyImprovement =
      lastWeekAccuracy > 0 ? ((thisWeekAccuracy - lastWeekAccuracy) / lastWeekAccuracy) * 100 : 0;
    improvement = Math.round((wpmImprovement * 0.6 + accuracyImprovement * 0.4) * 10) / 10;
  } else if (thisWeekCount > 0 && lastWeekCount === 0) {
    // New activity this week, no comparison possible - set to 0
    improvement = 0;
  }

  const response: StatsResponse = {
    thisWeek: {
      sessions: thisWeekCount,
      wpm: thisWeekWpm,
      accuracy: thisWeekAccuracy,
    },
    lastWeek: {
      sessions: lastWeekCount,
      wpm: lastWeekWpm,
      accuracy: lastWeekAccuracy,
    },
    improvement,
  };

  return c.json(response);
});

export default app;
