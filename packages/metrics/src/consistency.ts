/**
 * Consistency Analyzer
 * Measures typing rhythm and consistency
 */

import type { ConsistencyResult, KeystrokeEvent, MetricsConfig } from './types.js';

export class ConsistencyAnalyzer {
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
   * Calculate consistency from keystroke events
   * Uses coefficient of variation of flight times
   */
  calculate(events: KeystrokeEvent[]): ConsistencyResult {
    const flightTimes = events
      .filter((e) => e.flightTime !== undefined && e.flightTime > 0)
      .map((e) => e.flightTime!);

    if (flightTimes.length < this.config.minKeystrokesForConsistency) {
      return {
        consistency: 0,
        variance: 0,
        standardDeviation: 0,
        samples: flightTimes,
      };
    }

    const mean = flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length;
    const variance =
      flightTimes.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / flightTimes.length;
    const stdDev = Math.sqrt(variance);

    // Coefficient of variation (lower = more consistent)
    const cv = mean > 0 ? stdDev / mean : 0;

    // Convert to percentage (100% = perfectly consistent, 0% = very inconsistent)
    // Using exponential decay: consistency = 100 * e^(-cv)
    const consistency = Math.round(100 * Math.exp(-cv) * 100) / 100;

    return {
      consistency: Math.min(100, Math.max(0, consistency)),
      variance: Math.round(variance * 100) / 100,
      standardDeviation: Math.round(stdDev * 100) / 100,
      samples: flightTimes,
    };
  }

  /**
   * Calculate rolling consistency over time windows
   */
  calculateRollingConsistency(
    events: KeystrokeEvent[],
    windowSize: number = 20
  ): Array<{ index: number; consistency: number }> {
    const results: Array<{ index: number; consistency: number }> = [];

    for (let i = windowSize; i <= events.length; i++) {
      const window = events.slice(i - windowSize, i);
      const result = this.calculate(window);
      results.push({
        index: i,
        consistency: result.consistency,
      });
    }

    return results;
  }
}
