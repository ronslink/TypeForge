/**
 * Lesson Selector - Adaptive lesson selection based on user progress
 *
 * Selection Logic:
 * 1. Prioritize weak areas (accuracy < 85% on specific key/bigram)
 * 2. Then select next row in current layout progression
 * 3. Apply spaced repetition using SM-2 algorithm
 */

import { LESSON_CATALOG, type Lesson } from './lesson-registry.js';
import { calculateNextReview, accuracyToQuality } from './sm2.js';

/** Weak area threshold - accuracy below this triggers priority practice */
const WEAK_AREA_THRESHOLD = 85;

/** Session history entry */
export interface SessionHistoryEntry {
  lessonId: string;
  completedAt: Date;
  accuracy: number;
  wpm: number;
  durationSeconds: number;
}

/** Weak area tracking for a specific key/bigram */
export interface WeakArea {
  keyOrBigram: string;
  accuracy: number;
  lastPracticedAt: Date;
  attemptCount: number;
}

/** User progress tracking for SM-2 spaced repetition */
export interface LessonProgress {
  lessonId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastAccuracy: number;
}

/** Result from selectNextLesson */
export interface SelectedLesson {
  lesson: Lesson;
  reason: 'weak_area' | 'next_row' | 'spaced_repetition' | 'new_lesson';
  priority: number;
}

/**
 * Select the next lesson for a user based on their history and weak areas
 *
 * @param userId - Unique user identifier
 * @param sessionHistory - Array of completed session history
 * @param weakAreas - Map of key/bigram -> weak area info
 * @returns Promise resolving to the next lesson to practice
 */
export async function selectNextLesson(
  _userId: string,
  sessionHistory: SessionHistoryEntry[],
  weakAreas: Map<string, WeakArea>
): Promise<Lesson> {
  const now = new Date();

  // Build lesson progress map from session history
  const lessonProgressMap = buildLessonProgressMap(sessionHistory);

  // Calculate priority scores for all lessons
  const scoredLessons: Array<{
    lesson: Lesson;
    reason: SelectedLesson['reason'];
    priority: number;
  }> = [];

  for (const lesson of LESSON_CATALOG) {
    const score = calculateLessonPriority(lesson, weakAreas, lessonProgressMap, now);
    if (score.priority > 0) {
      scoredLessons.push(score);
    }
  }

  // Sort by priority (highest first)
  scoredLessons.sort((a, b) => b.priority - a.priority);

  // Return the highest priority lesson, or default to first lesson if none scored
  if (scoredLessons.length > 0) {
    return scoredLessons[0]!.lesson;
  }

  // Fallback: return the first lesson in the catalog
  return LESSON_CATALOG[0]!;
}

/**
 * Build a map of lesson progress from session history
 */
function buildLessonProgressMap(
  sessionHistory: SessionHistoryEntry[]
): Map<string, LessonProgress> {
  const progressMap = new Map<string, LessonProgress>();

  // Group sessions by lesson
  const sessionsByLesson = new Map<string, SessionHistoryEntry[]>();
  for (const session of sessionHistory) {
    const existing = sessionsByLesson.get(session.lessonId) || [];
    existing.push(session);
    sessionsByLesson.set(session.lessonId, existing);
  }

  // Calculate progress for each lesson
  for (const [lessonId, sessions] of sessionsByLesson) {
    if (sessions.length === 0) continue;

    // Sort by completion date
    sessions.sort((a, b) => a.completedAt.getTime() - b.completedAt.getTime());

    const lastSession = sessions[sessions.length - 1]!;
    const accuracy = lastSession.accuracy;
    const quality = accuracyToQuality(accuracy);

    // Calculate SM-2 values based on all sessions
    let easeFactor = 2.5;
    let interval = 0;
    let repetitions = 0;

    for (const session of sessions) {
      const sessionQuality = accuracyToQuality(session.accuracy);
      const result = calculateNextReview(sessionQuality, easeFactor, interval, repetitions);
      easeFactor = result.easeFactor;
      interval = result.interval;
      repetitions = result.repetitions;
    }

    const nextReviewResult = calculateNextReview(quality, easeFactor, interval, repetitions);

    progressMap.set(lessonId, {
      lessonId,
      easeFactor: nextReviewResult.easeFactor,
      interval: nextReviewResult.interval,
      repetitions: nextReviewResult.repetitions,
      nextReviewDate: nextReviewResult.nextReviewDate,
      lastAccuracy: accuracy,
    });
  }

  return progressMap;
}

/**
 * Calculate priority score for a lesson
 */
function calculateLessonPriority(
  lesson: Lesson,
  weakAreas: Map<string, WeakArea>,
  lessonProgressMap: Map<string, LessonProgress>,
  now: Date
): SelectedLesson {
  const lessonProgress = lessonProgressMap.get(lesson.id);
  const keyBigram = lesson.tags.key_bigram;

  // 1. Check for weak areas (highest priority)
  const weakArea = weakAreas.get(keyBigram);
  if (weakArea && weakArea.accuracy < WEAK_AREA_THRESHOLD) {
    const weaknessSeverity = (WEAK_AREA_THRESHOLD - weakArea.accuracy) / WEAK_AREA_THRESHOLD;
    return {
      lesson,
      reason: 'weak_area',
      priority: 100 + weaknessSeverity * 50, // 100-150 range
    };
  }

  // 2. Check for spaced repetition due lessons
  if (lessonProgress) {
    const daysUntilReview = Math.ceil(
      (lessonProgress.nextReviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilReview <= 0) {
      // Review is due or overdue
      const overdueBoost = Math.abs(daysUntilReview) * 5;
      return {
        lesson,
        reason: 'spaced_repetition',
        priority: 70 + overdueBoost, // 70+ range
      };
    }

    // Lesson already practiced and not due for review - lower priority
    return {
      lesson,
      reason: 'spaced_repetition',
      priority: Math.max(0, 30 - daysUntilReview),
    };
  }

  // 3. New lesson - calculate based on difficulty progression
  // Prefer lower difficulty lessons for new users
  const difficultyBonus = (6 - lesson.difficulty) * 5; // 25, 20, 15, 10, 5

  // Check if prerequisites are met (lower difficulty lessons should be done first)
  const hasLowerDifficultyAvailable = LESSON_CATALOG.some(
    (l) => l.difficulty < lesson.difficulty && !lessonProgressMap.has(l.id)
  );

  if (hasLowerDifficultyAvailable && lesson.difficulty > 1) {
    // Lower priority if easier lessons are still available
    return {
      lesson,
      reason: 'next_row',
      priority: difficultyBonus * 0.5,
    };
  }

  return {
    lesson,
    reason: 'new_lesson',
    priority: 50 + difficultyBonus, // 55-75 range
  };
}

/**
 * Get recommended lessons for a user with full details
 *
 * @param userId - Unique user identifier
 * @param sessionHistory - Array of completed session history
 * @param weakAreas - Map of key/bigram -> weak area info
 * @param count - Number of recommendations to return
 * @returns Promise resolving to array of selected lessons with reasons
 */
export async function getRecommendedLessons(
  _userId: string,
  sessionHistory: SessionHistoryEntry[],
  weakAreas: Map<string, WeakArea>,
  count: number = 5
): Promise<SelectedLesson[]> {
  const now = new Date();
  const lessonProgressMap = buildLessonProgressMap(sessionHistory);

  const scoredLessons: SelectedLesson[] = [];

  for (const lesson of LESSON_CATALOG) {
    const score = calculateLessonPriority(lesson, weakAreas, lessonProgressMap, now);
    if (score.priority > 0) {
      scoredLessons.push(score);
    }
  }

  // Sort by priority (highest first)
  scoredLessons.sort((a, b) => b.priority - a.priority);

  return scoredLessons.slice(0, count);
}

/**
 * Update weak areas based on session performance
 *
 * @param weakAreas - Current weak areas map
 * @param lesson - The lesson that was practiced
 * @param accuracy - Accuracy achieved in the session
 * @returns Updated weak areas map
 */
export function updateWeakAreas(
  weakAreas: Map<string, WeakArea>,
  lesson: Lesson,
  accuracy: number
): Map<string, WeakArea> {
  const keyBigram = lesson.tags.key_bigram;
  const now = new Date();

  const existing = weakAreas.get(keyBigram);

  if (accuracy < WEAK_AREA_THRESHOLD) {
    // Add or update weak area
    weakAreas.set(keyBigram, {
      keyOrBigram: keyBigram,
      accuracy,
      lastPracticedAt: now,
      attemptCount: existing ? existing.attemptCount + 1 : 1,
    });
  } else if (existing && accuracy >= WEAK_AREA_THRESHOLD) {
    // Remove from weak areas if now above threshold
    weakAreas.delete(keyBigram);
  }

  return weakAreas;
}

/**
 * Get weak areas that need practice
 *
 * @param weakAreas - Map of weak areas
 * @returns Array of weak areas sorted by priority (lowest accuracy first)
 */
export function getPriorityWeakAreas(weakAreas: Map<string, WeakArea>): WeakArea[] {
  return Array.from(weakAreas.values())
    .filter((wa) => wa.accuracy < WEAK_AREA_THRESHOLD)
    .sort((a, b) => a.accuracy - b.accuracy);
}
