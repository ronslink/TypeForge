/**
 * Integration coverage for `POST /sessions` against a real PostgreSQL.
 *
 * This is the first test in the repository that executes the session write path
 * against an actual database. The route builds SQL by hand — `ON CONFLICT`
 * upserts targeting specific column sets, plus `sql.raw` fragments for the
 * incrementing counters — and none of that can be validated by typechecking or
 * by unit-testing the pure helpers.
 *
 * PGlite is PostgreSQL compiled to WASM, so constraint and conflict semantics
 * are identical to the production database; only the driver adapter differs.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import type { AuthState } from '@typeforge/auth';
import { createTestDatabase, type TestDatabase } from '@typeforge/db/testing';
import {
  dailyStats,
  keyMastery,
  keystrokeEvents,
  languages,
  lessons,
  sessionSummaryIdempotency,
  streaks,
  typingSessions,
  userProgress,
  userXp,
  users,
} from '@typeforge/db';
import sessionsRoutes from './sessions.js';

/** Applying four migrations inside a WASM Postgres needs a generous budget. */
const SETUP_TIMEOUT = 120_000;

let testDb: TestDatabase;
let userId: string;
let lessonId: string;
/** The same slug as `lessonId`, but filed under a different language. */
let germanLessonId: string;

function buildApp(db: TestDatabase['db'], authUserId: string): Hono {
  const app = new Hono();

  // Stand in for the real auth + regional-routing middleware: the route only
  // ever reads `auth.userId` and the request-scoped `db`.
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

  // Mirrors the production error handler's shape so a failing assertion shows a
  // JSON body rather than Hono's plain-text default.
  app.onError((error, c) =>
    c.json({ error: 'Internal Server Error', code: 'INTERNAL_ERROR', detail: error.message }, 500)
  );

  return app;
}

function sessionPayload(overrides: Record<string, unknown> = {}) {
  const at = new Date().toISOString();
  return {
    wpm: 60,
    accuracy: 98,
    duration: 30,
    language: 'en',
    layout: 'qwerty-us',
    lessonId: 'test-lesson',
    keystrokes: [
      { character: 'a', expected: 'a', correct: true, timestamp: at, keyDownAt: at },
      { character: 's', expected: 's', correct: true, timestamp: at, keyDownAt: at },
      { character: 'd', expected: 'd', correct: false, timestamp: at, keyDownAt: at },
    ],
    ...overrides,
  };
}

function postSession(body: unknown, headers: Record<string, string> = {}) {
  return buildApp(testDb.db, userId).request('/api/v1/sessions', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

async function sessionCount(): Promise<number> {
  return (await testDb.db.select({ id: typingSessions.id }).from(typingSessions)).length;
}

async function keystrokeCount(): Promise<number> {
  return (await testDb.db.select({ id: keystrokeEvents.id }).from(keystrokeEvents)).length;
}

beforeAll(async () => {
  testDb = await createTestDatabase();

  const [user] = await testDb.db
    .insert(users)
    .values({
      clerkId: 'user_integration_test',
      email: 'integration@example.test',
      homeRegion: 'EU',
      role: 'learner',
    })
    .returning({ id: users.id });
  userId = user!.id;

  // A lesson the route can resolve from its slug, so the `user_progress`
  // upsert is exercised alongside the other two.
  await testDb.db
    .insert(languages)
    .values({ code: 'en', name: 'English', nativeName: 'English', script: 'Latin' });
  const [lesson] = await testDb.db
    .insert(lessons)
    .values({ languageCode: 'en', title: 'Integration lesson', slug: 'test-lesson' })
    .returning({ id: lessons.id });
  lessonId = lesson!.id;

  // Deliberately the same slug under another language. Lesson slugs are only
  // unique per language, so this is what makes the slug lookup ambiguous if it
  // ignores the language.
  await testDb.db
    .insert(languages)
    .values({ code: 'de', name: 'German', nativeName: 'Deutsch', script: 'Latin' });
  const [germanLesson] = await testDb.db
    .insert(lessons)
    .values({ languageCode: 'de', title: 'Integrationslektion', slug: 'test-lesson' })
    .returning({ id: lessons.id });
  germanLessonId = germanLesson!.id;
}, SETUP_TIMEOUT);

afterAll(async () => {
  await testDb?.close();
});

describe('POST /sessions (integration)', () => {
  it('applies every migration in the journal', () => {
    expect(testDb.appliedMigrations).toEqual([
      '0000_messy_franklin_richards',
      '0001_add_org_settings_policy_columns',
      '0002_privacy_defaults_and_seat_price',
      '0003_session_summary_idempotency',
      '0004_certain_microbe',
    ]);
  });

  it('backs every ON CONFLICT target with a unique constraint', async () => {
    // The regression this guards: these constraints were declared in the schema
    // with a syntax drizzle-kit ignores, so they never reached the database and
    // every session submission failed with 42P10.
    const required = [
      'key_mastery_user_layout_key_unique',
      'daily_stats_user_date_language_unique',
      'user_progress_user_lesson_unique',
    ];

    const { rows } = await testDb.client.query<{ indexname: string }>(
      'select indexname from pg_indexes where schemaname = $1',
      ['public']
    );
    const names = rows.map((row) => row.indexname);

    for (const name of required) {
      expect(names).toContain(name);
    }
  });

  it('stores the session and every row derived from it', async () => {
    const before = await sessionCount();

    const response = await postSession(sessionPayload());
    const body = (await response.json()) as {
      session: { id: string; wpm: number; accuracy: number };
      xpEarned: number;
      currentLevel: number;
      streak: number;
    };

    expect(response.status).toBe(201);
    expect(body.session.wpm).toBe(60);
    expect(body.session.accuracy).toBe(98);
    expect(body.xpEarned).toBeGreaterThan(0);
    expect(body.streak).toBe(1);

    // The session itself.
    expect(await sessionCount()).toBe(before + 1);
    expect(await keystrokeCount()).toBe(3);

    // Per-key mastery: one row per distinct expected key, from the ON CONFLICT
    // upsert that a real database will reject if the target has no unique index.
    const mastery = await testDb.db
      .select({ key: keyMastery.key, total: keyMastery.totalAttempts })
      .from(keyMastery);
    expect(mastery.map((row) => row.key).sort()).toEqual(['a', 'd', 's']);
    expect(mastery.find((row) => row.key === 'd')?.total).toBe(1);

    // Gamification side effects.
    const xp = await testDb.db.select().from(userXp);
    expect(xp).toHaveLength(1);
    expect(xp[0]!.totalXp).toBeGreaterThan(0);

    const streakRows = await testDb.db.select().from(streaks);
    expect(streakRows).toHaveLength(1);
    expect(streakRows[0]!.currentStreak).toBe(1);

    const daily = await testDb.db.select().from(dailyStats);
    expect(daily).toHaveLength(1);
    expect(daily[0]!.totalSessions).toBe(1);

    // Lesson progress, reached by resolving the slug to an internal UUID.
    const progress = await testDb.db.select().from(userProgress);
    expect(progress).toHaveLength(1);
    expect(progress[0]!.lessonId).toBe(lessonId);
  });

  it('replays the stored response instead of writing twice when the key repeats', async () => {
    const key = 'session:practice:1f0c9d2a';
    const payload = sessionPayload();

    const first = await postSession(payload, { 'Idempotency-Key': key });
    expect(first.status).toBe(201);
    const firstBody = (await first.json()) as { session: { id: string } };

    const sessionsAfterFirst = await sessionCount();
    const keystrokesAfterFirst = await keystrokeCount();

    const second = await postSession(payload, { 'Idempotency-Key': key });
    const secondBody = (await second.json()) as { session: { id: string } };

    expect(second.status).toBe(201);
    expect(second.headers.get('Idempotent-Replay')).toBe('true');
    expect(secondBody.session.id).toBe(firstBody.session.id);

    // The whole point: a retry must not create a second session or duplicate
    // keystrokes.
    expect(await sessionCount()).toBe(sessionsAfterFirst);
    expect(await keystrokeCount()).toBe(keystrokesAfterFirst);
  });

  it('rejects a key that was already used for a different body', async () => {
    const key = 'session:practice:2b7e4c1f';

    const first = await postSession(sessionPayload({ wpm: 55 }), { 'Idempotency-Key': key });
    expect(first.status).toBe(201);

    const sessionsAfterFirst = await sessionCount();

    const conflicting = await postSession(sessionPayload({ wpm: 72 }), {
      'Idempotency-Key': key,
    });
    expect(conflicting.status).toBe(409);
    expect(((await conflicting.json()) as { code: string }).code).toBe(
      'IDEMPOTENCY_KEY_REUSED'
    );
    expect(await sessionCount()).toBe(sessionsAfterFirst);
  });

  it('rejects a malformed Idempotency-Key without writing anything', async () => {
    const before = await sessionCount();
    const recordsBefore = (
      await testDb.db
        .select({ id: sessionSummaryIdempotency.id })
        .from(sessionSummaryIdempotency)
    ).length;

    const response = await postSession(sessionPayload(), { 'Idempotency-Key': 'short' });

    expect(response.status).toBe(400);
    expect(((await response.json()) as { code: string }).code).toBe('INVALID_IDEMPOTENCY_KEY');
    expect(await sessionCount()).toBe(before);
    const recordsAfter = (
      await testDb.db
        .select({ id: sessionSummaryIdempotency.id })
        .from(sessionSummaryIdempotency)
    ).length;
    expect(recordsAfter).toBe(recordsBefore);
  });

  it('rejects a submission missing required metrics', async () => {
    const before = await sessionCount();

    const response = await postSession({ language: 'en', layout: 'qwerty-us' });

    expect(response.status).toBe(400);
    expect(((await response.json()) as { code: string }).code).toBe('VALIDATION_ERROR');
    expect(await sessionCount()).toBe(before);
  });

  it('links lesson progress to the lesson in the submitted language', async () => {
    // 'test-lesson' exists in both 'en' and 'de'. Resolving on slug alone picks
    // whichever row the planner returns first, so this fails if the lookup stops
    // using the language.
    const response = await postSession(
      sessionPayload({ language: 'de', lessonId: 'test-lesson' })
    );
    expect(response.status).toBe(201);

    const germanProgress = await testDb.db
      .select({ lessonId: userProgress.lessonId })
      .from(userProgress)
      .where(eq(userProgress.lessonId, germanLessonId));
    expect(germanProgress).toHaveLength(1);

    const englishProgress = await testDb.db
      .select({ lessonId: userProgress.lessonId })
      .from(userProgress)
      .where(eq(userProgress.lessonId, lessonId));
    // Still only the row from the first English test, not a new German one.
    expect(englishProgress).toHaveLength(1);
  });

  it('accepts two concurrent first sessions for a new user without failing', async () => {
    // A brand-new user has no streak or XP row, which is precisely when the old
    // select-then-insert raced: both requests saw nothing, both inserted, and the
    // loser hit the unique index on (user_id, type) and returned 500.
    const [fresh] = await testDb.db
      .insert(users)
      .values({
        clerkId: 'user_concurrent_first_session',
        email: 'concurrent@example.test',
        homeRegion: 'EU',
        role: 'learner',
      })
      .returning({ id: users.id });
    const freshUserId = fresh!.id;

    const app = buildApp(testDb.db, freshUserId);
    const submit = (key: string) =>
      app.request('/api/v1/sessions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'Idempotency-Key': key },
        body: JSON.stringify(sessionPayload({ language: 'en' })),
      });

    const [first, second] = await Promise.all([
      submit('session:concurrent:aaaaaaaa'),
      submit('session:concurrent:bbbbbbbb'),
    ]);

    expect([first.status, second.status]).toEqual([201, 201]);

    const streakRows = await testDb.db
      .select({ id: streaks.id, currentStreak: streaks.currentStreak })
      .from(streaks)
      .where(eq(streaks.userId, freshUserId));
    expect(streakRows).toHaveLength(1);
    expect(streakRows[0]!.currentStreak).toBe(1);

    const xpRows = await testDb.db
      .select({ totalXp: userXp.totalXp })
      .from(userXp)
      .where(eq(userXp.userId, freshUserId));
    expect(xpRows).toHaveLength(1);
    expect(xpRows[0]!.totalXp).toBeGreaterThan(0);
  });
});
