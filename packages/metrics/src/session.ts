/**
 * Session Recorder
 * Orchestrates WPM calculation and accuracy tracking for a typing session
 */

import { WPMCalculator } from './wpm.js';
import { AccuracyCalculator } from './accuracy.js';
import type { MetricsConfig } from './types.js';

export interface SessionPayload {
  /** Session start timestamp */
  startTime: number;
  /** Session end timestamp */
  endTime: number;
  /** Duration in milliseconds */
  durationMs: number;
  /** Net WPM (accounting for errors) */
  netWPM: number;
  /** Gross WPM (all correct characters) */
  grossWPM: number;
  /** Overall accuracy percentage */
  accuracy: number;
  /** Total keystrokes */
  totalKeystrokes: number;
  /** Total errors */
  totalErrors: number;
  /** Per-key accuracy statistics */
  keyStats: Map<string, { total: number; errors: number; accuracy: number }>;
  /** Correction history: array of [originalCode, correctedCode] */
  corrections: Array<[string, string]>;
  /** Number of backspaces used */
  backspaceCount: number;
}

export interface KeystrokeEvent {
  /** KeyboardEvent.code */
  code: string;
  /** Whether the keystroke was correct */
  correct: boolean;
  /** Timestamp of the keystroke */
  timestamp: number;
}

export class SessionRecorder {
  private wpmCalculator: WPMCalculator;
  private accuracyCalculator: AccuracyCalculator;
  private startTime: number | null = null;
  private corrections: Array<[string, string]> = [];
  private backspaceCount: number = 0;

  constructor(config: Partial<MetricsConfig> = {}) {
    this.wpmCalculator = new WPMCalculator(config);
    this.accuracyCalculator = new AccuracyCalculator();
  }

  /**
   * Process a keystroke event
   * @param event - The keystroke event with code, correct flag, and timestamp
   */
  onKeystroke(event: KeystrokeEvent): void {
    if (this.startTime === null) {
      this.startTime = event.timestamp;
    }

    this.wpmCalculator.onKeystroke(event.code, event.correct, event.timestamp);
    this.accuracyCalculator.onKeystroke(event.code, event.correct);
  }

  /**
   * Record a backspace usage
   */
  onBackspace(): void {
    this.backspaceCount++;
  }

  /**
   * Record a correction (when user goes back and fixes an error)
   * @param originalCode - The KeyboardEvent.code of the originally mistyped key
   * @param correctedCode - The KeyboardEvent.code of the correction key pressed
   */
  onCorrection(originalCode: string, correctedCode: string): void {
    this.corrections.push([originalCode, correctedCode]);
  }

  /**
   * End the session and return the complete payload
   * @returns SessionPayload with all metrics
   */
  onSessionEnd(): SessionPayload {
    const endTime = Date.now();
    const wpm = this.wpmCalculator.getWPM();
    const accuracy = this.accuracyCalculator.getAccuracy();
    const keyStatsMap = this.accuracyCalculator.getAllKeyStats();

    // Convert key stats to include accuracy percentage
    const keyStatsWithAccuracy = new Map<string, { total: number; errors: number; accuracy: number }>();
    for (const [code, stats] of keyStatsMap) {
      const keyAccuracy = stats.total > 0 
        ? Math.round(((stats.total - stats.errors) / stats.total) * 10000) / 100 
        : 100;
      keyStatsWithAccuracy.set(code, {
        total: stats.total,
        errors: stats.errors,
        accuracy: keyAccuracy,
      });
    }

    return {
      startTime: this.startTime || endTime,
      endTime,
      durationMs: this.startTime ? endTime - this.startTime : 0,
      netWPM: wpm.netWPM,
      grossWPM: wpm.grossWPM,
      accuracy,
      totalKeystrokes: this.getTotalKeystrokes(),
      totalErrors: this.getTotalErrors(),
      keyStats: keyStatsWithAccuracy,
      corrections: [...this.corrections],
      backspaceCount: this.backspaceCount,
    };
  }

  /**
   * Get current WPM values (for real-time display)
   */
  getCurrentWPM(): { netWPM: number; grossWPM: number } {
    return this.wpmCalculator.getWPM();
  }

  /**
   * Get current accuracy (for real-time display)
   */
  getCurrentAccuracy(): number {
    return this.accuracyCalculator.getAccuracy();
  }

  /**
   * Get accuracy for a specific key
   */
  getKeyAccuracy(code: string): number | null {
    return this.accuracyCalculator.getKeyAccuracy(code);
  }

  /**
   * Get total keystrokes recorded
   */
  getTotalKeystrokes(): number {
    const stats = this.accuracyCalculator.getAllKeyStats();
    let total = 0;
    for (const s of stats.values()) {
      total += s.total;
    }
    return total;
  }

  /**
   * Get total errors recorded
   */
  getTotalErrors(): number {
    const stats = this.accuracyCalculator.getAllKeyStats();
    let errors = 0;
    for (const s of stats.values()) {
      errors += s.errors;
    }
    return errors;
  }

  /**
   * Reset the session recorder
   */
  reset(): void {
    this.wpmCalculator.reset();
    this.accuracyCalculator.reset();
    this.startTime = null;
    this.corrections = [];
    this.backspaceCount = 0;
  }
}
