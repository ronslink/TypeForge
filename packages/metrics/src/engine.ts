/**
 * Main Metrics Engine
 * Combines all calculators for comprehensive session analysis
 */

import { WPMCalculator } from './wpm.js';
import { AccuracyCalculator } from './accuracy.js';
import { ConsistencyAnalyzer } from './consistency.js';
import { KeystrokeAnalyzer } from './keystroke.js';
import type { MetricsConfig, SessionMetrics, KeystrokeEvent } from './types.js';

export class MetricsEngine {
  private wpmCalculator: WPMCalculator;
  private accuracyCalculator: AccuracyCalculator;
  private consistencyAnalyzer: ConsistencyAnalyzer;
  private keystrokeAnalyzer: KeystrokeAnalyzer;

  constructor(config: Partial<MetricsConfig> = {}) {
    this.wpmCalculator = new WPMCalculator(config);
    this.accuracyCalculator = new AccuracyCalculator();
    this.consistencyAnalyzer = new ConsistencyAnalyzer(config);
    this.keystrokeAnalyzer = new KeystrokeAnalyzer();
  }

  /**
   * Calculate all metrics for a typing session
   */
  calculateSession(events: KeystrokeEvent[], durationMs: number): SessionMetrics {
    const wpm = this.wpmCalculator.calculate(events, durationMs);
    const accuracy = this.accuracyCalculator.calculate(events);
    const consistency = this.consistencyAnalyzer.calculate(events);

    return {
      wpm: wpm.wpm,
      rawWpm: wpm.rawWpm,
      burstWpm: wpm.burstWpm,
      accuracy: accuracy.accuracy,
      consistency: consistency.consistency,
      totalCharacters: accuracy.totalCharacters,
      correctCharacters: accuracy.correctCharacters,
      errors: accuracy.errors,
      durationSeconds: Math.round(durationMs / 1000),
      timestamp: new Date(),
    };
  }

  /**
   * Get detailed keystroke analysis
   */
  analyzeKeystrokes(events: KeystrokeEvent[]) {
    return {
      stats: this.keystrokeAnalyzer.calculate(events),
      problemCharacters: this.accuracyCalculator.identifyProblemCharacters(events),
      stutters: this.keystrokeAnalyzer.detectStutters(events),
    };
  }

  /**
   * Calculate real-time metrics (for live display)
   */
  calculateRealtime(events: KeystrokeEvent[], startTime: number): Partial<SessionMetrics> {
    const durationMs = Date.now() - startTime;
    const wpm = this.wpmCalculator.calculate(events, durationMs);
    const accuracy = this.accuracyCalculator.calculate(events);

    return {
      wpm: wpm.wpm,
      rawWpm: wpm.rawWpm,
      accuracy: accuracy.accuracy,
      totalCharacters: accuracy.totalCharacters,
      errors: accuracy.errors,
      durationSeconds: Math.round(durationMs / 1000),
    };
  }
}
