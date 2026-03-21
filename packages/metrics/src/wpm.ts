/**
 * WPM (Words Per Minute) Calculator
 */

import type { MetricsConfig, WPMResult, KeystrokeEvent } from './types.js';

export class WPMCalculator {
  private config: MetricsConfig;

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
   * Calculate WPM from keystroke events
   */
  calculate(events: KeystrokeEvent[], durationMs: number): WPMResult {
    const totalChars = this.countCharacters(events);
    const durationMinutes = durationMs / 60000;

    // Standard WPM (correct characters only)
    const correctChars = events.filter((e) => e.correct).length;
    const wpm = (correctChars / this.config.wordLength) / durationMinutes;

    // Raw WPM (all characters including errors)
    const rawWpm = (totalChars / this.config.wordLength) / durationMinutes;

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
      const windowStart = events[i].timestamp;
      const windowEnd = windowStart + windowMs;

      // Count correct characters in window
      let correctInWindow = 0;
      for (let j = i; j < events.length && events[j].timestamp <= windowEnd; j++) {
        if (events[j].correct) {
          correctInWindow++;
        }
      }

      const wpm = (correctInWindow / this.config.wordLength) / (this.config.burstWindowSeconds / 60);
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
