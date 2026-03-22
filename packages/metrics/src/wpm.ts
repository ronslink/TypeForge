/**
 * WPM (Words Per Minute) Calculator
 * Real-time per-keystroke WPM calculation
 */

import type { MetricsConfig, KeystrokeEvent, WPMResult } from './types.js';
export type { WPMResult } from './types.js';

export class WPMCalculator {
  private config: MetricsConfig;
  private startTime: number | null = null;
  private correctChars: number = 0;
  private uncorrectedErrors: number = 0;

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = {
      wordLength: 5,
      burstWindowSeconds: 10,
      minKeystrokesForConsistency: 50,
      includeSpaces: true,
      ...config,
    };
  }

  /**
   * Process a keystroke and update WPM calculations
   * @param key - The KeyboardEvent.code of the key pressed
   * @param correct - Whether the keystroke was correct
   * @param timestamp - Unix timestamp in milliseconds
   */
  onKeystroke(_key: string, correct: boolean, timestamp: number): void {
    if (this.startTime === null) {
      this.startTime = timestamp;
    }

    if (correct) {
      this.correctChars++;
    } else {
      this.uncorrectedErrors++;
    }
  }

  /**
   * Get current WPM values
   * @returns Object with netWPM and grossWPM
   */
  getWPM(): { netWPM: number; grossWPM: number } {
    if (this.startTime === null) {
      return { netWPM: 0, grossWPM: 0 };
    }

    const elapsedMs = Date.now() - this.startTime;
    const elapsedMinutes = elapsedMs / 60000;

    if (elapsedMinutes === 0) {
      return { netWPM: 0, grossWPM: 0 };
    }

    // grossWPM = correctChars / 5 / minutesElapsed
    const grossWPM = this.correctChars / this.config.wordLength / elapsedMinutes;

    // netWPM = (correctChars - uncorrectedErrors) / 5 / minutesElapsed
    const netNumerator = Math.max(0, this.correctChars - this.uncorrectedErrors);
    const netWPM = netNumerator / this.config.wordLength / elapsedMinutes;

    return {
      netWPM: Math.round(netWPM * 10) / 10,
      grossWPM: Math.round(grossWPM * 10) / 10,
    };
  }

  /**
   * Reset the calculator state
   */
  reset(): void {
    this.startTime = null;
    this.correctChars = 0;
    this.uncorrectedErrors = 0;
  }

  /**
   * Calculate WPM from keystroke events (legacy batch method)
   */
  calculate(events: KeystrokeEvent[], durationMs: number): WPMResult {
    const totalChars = this.countCharacters(events);
    const durationMinutes = durationMs / 60000;

    // Standard WPM (correct characters only)
    const correctChars = events.filter((e) => e.correct).length;
    const wpm = correctChars / this.config.wordLength / durationMinutes;

    // Raw WPM (all characters including errors)
    const rawWpm = totalChars / this.config.wordLength / durationMinutes;

    // Burst WPM (best sustained speed in window)
    const burstWpm = this.calculateBurstWpm(events);

    return {
      wpm: Math.round(wpm * 10) / 10,
      rawWpm: Math.round(rawWpm * 10) / 10,
      burstWpm: Math.round(burstWpm * 10) / 10,
    };
  }

  /**
   * Calculate burst WPM (best sustained speed in a time window)
   */
  private calculateBurstWpm(events: KeystrokeEvent[]): number {
    if (events.length < 2) return 0;

    const windowMs = this.config.burstWindowSeconds * 1000;
    let maxWpm = 0;

    // Sliding window approach
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event) continue;
      const windowStart = event.timestamp;
      const windowEnd = windowStart + windowMs;

      // Count correct characters in window
      let correctInWindow = 0;
      for (let j = i; j < events.length; j++) {
        const windowEvent = events[j];
        if (windowEvent && windowEvent.timestamp <= windowEnd && windowEvent.correct) {
          correctInWindow++;
        }
      }

      const wpm = correctInWindow / this.config.wordLength / (this.config.burstWindowSeconds / 60);
      maxWpm = Math.max(maxWpm, wpm);
    }

    return maxWpm;
  }

  /**
   * Count characters based on config
   */
  private countCharacters(events: KeystrokeEvent[]): number {
    return events.filter((e) => {
      if (!this.config.includeSpaces && e.character === ' ') {
        return false;
      }
      return true;
    }).length;
  }
}
