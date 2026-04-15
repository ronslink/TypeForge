/**
 * Users routes
 * User profile and progress management
 */

import { Hono } from 'hono';
import { requireAuth, getAuth, getDb } from '../middleware/index.js';
import { users, userProfiles, userPreferences, dailyStats, userProgress, keyMastery } from '@typeforge/db';
import { orgMembers, orgSettings } from '@typeforge/db';
import { eq, and, desc, gte } from 'drizzle-orm';

const app = new Hono();

// All user routes require authentication
app.use('*', requireAuth);

/**
 * GET /users/me - Get current user profile
 */
app.get('/me', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);
  
  if (!user) {
    return c.json({ error: 'User not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Get profile and preferences in parallel
  const [[profile], [preferences], orgRow] = await Promise.all([
    db.select().from(userProfiles).where(eq(userProfiles.userId, auth.userId)).limit(1),
    db.select().from(userPreferences).where(eq(userPreferences.userId, auth.userId)).limit(1),
    db
      .select({ defaultUiLocale: orgSettings.defaultUiLocale })
      .from(orgMembers)
      .leftJoin(orgSettings, eq(orgSettings.orgId, orgMembers.orgId))
      .where(eq(orgMembers.userId, auth.userId))
      .limit(1),
  ]);

  return c.json({ 
    user: {
      ...user,
      profile,
      preferences,
    },
    // Org default UI locale — null for individual users
    orgDefaultUiLocale: orgRow?.[0]?.defaultUiLocale ?? null,
  });
});

/**
 * PATCH /users/me/locale - Update the user's personal UI locale preference
 * Body: { locale: 'en' | 'es' | 'fr' | 'de' | 'pt' }
 */
app.patch('/me/locale', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);

  const body = await c.req.json<{ locale: string }>();
  const SUPPORTED = ['en', 'es', 'fr', 'de', 'pt'];

  if (!SUPPORTED.includes(body.locale)) {
    return c.json({ error: 'Unsupported locale', supported: SUPPORTED }, 400);
  }

  await db
    .update(users)
    .set({ locale: body.locale, updatedAt: new Date() })
    .where(eq(users.id, auth.userId));

  return c.json({ locale: body.locale });
});

/**
 * PUT /users/me - Update current user profile
 */
app.put('/me', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const body = await c.req.json();
  const { displayName, firstName, lastName, avatarUrl } = body;
  
  const [user] = await db
    .update(users)
    .set({
      displayName,
      firstName,
      lastName,
      avatarUrl,
      updatedAt: new Date(),
    })
    .where(eq(users.id, auth.userId))
    .returning();
  
  return c.json({ user });
});

/**
 * PUT /users/me/preferences - Update user preferences
 */
app.put('/me/preferences', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const body = await c.req.json();
  
  const [preferences] = await db
    .update(userPreferences)
    .set({
      ...body,
      updatedAt: new Date(),
    })
    .where(eq(userPreferences.userId, auth.userId))
    .returning();
  
  return c.json({ preferences });
});

/**
 * GET /users/me/progress - Get user's lesson progress
 */
app.get('/me/progress', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const progress = await db
    .select()
    .from(userProgress)
    .where(eq(userProgress.userId, auth.userId));
  
  return c.json({ progress });
});

/**
 * GET /users/me/stats - Get user's statistics
 */
app.get('/me/stats', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  // Get last 30 days of stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const stats = await db
    .select()
    .from(dailyStats)
    .where(and(
      eq(dailyStats.userId, auth.userId),
      gte(dailyStats.date, thirtyDaysAgo)
    ))
    .orderBy(desc(dailyStats.date));
  
  // Calculate totals
  const totals = stats.reduce((acc, day) => ({
    totalSessions: acc.totalSessions + day.totalSessions,
    totalMinutes: acc.totalMinutes + day.totalMinutes,
    totalCharacters: acc.totalCharacters + day.totalCharacters,
    lessonsCompleted: acc.lessonsCompleted + day.lessonsCompleted,
  }), {
    totalSessions: 0,
    totalMinutes: 0,
    totalCharacters: 0,
    lessonsCompleted: 0,
  });
  
  // Calculate averages
  const avgWpm = stats.length > 0 
    ? stats.reduce((sum, day) => sum + (day.avgWpm ?? 0), 0) / stats.length 
    : 0;
  const avgAccuracy = stats.length > 0 
    ? stats.reduce((sum, day) => sum + (day.avgAccuracy ?? 0), 0) / stats.length 
    : 0;
  
  return c.json({ 
    stats,
    totals,
    averages: {
      wpm: Math.round(avgWpm * 10) / 10,
      accuracy: Math.round(avgAccuracy * 10) / 10,
    }
  });
});

/**
 * GET /users/me/weaknesses - Get user's weak keys
 */
app.get('/me/weaknesses', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const layoutId = c.req.query('layout') ?? 'qwerty-us';
  
  const mastery = await db
    .select()
    .from(keyMastery)
    .where(and(
      eq(keyMastery.userId, auth.userId),
      eq(keyMastery.layoutId, layoutId)
    ));
  
  // Sort by mastery level (lowest first)
  const weaknesses = mastery
    .filter(m => m.masteryLevel < 80)
    .sort((a, b) => a.masteryLevel - b.masteryLevel)
    .slice(0, 10);
  
  return c.json({ weaknesses });
});

export default app;
