/**
 * Reference-data seeding.
 *
 * Typing lessons, keyboard layouts and languages live in code
 * (`@typeforge/curriculum`, `@typeforge/layouts`), but the API resolves a lesson
 * slug against the `lessons` **table** when a session is submitted. Without rows
 * there, `POST /sessions` cannot link a lesson, `user_progress` is never written
 * and `daily_stats.lessons_completed` stays 0 forever.
 *
 * This module owns the database side only: it takes plain data and upserts it.
 * Deriving that data from the code packages is the CLI's job
 * (`./cli.ts`), which keeps this layer free of dependencies on them and
 * testable against PGlite.
 */
import { sql } from 'drizzle-orm';
import type { DbClient } from '../client.js';
import { keyboardLayouts, languages, lessons } from '../schema/index.js';

export type LessonDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface ReferenceLanguage {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  rtl: boolean;
  displayOrder: number;
}

export interface ReferenceLayout {
  id: string;
  name: string;
  /** Must exist in `languages.code`: `keyboard_layouts.language_code` is an FK. */
  languageCode: string;
  layoutData: unknown;
  fingerMap: Record<string, string>;
  displayOrder: number;
}

export interface ReferenceLesson {
  /** The lesson's public identifier, i.e. `lessons.slug`. */
  slug: string;
  languageCode: string;
  /** `null` when the layout is not one we seeded; the FK must stay satisfiable. */
  layoutId: string | null;
  title: string;
  difficulty: LessonDifficulty;
  focusKeys: string[];
  estimatedMinutes: number;
  displayOrder: number;
}

export interface ReferenceData {
  languages: ReferenceLanguage[];
  layouts: ReferenceLayout[];
  lessons: ReferenceLesson[];
}

export interface SeedCounts {
  languages: number;
  layouts: number;
  lessons: number;
}

/**
 * Upsert the reference data.
 *
 * Every write is an upsert keyed on the row's natural identity, so this is
 * idempotent and safe to re-run — which is also why it is not wrapped in a
 * transaction: a partial failure can simply be retried.
 *
 * Order matters. `keyboard_layouts.language_code` and `lessons.language_code`
 * are foreign keys into `languages.code`, and `lessons.layout_id` into
 * `keyboard_layouts.id`.
 */
export async function seedReferenceData(
  db: DbClient,
  data: ReferenceData
): Promise<SeedCounts> {
  if (data.languages.length > 0) {
    await db
      .insert(languages)
      .values(data.languages)
      .onConflictDoUpdate({
        target: languages.code,
        set: {
          name: sql`excluded.name`,
          nativeName: sql`excluded.native_name`,
          script: sql`excluded.script`,
          rtl: sql`excluded.rtl`,
          isActive: sql`excluded.is_active`,
          displayOrder: sql`excluded.display_order`,
        },
      });
  }

  if (data.layouts.length > 0) {
    await db
      .insert(keyboardLayouts)
      .values(data.layouts)
      .onConflictDoUpdate({
        target: keyboardLayouts.id,
        set: {
          name: sql`excluded.name`,
          languageCode: sql`excluded.language_code`,
          layoutData: sql`excluded.layout_data`,
          fingerMap: sql`excluded.finger_map`,
          isActive: sql`excluded.is_active`,
          displayOrder: sql`excluded.display_order`,
        },
      });
  }

  if (data.lessons.length > 0) {
    // Target is the unique index added by migration 0004. Before that index
    // existed this upsert failed with 42P10.
    await db
      .insert(lessons)
      .values(data.lessons)
      .onConflictDoUpdate({
        target: [lessons.languageCode, lessons.slug],
        set: {
          layoutId: sql`excluded.layout_id`,
          title: sql`excluded.title`,
          difficulty: sql`excluded.difficulty`,
          focusKeys: sql`excluded.focus_keys`,
          estimatedMinutes: sql`excluded.estimated_minutes`,
          isActive: sql`excluded.is_active`,
          displayOrder: sql`excluded.display_order`,
          updatedAt: sql`now()`,
        },
      });
  }

  return {
    languages: data.languages.length,
    layouts: data.layouts.length,
    lessons: data.lessons.length,
  };
}
