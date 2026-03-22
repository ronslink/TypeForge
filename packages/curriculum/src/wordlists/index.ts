export * from './fr.js';
export * from './es.js';
export * from './ar.js';

import type { WordlistEntry } from './fr.js';
import { frenchWordlist } from './fr.js';
import { spanishWordlist } from './es.js';
import { arabicWordlist } from './ar.js';

export type { WordlistEntry };

const WORDLISTS: Record<string, WordlistEntry[]> = {
  fr: frenchWordlist,
  es: spanishWordlist,
  ar: arabicWordlist,
};

export function getWordlistForLanguage(code: string): WordlistEntry[] {
  return WORDLISTS[code] ?? [];
}

export function getRandomWords(
  code: string,
  count: number,
  maxDifficulty?: number
): string[] {
  const list = getWordlistForLanguage(code);
  const filtered = maxDifficulty
    ? list.filter((e) => e.difficulty <= maxDifficulty)
    : list;
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((e) => e.word);
}

export function getWordsForLesson(
  code: string,
  count: number,
  difficulty: number
): string[] {
  const list = getWordlistForLanguage(code).filter(
    (e) => e.difficulty === difficulty
  );
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map((e) => e.word);
}
