/**
 * Progress Tracker
 * Tracks and analyzes user progress through curriculum
 */

import type { UserProgress, LessonProgress } from './types.js';

export class ProgressTracker {
  /**
   * Create initial progress for a new user
   */
  createInitialProgress(
    userId: string,
    languageCode: string,
    layoutId: string
  ): UserProgress {
    return {
      userId,
      languageCode,
      layoutId,
      lessons: new Map(),
      keyMastery: new Map(),
      totalXp: 0,
      currentLevel: 1,
    };
  }

  /**
   * Update lesson progress after completion
   */
  updateLessonProgress(
    progress: UserProgress,
    lessonId: string,
    wpm: number,
    accuracy: number
  ): UserProgress {
    const existing = progress.lessons.get(lessonId);
    const now = new Date();

    const updated: LessonProgress = {
      lessonId,
      status: accuracy >= 95 ? 'completed' : 'in_progress',
      attempts: (existing?.attempts || 0) + 1,
      bestWpm: Math.max(existing?.bestWpm || 0, wpm),
      bestAccuracy: Math.max(existing?.bestAccuracy || 0, accuracy),
      completedAt: accuracy >= 95 ? now : existing?.completedAt,
    };

    progress.lessons.set(lessonId, updated);

    // Award XP
    const xpEarned = this.calculateXp(wpm, accuracy, updated.attempts);
    progress.totalXp += xpEarned;

    // Update level
    progress.currentLevel = this.calculateLevel(progress.totalXp);

    return progress;
  }

  /**
   * Update key mastery based on performance
   */
  updateKeyMastery(
    progress: UserProgress,
    keyStats: Map<string, { correct: number; total: number }>
  ): UserProgress {
    for (const [key, stats] of keyStats) {
      const currentMastery = progress.keyMastery.get(key) || 0;
      const newMastery = (stats.correct / stats.total) * 100;

      // Weighted average with existing mastery
      const weightedMastery = currentMastery * 0.7 + newMastery * 0.3;
      progress.keyMastery.set(key, Math.round(weightedMastery * 100) / 100);
    }

    return progress;
  }

  /**
   * Get overall progress statistics
   */
  getStats(progress: UserProgress): {
    lessonsCompleted: number;
    lessonsInProgress: number;
    averageWpm: number;
    averageAccuracy: number;
    weakestKeys: string[];
    strongestKeys: string[];
  } {
    let lessonsCompleted = 0;
    let lessonsInProgress = 0;
    let totalWpm = 0;
    let totalAccuracy = 0;
    let count = 0;

    for (const lesson of progress.lessons.values()) {
      if (lesson.status === 'completed') {
        lessonsCompleted++;
      } else if (lesson.status === 'in_progress') {
        lessonsInProgress++;
      }
      if (lesson.bestWpm > 0) {
        totalWpm += lesson.bestWpm;
        totalAccuracy += lesson.bestAccuracy;
        count++;
      }
    }

    // Sort keys by mastery
    const sortedKeys = Array.from(progress.keyMastery.entries()).sort((a, b) => a[1] - b[1]);

    return {
      lessonsCompleted,
      lessonsInProgress,
      averageWpm: count > 0 ? Math.round(totalWpm / count) : 0,
      averageAccuracy: count > 0 ? Math.round(totalAccuracy / count) : 0,
      weakestKeys: sortedKeys.slice(0, 5).map(([key]) => key),
      strongestKeys: sortedKeys.slice(-5).reverse().map(([key]) => key),
    };
  }

  /**
   * Calculate XP earned from a lesson
   */
  private calculateXp(wpm: number, accuracy: number, attempts: number): number {
    // Base XP
    let xp = 50;

    // WPM bonus (up to 50 extra)
    xp += Math.min(50, Math.floor(wpm / 2));

    // Accuracy bonus (up to 50 extra)
    xp += Math.floor(accuracy / 2);

    // First attempt bonus
    if (attempts === 1) {
      xp += 25;
    }

    return xp;
  }

  /**
   * Calculate level from total XP
   */
  private calculateLevel(totalXp: number): number {
    // Each level requires progressively more XP
    // Level 1: 0-100, Level 2: 101-250, Level 3: 251-450, etc.
    let level = 1;
    let xpThreshold = 100;
    let cumulativeXp = 0;

    while (totalXp >= cumulativeXp + xpThreshold) {
      cumulativeXp += xpThreshold;
      level++;
      xpThreshold = Math.floor(xpThreshold * 1.5);
    }

    return level;
  }
}
