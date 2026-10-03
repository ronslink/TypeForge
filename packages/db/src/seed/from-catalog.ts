/**
 * Derives seedable reference data from the curriculum and layout catalogues.
 *
 * Deliberately pure and dependency-free: it takes structural input rather than
 * importing `@typeforge/curriculum` or `@typeforge/layouts`, so the mapping
 * rules below can be tested without loading the whole catalog.
 */
import type {
  LessonDifficulty,
  ReferenceData,
  ReferenceLanguage,
  ReferenceLayout,
  ReferenceLesson,
} from './reference-data.js';

/**
 * Curriculum difficulty is numeric 1–5 (`lesson-registry.ts` documents
 * "Difficulty level (1-5)"), but `lesson_difficulty` in Postgres has four
 * values. The two do not correspond one-to-one, so level 5 collapses into
 * `expert`.
 *
 * This is the single place the mapping is decided. It is exported and asserted
 * against the real catalog in tests, so adding a sixth level fails loudly here
 * instead of silently defaulting every new lesson to `beginner`.
 */
export const DIFFICULTY_BY_LEVEL: Readonly<Record<number, LessonDifficulty>> = {
  1: 'beginner',
  2: 'intermediate',
  3: 'advanced',
  4: 'expert',
  5: 'expert',
};

export function difficultyForLevel(level: number): LessonDifficulty {
  const mapped = DIFFICULTY_BY_LEVEL[level];
  if (!mapped) {
    throw new Error(
      `No lesson_difficulty mapping for curriculum level ${level}. ` +
        `Known levels: ${Object.keys(DIFFICULTY_BY_LEVEL).join(', ')}. ` +
        'Add the level to DIFFICULTY_BY_LEVEL (and consider whether the Postgres ' +
        'enum needs a value for it).'
    );
  }
  return mapped;
}

/** Rough per-level practice time, used for `lessons.estimated_minutes`. */
const MINUTES_BY_LEVEL: Readonly<Record<number, number>> = {
  1: 5,
  2: 7,
  3: 10,
  4: 12,
  5: 15,
};

/** Bounded so a long drill does not turn into a giant jsonb document. */
const MAX_FOCUS_KEYS = 40;

export interface CatalogLessonInput {
  id: string;
  title: string;
  language: string;
  script: string;
  difficulty: number;
  content: Array<{ char: string; code: string }>;
  isTest?: boolean;
}

export interface CatalogLayoutInput {
  id: string;
  name: string;
  language: string;
  script: string;
  rtl?: boolean;
  rows: Array<Array<{ code: string; char: string; finger?: string }>>;
}

export interface BuildReferenceDataInput {
  lessons: CatalogLessonInput[];
  layouts: CatalogLayoutInput[];
  languages: ReferenceLanguage[];
  /**
   * Maps a lesson's language to its default keyboard layout (the caller owns
   * this because it lives in `@typeforge/layouts`). A returned layout that is
   * not among `layouts` is dropped to `null` so the FK stays satisfiable.
   */
  resolveLayoutId?: (languageCode: string) => string | null;
}

function focusKeysFor(content: CatalogLessonInput['content']): string[] {
  const seen = new Set<string>();
  for (const unit of content) {
    if (unit.char && !seen.has(unit.char)) seen.add(unit.char);
    if (seen.size >= MAX_FOCUS_KEYS) break;
  }
  return [...seen];
}

export function buildReferenceData(input: BuildReferenceDataInput): ReferenceData {
  const knownLanguages = new Set(input.languages.map((language) => language.code));
  const knownLayouts = new Set(input.layouts.map((layout) => layout.id));

  const layouts: ReferenceLayout[] = input.layouts.map((layout, index) => {
    if (!knownLanguages.has(layout.language)) {
      throw new Error(
        `Layout '${layout.id}' is filed under language '${layout.language}', which has no ` +
          'language row. Add it to the reference languages: keyboard_layouts.language_code ' +
          'is a foreign key.'
      );
    }

    const fingerMap: Record<string, string> = {};
    for (const row of layout.rows) {
      for (const key of row) {
        if (key.finger) fingerMap[key.code] = key.finger;
      }
    }

    return {
      id: layout.id,
      name: layout.name,
      languageCode: layout.language,
      layoutData: { script: layout.script, rtl: layout.rtl ?? false, rows: layout.rows },
      fingerMap,
      displayOrder: index,
    };
  });

  const lessons: ReferenceLesson[] = input.lessons.map((lesson, index) => {
    if (!knownLanguages.has(lesson.language)) {
      throw new Error(
        `Lesson '${lesson.id}' is filed under language '${lesson.language}', which has no ` +
          'language row. Add it to the reference languages: lessons.language_code is a ' +
          'foreign key.'
      );
    }

    const requestedLayoutId = input.resolveLayoutId?.(lesson.language) ?? null;
    const layoutId =
      requestedLayoutId && knownLayouts.has(requestedLayoutId) ? requestedLayoutId : null;

    return {
      slug: lesson.id,
      languageCode: lesson.language,
      layoutId,
      title: lesson.title,
      difficulty: difficultyForLevel(lesson.difficulty),
      focusKeys: focusKeysFor(lesson.content),
      estimatedMinutes: MINUTES_BY_LEVEL[lesson.difficulty] ?? 5,
      displayOrder: index,
    };
  });

  return { languages: input.languages, layouts, lessons };
}
