import { describe, expect, it } from 'vitest';
import { LESSON_CATALOG, getWordlistForLanguage } from './index.js';

const UI_LOCALES = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'it', 'ru'];

describe('localized curriculum coverage', () => {
  it.each(UI_LOCALES)('%s has a native word list and usable lesson content', (locale) => {
    const words = getWordlistForLanguage(locale);
    const lessons = LESSON_CATALOG.filter((lesson) => lesson.language === locale);

    expect(words.length).toBeGreaterThan(0);
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons.every((lesson) => lesson.content.length > 0)).toBe(true);
  });

  it.each(UI_LOCALES.filter((locale) => locale !== 'en'))(
    '%s certification titles are localized',
    (locale) => {
      const certificationLessons = LESSON_CATALOG.filter(
        (lesson) => lesson.language === locale && lesson.isTest,
      );

      expect(certificationLessons).toHaveLength(5);
      expect(certificationLessons.map((lesson) => lesson.title)).not.toContain('Final Proficiency Test');
      expect(
        certificationLessons.some((lesson) => /^Stage \d Certification Test$/.test(lesson.title)),
      ).toBe(false);
    },
  );

  it('keeps every lesson id unique', () => {
    const ids = LESSON_CATALOG.map((lesson) => lesson.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
