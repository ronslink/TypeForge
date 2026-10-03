#!/usr/bin/env node
/**
 * Seeds the reference data the API needs at runtime.
 *
 *   pnpm db:seed
 *
 * Reads the lesson and layout catalogues from code and writes them to the
 * database, so that `POST /sessions` can resolve a lesson slug and record
 * `user_progress`. Without this, lesson completion is silently never tracked.
 *
 * Idempotent: every write is an upsert, so re-running is safe and is how you
 * push catalog changes.
 */
import { LESSON_CATALOG } from '@typeforge/curriculum';
import { getAllLayouts, getDefaultLayoutForLanguage } from '@typeforge/layouts';
import { createDb } from '../client.js';
import { buildReferenceData } from './from-catalog.js';
import { REFERENCE_LANGUAGES } from './languages.js';
import { seedReferenceData } from './reference-data.js';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    'DATABASE_URL is not set. Seeding writes to a real database, so point it at one first,\n' +
      'e.g. DATABASE_URL=postgresql://user:pass@host:5432/typeforge pnpm db:seed'
  );
  process.exit(1);
}

const data = buildReferenceData({
  lessons: LESSON_CATALOG,
  layouts: getAllLayouts(),
  languages: REFERENCE_LANGUAGES,
  resolveLayoutId: (languageCode) => getDefaultLayoutForLanguage(languageCode),
});

const db = createDb(databaseUrl);

try {
  const counts = await seedReferenceData(db, data);

  const byLanguage = new Map<string, number>();
  for (const lesson of data.lessons) {
    byLanguage.set(lesson.languageCode, (byLanguage.get(lesson.languageCode) ?? 0) + 1);
  }

  console.log(
    `Seeded ${counts.languages} languages, ${counts.layouts} keyboard layouts, ` +
      `${counts.lessons} lessons.`
  );
  console.log(
    '  lessons by language: ' +
      [...byLanguage.entries()]
        .sort((a, b) => b[1] - a[1])
        .map(([code, count]) => `${code} ${count}`)
        .join(', ')
  );
  console.log(`  lessons with a layout: ${data.lessons.filter((l) => l.layoutId).length}`);
} finally {
  // postgres-js keeps the socket open; without this the process hangs.
  process.exit(0);
}
