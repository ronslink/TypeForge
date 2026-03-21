/**
 * Accuracy Calculator
 * Real-time per-keystroke accuracy tracking with per-key error rates
 */

import type { AccuracyResult, KeystrokeEvent } from './types.js';

interface KeyStats {
  total: number;
  errors: number;
}

export class AccuracyCalculator {
  private keyStats: Map<string, KeyStats> = new Map();
  private totalKeystrokes: number = 0;
  private totalErrors: number = 0;

  /**
   * Process a keystroke and update accuracy tracking
   * Uses KeyboardEvent.code for key identification
   * @param code - The KeyboardEvent.code of the key pressed
   * @param correct - Whether the keystroke was correct
   */
  onKeystroke(code: string, correct: boolean): void {
    const stats = this.keyStats.get(code) || { total: 0, errors: 0 };
    stats.total++;
    if (!correct) {
      stats.errors++;
      this.totalErrors++;
    }
    this.keyStats.set(code, stats);
    this.totalKeystrokes++;
  }

  /**
   * Get overall accuracy percentage
   * @returns Accuracy as a percentage (0-100)
   */
  getAccuracy(): number {
    if (this.totalKeystrokes === 0) {
      return 100;
    }
    const correct = this.totalKeystrokes - this.totalErrors;
    return Math.round((correct / this.totalKeystrokes) * 10000) / 100;
  }

  /**
   * Get accuracy for a specific key
   * @param code - The KeyboardEvent.code of the key
   * @returns Accuracy as a percentage (0-100), or null if key not tracked
   */
  getKeyAccuracy(code: string): number | null {
    const stats = this.keyStats.get(code);
    if (!stats || stats.total === 0) {
      return null;
    }
    const correct = stats.total - stats.errors;
    return Math.round((correct / stats.total) * 10000) / 100;
  }

  /**
   * Get all per-key statistics
   * @returns Map of key codes to their stats
   */
  getAllKeyStats(): Map<string, KeyStats> {
    return new Map(this.keyStats);
  }

  /**
   * Reset the accuracy tracker
   */
  reset(): void {
    this.keyStats.clear();
    this.totalKeystrokes = 0;
    this.totalErrors = 0;
  }

  /**
   * Calculate accuracy from keystroke events (legacy batch method)
   */
  calculate(events: KeystrokeEvent[]): AccuracyResult {
    const totalCharacters = events.length;
    const correctCharacters = events.filter((e) => e.correct).length;
    const errors = totalCharacters - correctCharacters;

    const accuracy = totalCharacters > 0 ? (correctCharacters / totalCharacters) * 100 : 0;
    const errorRate = totalCharacters > 0 ? (errors / totalCharacters) * 100 : 0;

    return {
      accuracy: Math.round(accuracy * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      totalCharacters,
      correctCharacters,
      errors,
    };
  }

  /**
   * Calculate accuracy per character (legacy batch method)
   */
  calculatePerCharacter(
    events: KeystrokeEvent[]
  ): Map<string, { correct: number; total: number; accuracy: number }> {
    const charStats = new Map<string, { correct: number; total: number }>();

    for (const event of events) {
      const char = event.expected;
      const stats = charStats.get(char) || { correct: 0, total: 0 };
      stats.total++;
      if (event.correct) {
        stats.correct++;
      }
      charStats.set(char, stats);
    }

    const result = new Map<string, { correct: number; total: number; accuracy: number }>();
    for (const [char, stats] of charStats) {
      result.set(char, {
        ...stats,
        accuracy: Math.round((stats.correct / stats.total) * 10000) / 100,
      });
    }

    return result;
  }

  /**
   * Identify problem characters (below threshold) (legacy batch method)
   */
  identifyProblemCharacters(
    events: KeystrokeEvent[],
    threshold: number = 90
  ): Array<{ character: string; accuracy: number; occurrences: number }> {
    const perChar = this.calculatePerCharacter(events);
    const problems: Array<{ character: string; accuracy: number; occurrences: number }> = [];

    for (const [char, stats] of perChar) {
      if (stats.accuracy < threshold) {
        problems.push({
          character: char,
          accuracy: stats.accuracy,
          occurrences: stats.total,
        });
      }
    }

    return problems.sort((a, b) => a.accuracy - b.accuracy);
  }
}

// Export the new class name as AccuracyTracker for the new API
export { AccuracyCalculator as AccuracyTracker };
