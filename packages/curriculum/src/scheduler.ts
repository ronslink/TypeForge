/**
 * Adaptive Scheduler
 * Determines which lessons to present based on user progress
 */

import type { SchedulerConfig, UserProgress, Lesson, ScheduledLesson } from './types.js';

export class AdaptiveScheduler {
  private config: SchedulerConfig;

  constructor(config: Partial<SchedulerConfig> = {}) {
    this.config = {
      masteryThreshold: 95,
      recencyWeight: 0.3,
      difficultyWeight: 0.2,
      gapWeight: 0.5,
      spacedRepetitionIntervals: [1, 3, 7, 14, 30, 60, 90],
      ...config,
    };
  }

  /**
   * Get the next recommended lessons for a user
   */
  getNextLessons(
    progress: UserProgress,
    availableLessons: Lesson[],
    count: number = 5
  ): ScheduledLesson[] {
    const candidates: ScheduledLesson[] = [];

    for (const lesson of availableLessons) {
      const scheduled = this.evaluateLesson(lesson, progress);
      if (scheduled) {
        candidates.push(scheduled);
      }
    }

    // Sort by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);

    return candidates.slice(0, count);
  }

  /**
   * Evaluate a single lesson for scheduling
   */
  private evaluateLesson(lesson: Lesson, progress: UserProgress): ScheduledLesson | null {
    const lessonProgress = progress.lessons.get(lesson.id);

    // Check prerequisites
    if (!this.checkPrerequisites(lesson, progress)) {
      return null;
    }

    // New lesson
    if (!lessonProgress || lessonProgress.status === 'not_started') {
      return {
        lessonId: lesson.id,
        reason: 'new',
        priority: this.calculateNewLessonPriority(lesson, progress),
        scheduledFor: new Date(),
      };
    }

    // In progress - continue
    if (lessonProgress.status === 'in_progress') {
      return {
        lessonId: lesson.id,
        reason: 'weakness',
        priority: 100,
        scheduledFor: new Date(),
      };
    }

    // Completed - check for review
    if (lessonProgress.status === 'completed') {
      const reviewPriority = this.calculateReviewPriority(lessonProgress);
      if (reviewPriority > 0) {
        return {
          lessonId: lesson.id,
          reason: 'review',
          priority: reviewPriority,
          scheduledFor: this.calculateReviewDate(lessonProgress),
        };
      }
    }

    return null;
  }

  /**
   * Check if all prerequisites are met
   */
  private checkPrerequisites(lesson: Lesson, progress: UserProgress): boolean {
    for (const prereqId of lesson.prerequisites) {
      const prereqProgress = progress.lessons.get(prereqId);
      if (!prereqProgress || prereqProgress.status !== 'completed') {
        return false;
      }
    }
    return true;
  }

  /**
   * Calculate priority for a new lesson
   */
  private calculateNewLessonPriority(lesson: Lesson, progress: UserProgress): number {
    let priority = 50; // Base priority

    // Boost if lesson focuses on weak keys
    const weakKeyBoost = this.calculateWeakKeyBoost(lesson.focusKeys, progress.keyMastery);
    priority += weakKeyBoost * this.config.gapWeight * 50;

    // Adjust for difficulty
    const difficultyAdjustment = this.getDifficultyAdjustment(lesson.difficulty, progress);
    priority += difficultyAdjustment * this.config.difficultyWeight * 20;

    return Math.min(100, Math.max(0, priority));
  }

  /**
   * Calculate boost based on weak keys
   */
  private calculateWeakKeyBoost(keys: string[], keyMastery: Map<string, number>): number {
    if (keys.length === 0) return 0;

    const avgMastery =
      keys.reduce((sum, key) => sum + (keyMastery.get(key) || 0), 0) / keys.length;

    // Higher boost for lessons focusing on weaker keys
    return (100 - avgMastery) / 100;
  }

  /**
   * Get difficulty adjustment based on user level
   */
  private getDifficultyAdjustment(
    difficulty: string,
    progress: UserProgress
  ): number {
    const levelMap: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
    };

    const lessonLevel = levelMap[difficulty] || 1;
    const userLevel = progress.currentLevel;

    // Prefer lessons slightly above current level
    return userLevel - lessonLevel + 1;
  }

  /**
   * Calculate review priority based on performance
   */
  private calculateReviewPriority(lessonProgress: import('./types.js').LessonProgress): number {
    if (lessonProgress.bestAccuracy >= this.config.masteryThreshold) {
      return 0; // Mastered, no review needed
    }

    // Higher priority for lower accuracy
    return (this.config.masteryThreshold - lessonProgress.bestAccuracy) * 2;
  }

  /**
   * Calculate next review date using spaced repetition
   */
  private calculateReviewDate(lessonProgress: import('./types.js').LessonProgress): Date {
    if (!lessonProgress.completedAt) {
      return new Date();
    }

    // Determine interval based on accuracy
    const accuracy = lessonProgress.bestAccuracy;
    let intervalIndex = 0;

    if (accuracy >= 95) intervalIndex = 6;
    else if (accuracy >= 90) intervalIndex = 5;
    else if (accuracy >= 85) intervalIndex = 4;
    else if (accuracy >= 80) intervalIndex = 3;
    else if (accuracy >= 75) intervalIndex = 2;
    else if (accuracy >= 70) intervalIndex = 1;

    const days = this.config.spacedRepetitionIntervals[intervalIndex] || 1;
    const reviewDate = new Date(lessonProgress.completedAt);
    reviewDate.setDate(reviewDate.getDate() + days);

    return reviewDate;
  }
}
