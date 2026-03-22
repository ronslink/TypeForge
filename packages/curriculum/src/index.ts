/**
 * @typeforge/curriculum — Lesson content and adaptive scheduler
 */

export { AdaptiveScheduler } from './scheduler.js';
export { LessonGenerator } from './generator.js';
export { ProgressTracker } from './progress.js';
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
  type Finger,
  type LessonChar,
  type Lesson as RegistryLesson,
} from './lesson-registry.js';
