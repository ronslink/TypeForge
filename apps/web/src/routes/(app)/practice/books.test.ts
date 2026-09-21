import { describe, expect, it } from 'vitest';
import { SUPPORTED_UI_LOCALES } from '$lib/i18n/locales';
import { FAMOUS_BOOKS } from './books';

const NATIVE_SCRIPT: Partial<Record<(typeof SUPPORTED_UI_LOCALES)[number], RegExp>> = {
  ar: /\p{Script=Arabic}/u,
  hi: /\p{Script=Devanagari}/u,
  ja: /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,
  ko: /\p{Script=Hangul}/u,
  ru: /\p{Script=Cyrillic}/u,
  zh: /\p{Script=Han}/u,
};

describe('native-language book coverage', () => {
  it.each(SUPPORTED_UI_LOCALES)('%s has at least two complete training samples', (locale) => {
    const books = FAMOUS_BOOKS[locale];

    expect(books).toBeDefined();
    expect(books.length).toBeGreaterThanOrEqual(2);
    expect(new Set(books.map((book) => book.id)).size).toBe(books.length);

    for (const book of books) {
      expect(book.id.trim()).not.toBe('');
      expect(book.title.trim()).not.toBe('');
      expect(book.author.trim()).not.toBe('');
      expect(book.year).toBeGreaterThan(0);
      expect(book.excerpt.trim().length).toBeGreaterThan(60);
      expect(book.excerpt).not.toMatch(/[ÃÂÐÑ][\u0080-\u00bf]/);
    }
  });

  it.each(Object.entries(NATIVE_SCRIPT))('%s samples use the native script', (locale, script) => {
    expect(FAMOUS_BOOKS[locale].every((book) => script.test(`${book.title} ${book.excerpt}`))).toBe(true);
  });
});
