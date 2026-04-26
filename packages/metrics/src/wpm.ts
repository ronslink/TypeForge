/**
 * WPM (Words Per Minute) Calculator
 * Real-time per-keystroke WPM calculation with pause detection.
 *
 * The clock only counts time where the user is actively typing.
 * Any inter-keystroke interval (IKI) exceeding PAUSE_THRESHOLD_MS is treated
 * as a pause — the gap is excluded from the active duration, producing a
 * fair WPM regardless of how long the student looks at their hands.
 */

import type { MetricsConfig, KeystrokeEvent, WPMResult } from './types.js';
export type { WPMResult } from './types.js';

export interface WPMConfig extends Partial<MetricsConfig> {
  /**
   * Inter-keystroke interval (ms) above which a gap is considered a pause
   * and excluded from the active typing duration. Default: 3000ms (3s).
   */
  pauseThresholdMs?: number;
}

export class WPMCalculator {
  private config: MetricsConfig & { pauseThresholdMs: number };

  private startTime: number | null = null;
  private lastKeystrokeTime: number | null = null;

  private correctChars: number = 0;
  private uncorrectedErrors: number = 0;

  /** Cumulative ms spent in pauses (IKI > threshold) */
  private _totalPausedMs: number = 0;
  /** Whether the calculator is currently in a paused state */
  private _isPaused: boolean = false;
  /** Total number of detected pauses */
  private _pauseCount: number = 0;

  constructor(config: WPMConfig = {}) {
    this.config = {
      wordLength: 5,
      burstWindowSeconds: 10,
      minKeystrokesForConsistency: 50,
      includeSpaces: true,
      pauseThresholdMs: 3000,
      ...config,
    };
  }

  // ── Public read-only properties ──────────────────────────────────────────

  /** True when the student has been idle longer than pauseThresholdMs */
  get isPaused(): boolean {
    if (!this.lastKeystrokeTime || this._isPaused) return this._isPaused;
    return Date.now() - this.lastKeystrokeTime > this.config.pauseThresholdMs;
  }

  /** Total milliseconds spent in detected pauses */
  get totalPausedMs(): number {
    return this._totalPausedMs;
  }

  /** Total number of pause events detected */
  get pauseCount(): number {
    return this._pauseCount;
  }

  /** Active typing duration in milliseconds (wall-clock minus pauses) */
  get activeDurationMs(): number {
    if (this.startTime === null) return 0;
    const wallMs = Date.now() - this.startTime;
    return Math.max(0, wallMs - this._totalPausedMs);
  }

  // ── Core API ─────────────────────────────────────────────────────────────

  /**
   * Process a keystroke and update WPM calculations.
   * @param key - KeyboardEvent.code of the key pressed
   * @param correct - Whether the keystroke was correct
   * @param timestamp - Unix timestamp in milliseconds (default: Date.now())
   */
  onKeystroke(_key: string, correct: boolean, timestamp: number = Date.now()): void {
    // First keystroke — start the clock
    if (this.startTime === null) {
      this.startTime = timestamp;
      this.lastKeystrokeTime = timestamp;
      this._isPaused = false;
    } else if (this.lastKeystrokeTime !== null) {
      const iki = timestamp - this.lastKeystrokeTime;

      if (iki > this.config.pauseThresholdMs) {
        // This gap counts as a pause — subtract the threshold (typing lag)
        // and add the remainder as paused time
        const pausedMs = iki - this.config.pauseThresholdMs;
        this._totalPausedMs += pausedMs;
        this._pauseCount++;
        this._isPaused = false; // we're now resuming
      }

      this.lastKeystrokeTime = timestamp;
      this._isPaused = false;
    }

    if (correct) {
      this.correctChars++;
    } else {
      this.uncorrectedErrors++;
    }
  }

  /**
   * Call on a regular tick (e.g. every 500ms) to update isPaused in real-time.
   * This is needed because `isPaused` depends on current time, not just
   * the last keystroke.
   */
  tick(now: number = Date.now()): void {
    if (this.lastKeystrokeTime === null) return;
    this._isPaused = (now - this.lastKeystrokeTime) > this.config.pauseThresholdMs;
  }

  /**
   * Get current WPM values based on active typing time only.
   */
  getWPM(): { netWPM: number; grossWPM: number } {
    if (this.startTime === null) {
      return { netWPM: 0, grossWPM: 0 };
    }

    const activeMs = this.activeDurationMs;
    const activeMinutes = activeMs / 60000;

    if (activeMinutes < 0.001) {
      return { netWPM: 0, grossWPM: 0 };
    }

    const grossWPM = this.correctChars / this.config.wordLength / activeMinutes;
    const netNumerator = Math.max(0, this.correctChars - this.uncorrectedErrors);
    const netWPM = netNumerator / this.config.wordLength / activeMinutes;

    return {
      netWPM: Math.round(netWPM * 10) / 10,
      grossWPM: Math.round(grossWPM * 10) / 10,
    };
  }

  /**
   * Reset all state.
   */
  reset(): void {
    this.startTime = null;
    this.lastKeystrokeTime = null;
    this.correctChars = 0;
    this.uncorrectedErrors = 0;
    this._totalPausedMs = 0;
    this._isPaused = false;
    this._pauseCount = 0;
  }

  // ── Legacy batch method (unchanged) ──────────────────────────────────────

  /**
   * Calculate WPM from keystroke events (legacy batch method).
   * Does not use pause detection — uses raw durationMs.
   */
  calculate(events: KeystrokeEvent[], durationMs: number): WPMResult {
    const totalChars = this.countCharacters(events);
    const durationMinutes = durationMs / 60000;

    const correctChars = events.filter((e) => e.correct).length;
    const wpm = correctChars / this.config.wordLength / durationMinutes;
    const rawWpm = totalChars / this.config.wordLength / durationMinutes;
    const burstWpm = this.calculateBurstWpm(events);

    return {
      wpm: Math.round(wpm * 10) / 10,
      rawWpm: Math.round(rawWpm * 10) / 10,
      burstWpm: Math.round(burstWpm * 10) / 10,
    };
  }

  private calculateBurstWpm(events: KeystrokeEvent[]): number {
    if (events.length < 2) return 0;

    const windowMs = this.config.burstWindowSeconds * 1000;
    let maxWpm = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (!event) continue;
      const windowStart = event.timestamp;
      const windowEnd = windowStart + windowMs;

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

  private countCharacters(events: KeystrokeEvent[]): number {
    return events.filter((e) => {
      if (!this.config.includeSpaces && e.character === ' ') return false;
      return true;
    }).length;
  }
}
