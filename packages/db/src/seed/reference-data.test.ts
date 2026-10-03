/**
 * Verifies the seed against the **real** catalogue, not a fixture.
 *
 * Two things matter here. First, that the entire shipped curriculum maps cleanly
 * onto the schema — an unmapped difficulty level or a language with no row fails
 * loudly rather than being skipped. Second, that the writes are idempotent and
 * leave every foreign key satisfiable.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { LESSON_CATALOG } from '@typeforge/curriculum';
import { getAllLayouts, getDefaultLayoutForLanguage } from '@typeforge/layouts';
import { createTestDatabase, type TestDatabase } from '../testing/index.js';
import {
  keyboardLayouts,
  languages as languagesTable,
  lessons as lessonsTable,
} from '../schema/index.js';
import { buildReferenceData } from './from-catalog.js';
import { REFERENCE_LANGUAGES } from './languages.js';
import { seedReferenceData } from './reference-data.js';

const SETUP_TIMEOUT = 120_000;

let testDb: TestDatabase;

function realReferenceData() {
  return buildReferenceData({
    lessons: LESSON_CATALOG,
    layouts: getAllLayouts(),
    languages: REFERENCE_LANGUAGES,
    resolveLayoutId: (languageCode) => getDefaultLayoutForLanguage(languageCode),
  });
}

beforeAll(async () => {
  testDb = await createTestDatabase();
}, SETUP_TIMEOUT);

afterAll(async () => {
  await testDb?.close();
});

describe('reference data against the real catalog', () => {
  it('maps the shipped curriculum without an unmapped level or missing language', () => {
    // Throws if any lesson carries a difficulty the mapping does not cover, or a
    // language with no reference row. That is the drift guard.
    const data = realReferenceData();

    expect(LESSON_CATALOG.length).toBeGreaterThan(100);
    expect(data.lessons).toHaveLength(LESSON_CATALOG.length);
    expect(data.layouts).toHaveLength(getAllLayouts().length);
    expect(data.languages).toHaveLength(REFERENCE_LANGUAGES.length);
  });

  it('gives every lesson a layout that was actually seeded, or none at all', () => {
    const data = realReferenceData();
    const seededLayoutIds = new Set(data.layouts.map((layout) => layout.id));

    for (const lesson of data.lessons) {
      if (lesson.layoutId !== null) {
        expect(seededLayoutIds.has(lesson.layoutId)).toBe(true);
      }
    }

    // The resolver should be finding layouts for the languages that have them.
    expect(data.lessons.filter((lesson) => lesson.layoutId !== null).length).toBeGreaterThan(0);
  });

  it('seeds the whole catalog', async () => {
    const data = realReferenceData();
    const counts = await seedReferenceData(testDb.db, data);

    expect(counts).toEqual({
      languages: data.languages.length,
      layouts: data.layouts.length,
      lessons: data.lessons.length,
    });

    expect(await testDb.db.select({ code: languagesTable.code }).from(languagesTable)).toHaveLength(
      data.languages.length
    );
    expect(
      await testDb.db.select({ id: keyboardLayouts.id }).from(keyboardLayouts)
    ).toHaveLength(data.layouts.length);

    const lessons = await testDb.db
      .select({ slug: lessonsTable.slug, difficulty: lessonsTable.difficulty })
      .from(lessonsTable);
    expect(lessons).toHaveLength(data.lessons.length);

    // A lesson the client can actually reference by slug.
    const hindi = lessons.find((lesson) => lesson.slug === 'hi-alphabet-1');
    expect(hindi).toBeDefined();
    expect(hindi!.difficulty).toBe('beginner');
  });

  it('is idempotent: re-seeding changes nothing', async () => {
    const data = realReferenceData();

    // Runs against the database already seeded by the previous test.
    const before = (
      await testDb.db.select({ slug: lessonsTable.slug }).from(lessonsTable)
    ).length;

    await seedReferenceData(testDb.db, data);

    const after = (await testDb.db.select({ slug: lessonsTable.slug }).from(lessonsTable)).length;
    expect(after).toBe(before);
    expect(after).toBe(data.lessons.length);
  });
});
