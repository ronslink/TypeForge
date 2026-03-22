/**
 * Wordlists index - exports all language wordlists and utility functions
 */

import { frenchWordlist, WordlistEntry as FrenchWordlistEntry } from './fr.js';
import { spanishWordlist, WordlistEntry as SpanishWordlistEntry } from './es.js';
import { arabicWordlist, WordlistEntry as ArabicWordlistEntry } from './ar.js';

// Re-export types
export type { FrenchWordlistEntry, SpanishWordlistEntry, ArabicWordlistEntry };
export type { WordlistEntry } from './fr.js';

// Re-export wordlists
export { frenchWordlist, spanishWordlist, arabicWordlist };

// Language code mapping
const WORDLIST_MAP: Record<string, WordlistEntry[]> = {
  fr: frenchWordlist,
  french: frenchWordlist,
  es: spanishWordlist,
  spanish: spanishWordlist,
  ar: arabicWordlist,
  arabic: arabicWordlist,
};

/**
 * Get wordlist for a specific language code
 * @param code - Language code (e.g., 'fr', 'es', 'ar', 'french', 'spanish', 'arabic')
 * @returns Array of WordlistEntry for the language, or empty array if not found
 */
export function getWordlistForLanguage(code: string): WordlistEntry[] {
  const normalizedCode = code.toLowerCase().trim();
  return WORDLIST_MAP[normalizedCode] ?? [];
}

/**
 * Get random words from a language wordlist
 * @param code - Language code (e.g., 'fr', 'es', 'ar')
 * @param count - Number of words to return
 * @param maxDifficulty - Maximum difficulty level (1-3), undefined for all
 * @returns Array of random word strings
 */
export function getRandomWords(
  code: string,
  count: number,
  maxDifficulty?: number
): string[] {
  const wordlist = getWordlistForLanguage(code);
  
  if (wordlist.length === 0) {
    return [];
  }

  // Filter by maxDifficulty if specified
  let filtered = wordlist;
  if (maxDifficulty !== undefined) {
    filtered = wordlist.filter((entry) => entry.difficulty <= maxDifficulty);
  }

  if (filtered.length === 0) {
    return [];
  }

  // Shuffle and take requested count
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));
  
  return selected.map((entry) => entry.word);
}

/**
 * Get all available language codes
 * @returns Array of supported language codes
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(WORDLIST_MAP);
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
export function getWordsByDifficulty(
  code: string,
  difficulty: 1 | 2 | 3
): string[] {
  const wordlist = getWordlistForLanguage(code);
  return wordlist
    .filter((entry) => entry.difficulty === difficulty)
    .map((entry) => entry.word);
}

/**
 * Get words by tag
 * @param code - Language code
 * @param tag - Tag to filter by
 * @returns Array of words with the specified tag
 */
export function getWordsByTag(code: string, tag: string): string[] {
  const wordlist = getWordlistForLanguage(code);
  return wordlist
    .filter((entry) => entry.tags.includes(tag))
    .map((entry) => entry.word);
}
