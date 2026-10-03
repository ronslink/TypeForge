/**
 * Unit tests for the catalogue → seed-data mapping.
 *
 * These cover the decisions that are easy to get quietly wrong: the numeric
 * curriculum levels versus the four-value Postgres enum, focus-key derivation,
 * and keeping `lessons.layout_id` satisfiable.
 */
import { describe, expect, it } from 'vitest';
import {
  buildReferenceData,
  difficultyForLevel,
  DIFFICULTY_BY_LEVEL,
  type CatalogLayoutInput,
  type CatalogLessonInput,
} from './from-catalog.js';
import type { ReferenceLanguage } from './reference-data.js';

const languages: ReferenceLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin', rtl: false, displayOrder: 0 },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari', rtl: false, displayOrder: 1 },
];

const layout = (overrides: Partial<CatalogLayoutInput> = {}): CatalogLayoutInput => ({
  id: 'qwerty-us',
  name: 'QWERTY (US)',
  language: 'en',
  script: 'Latin',
  rows: [
    [
      { code: 'KeyA', char: 'a', finger: 'left_pinky' },
      { code: 'KeyS', char: 's', finger: 'left_ring' },
    ],
  ],
  ...overrides,
});

const lesson = (overrides: Partial<CatalogLessonInput> = {}): CatalogLessonInput => ({
  id: 'home-row-a',
  title: 'Home Row - A',
  language: 'en',
  script: 'latin',
  difficulty: 1,
  content: [
    { char: 'a', code: 'KeyA' },
    { char: 'a', code: 'KeyA' },
    { char: 's', code: 'KeyS' },
  ],
  ...overrides,
});

describe('difficulty mapping', () => {
  it('maps every curriculum level the catalog uses', () => {
    expect(difficultyForLevel(1)).toBe('beginner');
    expect(difficultyForLevel(2)).toBe('intermediate');
    expect(difficultyForLevel(3)).toBe('advanced');
    expect(difficultyForLevel(4)).toBe('expert');
    // Collapsed: the curriculum has five levels, the enum has four values.
    expect(difficultyForLevel(5)).toBe('expert');
  });

  it('refuses an unmapped level instead of defaulting', () => {
    expect(() => difficultyForLevel(6)).toThrow(/No lesson_difficulty mapping for curriculum level 6/);
    expect(() => difficultyForLevel(0)).toThrow(/No lesson_difficulty mapping/);
  });

  it('covers every key the mapping advertises', () => {
    for (const [level, name] of Object.entries(DIFFICULTY_BY_LEVEL)) {
      expect(difficultyForLevel(Number(level))).toBe(name);
    }
  });
});

describe('buildReferenceData', () => {
  it('derives focus keys as the distinct characters in order', () => {
    const { lessons } = buildReferenceData({ lessons: [lesson()], layouts: [layout()], languages });
    expect(lessons[0]!.focusKeys).toEqual(['a', 's']);
  });

  it('caps focus keys so a long drill does not become a huge document', () => {
    const content = Array.from({ length: 60 }, (_, i) => ({ char: String.fromCharCode(97 + (i % 26)), code: `Key${i}` }));
    const { lessons } = buildReferenceData({
      lessons: [lesson({ content })],
      layouts: [layout()],
      languages,
    });
    expect(lessons[0]!.focusKeys.length).toBeLessThanOrEqual(40);
  });

  it('builds a finger map from the layout rows', () => {
    const { layouts } = buildReferenceData({ lessons: [], layouts: [layout()], languages });
    expect(layouts[0]!.fingerMap).toEqual({ KeyA: 'left_pinky', KeyS: 'left_ring' });
  });

  it('assigns a layout the resolver returns when it was seeded', () => {
    const { lessons } = buildReferenceData({
      lessons: [lesson()],
      layouts: [layout()],
      languages,
      resolveLayoutId: () => 'qwerty-us',
    });
    expect(lessons[0]!.layoutId).toBe('qwerty-us');
  });

  it('drops a layout the resolver returns when it was not seeded, keeping the FK satisfiable', () => {
    const { lessons } = buildReferenceData({
      lessons: [lesson()],
      layouts: [layout()],
      languages,
      resolveLayoutId: () => 'colemak-not-seeded',
    });
    expect(lessons[0]!.layoutId).toBeNull();
  });

  it('leaves the layout null when there is no resolver', () => {
    const { lessons } = buildReferenceData({ lessons: [lesson()], layouts: [layout()], languages });
    expect(lessons[0]!.layoutId).toBeNull();
  });

  it('rejects a lesson whose language has no row, rather than failing later on the FK', () => {
    expect(() =>
      buildReferenceData({
        lessons: [lesson({ language: 'ko' })],
        layouts: [layout()],
        languages,
      })
    ).toThrow(/language 'ko', which has no language row/);
  });

  it('rejects a layout whose language has no row', () => {
    expect(() =>
      buildReferenceData({
        lessons: [],
        layouts: [layout({ language: 'ja' })],
        languages,
      })
    ).toThrow(/language 'ja', which has no language row/);
  });

  it('scales estimated minutes with the level', () => {
    const { lessons } = buildReferenceData({
      lessons: [lesson({ difficulty: 1 }), lesson({ id: 'b', difficulty: 5 })],
      layouts: [layout()],
      languages,
    });
    expect(lessons[0]!.estimatedMinutes).toBeLessThan(lessons[1]!.estimatedMinutes);
  });

  it('uses the lesson id as the slug the client sends', () => {
    const { lessons } = buildReferenceData({
      lessons: [lesson({ id: 'hi-alphabet-1' })],
      layouts: [layout()],
      languages,
    });
    expect(lessons[0]!.slug).toBe('hi-alphabet-1');
  });
});
