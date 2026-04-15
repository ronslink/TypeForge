/**
 * @typeforge/curriculum — Lesson content and adaptive scheduler
 */

export { AdaptiveScheduler } from './scheduler.js';
export { LessonGenerator } from './generator.js';
export { ProgressTracker } from './progress.js';
export { selectNextLesson, type SessionHistoryEntry, type WeakArea } from './lesson-selector.js';
export type {
  Lesson,
  Exercise,
  LessonProgress,
  UserProgress,
  SchedulerConfig,
  DifficultyLevel,
} from './types.js';

// Lesson Registry exports
export {
  LESSON_CATALOG,
  getLessonById,
  getLessonsByDifficulty,
  getLessonsByHand,
  getLessonsByFinger,
  getLessonsByKeyBigram,
  getLessonsByScript,
  getRTLLessons,
  type Finger,
  type LessonChar,
  type Lesson as RegistryLesson,
} from './lesson-registry.js';

// Arabic RTL lessons
export {
  arabicLessons,
  arabicAlphabetLessons,
  arabicHarakatLessons,
  arabicGrammarLessons,
  arabicPhraseLessons,
} from './rtl-lessons.js';

// Hebrew RTL lessons
export { hebrewLessons } from './hebrew-lessons.js';

// Japanese Romaji lessons
export { japaneseLessons } from './japanese-lessons.js';

// Greek lessons
export { greekLessons } from './greek-lessons.js';

// French AZERTY lessons
export { azertyLessons } from './azerty-lessons.js';

// German QWERTZ lessons
export { germanLessons } from './german-lessons.js';

// Russian/Cyrillic lessons
export { russianLessons } from './cyrillic-lessons.js';

// Korean Hangul lessons
export { koreanLessons } from './korean-lessons.js';

// Hindi Devanagari lessons
export { hindiLessons } from './hindi-lessons.js';

// Dvorak lessons
export { dvorakLessons } from './dvorak-lessons.js';

// Wordlist exports
export {
  frenchWordlist,
  spanishWordlist,
  arabicWordlist,
  getWordlistForLanguage,
  getRandomWords,
  getSupportedLanguages,
  getWordCount,
  getWordsByDifficulty,
  getWordsByTag,
  type WordlistEntry,
} from './wordlists/index.js';

// Adaptive lesson generator
export {
  generateAdaptiveLesson,
  type AdaptiveLessonRequest,
  type AdaptiveLesson,
} from './adaptive.js';
