/**
 * Accuracy Calculator
 */

import type { AccuracyResult, KeystrokeEvent } from './types.js';

export class AccuracyCalculator {
  /**
   * Calculate accuracy from keystroke events
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
   * Calculate accuracy per character
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
   * Identify problem characters (below threshold)
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
