/**
 * Metrics types and interfaces
 */

export interface MetricsConfig {
  /** Standard word length for WPM calculation (default: 5) */
  wordLength: number;
  /** Time window for burst WPM calculation in seconds (default: 10) */
  burstWindowSeconds: number;
  /** Minimum keystrokes for consistency calculation (default: 50) */
  minKeystrokesForConsistency: number;
  /** Whether to include spaces in character count */
  includeSpaces: boolean;
}

export interface SessionMetrics {
  /** Words per minute */
  wpm: number;
  /** Raw WPM (including errors) */
  rawWpm: number;
  /** Accuracy percentage (0-100) */
  accuracy: number;
  /** Consistency percentage (0-100) */
  consistency: number;
  /** Burst WPM (best sustained speed) */
  burstWpm: number;
  /** Total characters typed */
  totalCharacters: number;
  /** Correct characters */
  correctCharacters: number;
  /** Error count */
  errors: number;
  /** Session duration in seconds */
  durationSeconds: number;
  /** Timestamp */
  timestamp: Date;
}

export interface KeystrokeEvent {
  /** Character typed */
  character: string;
  /** Expected character */
  expected: string;
  /** Whether the keystroke was correct */
  correct: boolean;
  /** Timestamp of keydown */
  timestamp: number;
  /** Time key was held down (ms) */
  dwellTime?: number;
  /** Time since previous keyup (ms) */
  flightTime?: number;
}

export interface WPMResult {
  wpm: number;
  rawWpm: number;
  burstWpm: number;
}

export interface AccuracyResult {
  accuracy: number;
  errorRate: number;
  totalCharacters: number;
  correctCharacters: number;
  errors: number;
}

export interface ConsistencyResult {
  consistency: number;
  variance: number;
  standardDeviation: number;
  samples: number[];
}

export interface KeystrokeStats {
  avgDwellTime: number;
  avgFlightTime: number;
  dwellTimeVariance: number;
  flightTimeVariance: number;
  totalKeystrokes: number;
  correctKeystrokes: number;
}
