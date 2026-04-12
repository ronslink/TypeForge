/**
 * Wordlists index - exports all language wordlists and utility functions
 */

import type { WordlistEntry } from './fr.js';
import { frenchWordlist } from './fr.js';
import { spanishWordlist } from './es.js';
import { arabicWordlist } from './ar.js';
import { portugueseWordlist } from './pt.js';
import { englishWordlist } from './en.js';
import { germanWordlist } from './de.js';
import { dutchWordlist } from './nl.js';
import { polishWordlist } from './pl.js';
import { finnishWordlist } from './fi.js';
import { greekWordlist } from './el.js';
import { czechWordlist } from './cs.js';
import { danishWordlist } from './da.js';
import { hindiWordlist } from './hi.js';
import { hungarianWordlist } from './hu.js';
import { malayWordlist } from './ms.js';
import { norwegianWordlist } from './no.js';
import { swedishWordlist } from './sv.js';
import { tagalogWordlist } from './tl.js';
import { swahiliWordlist } from './sw.js';
import { italianWordlist } from './it.js';
import { japaneseWordlist } from './ja.js';
import { koreanWordlist } from './ko.js';

// Re-export types
export type { WordlistEntry };

// Re-export wordlists
export {
  frenchWordlist,
  spanishWordlist,
  arabicWordlist,
  portugueseWordlist,
  englishWordlist,
  germanWordlist,
  dutchWordlist,
  polishWordlist,
  finnishWordlist,
  greekWordlist,
  czechWordlist,
  danishWordlist,
  hindiWordlist,
  hungarianWordlist,
  malayWordlist,
  norwegianWordlist,
  swedishWordlist,
  tagalogWordlist,
  swahiliWordlist,
  italianWordlist,
  japaneseWordlist,
  koreanWordlist,
};

// Language code mapping
const WORDLIST_MAP: Record<string, WordlistEntry[]> = {
  fr: frenchWordlist,
  french: frenchWordlist,
  es: spanishWordlist,
  spanish: spanishWordlist,
  ar: arabicWordlist,
  arabic: arabicWordlist,
  pt: portugueseWordlist,
  portuguese: portugueseWordlist,
  en: englishWordlist,
  english: englishWordlist,
  de: germanWordlist,
  german: germanWordlist,
  nl: dutchWordlist,
  dutch: dutchWordlist,
  pl: polishWordlist,
  polish: polishWordlist,
  fi: finnishWordlist,
  finnish: finnishWordlist,
  el: greekWordlist,
  greek: greekWordlist,
  cs: czechWordlist,
  czech: czechWordlist,
  da: danishWordlist,
  danish: danishWordlist,
  hi: hindiWordlist,
  hindi: hindiWordlist,
  hu: hungarianWordlist,
  hungarian: hungarianWordlist,
  ms: malayWordlist,
  malay: malayWordlist,
  no: norwegianWordlist,
  norwegian: norwegianWordlist,
  sv: swedishWordlist,
  swedish: swedishWordlist,
  tl: tagalogWordlist,
  tagalog: tagalogWordlist,
  sw: swahiliWordlist,
  swahili: swahiliWordlist,
  it: italianWordlist,
  italian: italianWordlist,
  ja: japaneseWordlist,
  japanese: japaneseWordlist,
  ko: koreanWordlist,
  korean: koreanWordlist,
};

/**
 * Get wordlist for a specific language code
 * @param code - Language code (e.g., 'fr', 'es', 'ar', 'en', 'de')
 * @returns Array of WordlistEntry for the language, or empty array if not found
 */
export function getWordlistForLanguage(code: string): WordlistEntry[] {
  const normalizedCode = code.toLowerCase().trim();
  return WORDLIST_MAP[normalizedCode] ?? [];
}

/**
 * Get random words from a language wordlist
 * @param code - Language code
 * @param count - Number of words to return
 * @param maxDifficulty - Maximum difficulty level (1-3), undefined for all
 * @returns Array of random word strings
 */
export function getRandomWords(code: string, count: number, maxDifficulty?: number): string[] {
  const wordlist = getWordlistForLanguage(code);

  if (wordlist.length === 0) {
    return [];
  }

  let filtered = wordlist;
  if (maxDifficulty !== undefined) {
    filtered = wordlist.filter((entry) => entry.difficulty <= maxDifficulty);
  }

  if (filtered.length === 0) {
    return [];
  }

  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((entry) => entry.word);
}

/**
 * Get all available language codes
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): string[] {
  // Filter out the full English word aliases to just return the strict ISO-2 layout codes
  return Object.keys(WORDLIST_MAP).filter(key => key.length === 2);
}

/**
 * Get word count for a language
 * @param code - Language code
 * @returns Number of words in the wordlist
 */
export function getWordCount(code: string): number {
  return getWordlistForLanguage(code).length;
}

/**
 * Get words by difficulty level
 * @param code - Language code
 * @param difficulty - Difficulty level (1, 2, or 3)
 * @returns Array of words at the specified difficulty
 */
export function getWordsByDifficulty(code: string, difficulty: 1 | 2 | 3): WordlistEntry[] {
  const wordlist = getWordlistForLanguage(code);
  return wordlist.filter((entry) => entry.difficulty === difficulty);
}

/**
 * Get words by tag
 * @param code - Language code
 * @param tag - Tag to filter by
 * @returns Array of words with the specified tag
 */
export function getWordsByTag(code: string, tag: string): WordlistEntry[] {
  const wordlist = getWordlistForLanguage(code);
  return wordlist.filter((entry) => entry.tags.includes(tag));
}
