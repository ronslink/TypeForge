/**
 * Keystroke Analyzer
 * Analyzes timing patterns in keystrokes
 */

import type { KeystrokeEvent, KeystrokeStats } from './types.js';

export class KeystrokeAnalyzer {
  /**
   * Calculate keystroke statistics
   */
  calculate(events: KeystrokeEvent[]): KeystrokeStats {
    const dwellTimes = events.filter((e) => e.dwellTime !== undefined).map((e) => e.dwellTime!);
    const flightTimes = events.filter((e) => e.flightTime !== undefined).map((e) => e.flightTime!);

    const avgDwellTime = this.average(dwellTimes);
    const avgFlightTime = this.average(flightTimes);
    const dwellTimeVariance = this.variance(dwellTimes, avgDwellTime);
    const flightTimeVariance = this.variance(flightTimes, avgFlightTime);

    return {
      avgDwellTime: Math.round(avgDwellTime * 100) / 100,
      avgFlightTime: Math.round(avgFlightTime * 100) / 100,
      dwellTimeVariance: Math.round(dwellTimeVariance * 100) / 100,
      flightTimeVariance: Math.round(flightTimeVariance * 100) / 100,
      totalKeystrokes: events.length,
      correctKeystrokes: events.filter((e) => e.correct).length,
    };
  }

  /**
   * Analyze keystroke patterns by finger
   */
  analyzeByFinger(
    events: KeystrokeEvent[],
    fingerMap: Map<string, string>
  ): Map<string, KeystrokeStats> {
    const fingerEvents = new Map<string, KeystrokeEvent[]>();

    for (const event of events) {
      const finger = fingerMap.get(event.expected) || 'unknown';
      const existing = fingerEvents.get(finger) || [];
      existing.push(event);
      fingerEvents.set(finger, existing);
    }

    const results = new Map<string, KeystrokeStats>();
    for (const [finger, events] of fingerEvents) {
      results.set(finger, this.calculate(events));
    }

    return results;
  }

  /**
   * Detect micro-stutters (unusually long pauses)
   */
  detectStutters(
    events: KeystrokeEvent[],
    thresholdMs: number = 500
  ): Array<{ index: number; duration: number }> {
    const stutters: Array<{ index: number; duration: number }> = [];

    for (let i = 0; i < events.length; i++) {
      if (events[i].flightTime && events[i].flightTime! > thresholdMs) {
        stutters.push({
          index: i,
          duration: events[i].flightTime!,
        });
      }
    }

    return stutters;
  }

  /**
   * Calculate average
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Calculate variance
   */
  private variance(values: number[], mean: number): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  }
}
