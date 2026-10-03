/**
 * Proves the curriculum → database bridge works end to end.
 *
 * Before the seed existed, `POST /sessions` resolved `lessonId` against an empty
 * `lessons` table, so it silently linked nothing: no `user_progress` row, and
 * `daily_stats.lessons_completed` stuck at 0. This test seeds the real catalogue
 * and then submits a session the way the app does.
 *
 * The second case is the control: a slug that is not in the reference data must
 * still be accepted (the session itself is valid) but must not fabricate a
 * progress row. Together they show the database rows are what make lesson
 * tracking work, rather than something else quietly compensating.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { LESSON_CATALOG } from '@typeforge/curriculum';
import { getAllLayouts, getDefaultLayoutForLanguage } from '@typeforge/layouts';
import type { AuthState } from '@typeforge/auth';
import { createTestDatabase, type TestDatabase } from '@typeforge/db/testing';
import {
  buildReferenceData,
  seedReferenceData,
  REFERENCE_LANGUAGES,
} from '@typeforge/db/seed';
import { dailyStats, lessons, typingSessions, userProgress, users } from '@typeforge/db';
import sessionsRoutes from './sessions.js';

const SETUP_TIMEOUT = 180_000;

let testDb: TestDatabase;
let userId: string;
let hindiLessonId: string;

function buildApp(db: TestDatabase['db'], authUserId: string): Hono {
  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('db', db);
    const auth: AuthState = {
      userId: authUserId,
      user: null,
      isAuthenticated: true,
      isEmailVerified: true,
      region: 'EU',
      role: 'learner',
    };
    c.set('auth', auth);
    await next();
  });
  app.route('/api/v1/sessions', sessionsRoutes);
  app.onError((error, c) =>
    c.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', detail: error.message }, 500)
  );
  return app;
}

function payload(lessonId: string, language: string, layout: string) {
  const at = new Date().toISOString();
  return {
    wpm: 42,
    accuracy: 97,
    duration: 45,
    language,
    layout,
    lessonId,
    keystrokes: [
      { character: 'अ', expected: 'अ', correct: true, timestamp: at, keyDownAt: at },
      { character: 'स', expected: 'स', correct: true, timestamp: at, keyDownAt: at },
    ],
  };
}

function submit(lessonId: string, language: string, layout: string, key: string) {
  return buildApp(testDb.db, userId).request('/api/v1/sessions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(payload(lessonId, language, layout)),
  });
}

beforeAll(async () => {
  testDb = await createTestDatabase();

  const [user] = await testDb.db
    .insert(users)
    .values({
      clerkId: 'user_lesson_progress',
      email: 'lesson-progress@example.test',
      homeRegion: 'EU',
      role: 'learner',
    })
    .returning({ id: users.id });
  userId = user!.id;

  // Seed exactly what `pnpm db:seed` seeds.
  await seedReferenceData(
    testDb.db,
    buildReferenceData({
      lessons: LESSON_CATALOG,
      layouts: getAllLayouts(),
      languages: REFERENCE_LANGUAGES,
      resolveLayoutId: (languageCode) => getDefaultLayoutForLanguage(languageCode),
    })
  );

  const [hindiLesson] = await testDb.db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.slug, 'hi-alphabet-1'))
    .limit(1);
  hindiLessonId = hindiLesson!.id;
}, SETUP_TIMEOUT);

afterAll(async () => {
  await testDb?.close();
});

describe('lesson progress with the curriculum seeded', () => {
  it('links a submitted session to the lesson and records completion', async () => {
    const response = await submit(
      'hi-alphabet-1',
      'hi',
      'devanagari-phonetic',
      'session:progress:aaaaaaaa'
    );
    expect(response.status).toBe(201);

    const [session] = await testDb.db
      .select({ lessonId: typingSessions.lessonId })
      .from(typingSessions)
      .where(eq(typingSessions.userId, userId));
    expect(session!.lessonId).toBe(hindiLessonId);

    const progress = await testDb.db
      .select({ lessonId: userProgress.lessonId, status: userProgress.status })
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
    expect(progress).toHaveLength(1);
    expect(progress[0]!.lessonId).toBe(hindiLessonId);
    expect(progress[0]!.status).toBe('completed');

    const daily = await testDb.db
      .select({ lessonsCompleted: dailyStats.lessonsCompleted })
      .from(dailyStats)
      .where(eq(dailyStats.userId, userId));
    expect(daily).toHaveLength(1);
    expect(daily[0]!.lessonsCompleted).toBe(1);
  });

  it('accepts a session for an unknown slug but does not fabricate progress', async () => {
    const before = (
      await testDb.db.select({ id: userProgress.id }).from(userProgress)
    ).length;

    const response = await submit(
      'this-lesson-does-not-exist',
      'hi',
      'devanagari-phonetic',
      'session:progress:bbbbbbbb'
    );
    // The session is still a valid result; only the lesson link is unavailable.
    expect(response.status).toBe(201);

    const after = (await testDb.db.select({ id: userProgress.id }).from(userProgress)).length;
    expect(after).toBe(before);
  });
});
