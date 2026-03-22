/**
 * HesitationDetector — Flags keys where time-before-press exceeds 1.5× median
 *
 * Collects inter-keystroke intervals (flight times) during a session and
 * identifies keys that cause the user to pause significantly longer than
 * their personal median. These are fed back into the weakness model so
 * the curriculum can target hesitation keys specifically.
 *
 * Rules (per Agent 4 spec):
 * - No fetch() calls — pure computation
 * - Works with KeyboardEvent.code (physical key)
 * - All functions are pure and unit-testable with Vitest
 */

export interface HesitationRecord {
  /** KeyboardEvent.code of the key that caused a hesitation */
  keyCode: string;
  /** The actual flight time before this key was pressed (ms) */
  flightTime: number;
  /** The median flight time at the point this hesitation was detected */
  medianAtDetection: number;
  /** The ratio: flightTime / medianAtDetection */
  ratio: number;
  /** Timestamp of the keystroke */
  timestamp: number;
}

export interface HesitationSummary {
  /** Keys flagged as hesitation keys, sorted by frequency descending */
  hesitationKeys: Array<{
    keyCode: string;
    count: number;
    avgRatio: number;
    avgFlightTime: number;
  }>;
  /** Total number of hesitations detected */
  totalHesitations: number;
  /** Overall median flight time for the session (ms) */
  sessionMedian: number;
}

/**
 * Compute the median of an array of numbers
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const midVal1 = sorted[mid - 1];
    const midVal2 = sorted[mid];
    if (midVal1 !== undefined && midVal2 !== undefined) {
      return (midVal1 + midVal2) / 2;
    }
    return midVal1 ?? midVal2 ?? 0;
  }
  return sorted[mid] ?? 0;
}

export class HesitationDetector {
  /** Multiplier above median that defines a hesitation (default 1.5×) */
  private readonly threshold: number;
  /** Minimum number of keystrokes before hesitation detection starts */
  private readonly minSamples: number;

  /** All flight times recorded this session */
  private flightTimes: number[] = [];
  /** Per-key flight time records: keyCode → array of flight times */
  private keyFlightTimes: Map<string, number[]> = new Map();
  /** All hesitation records this session */
  private hesitations: HesitationRecord[] = [];
  /** Timestamp of the last keydown event */
  private lastKeydownAt: number | null = null;

  constructor(options: { threshold?: number; minSamples?: number } = {}) {
    this.threshold = options.threshold ?? 1.5;
    this.minSamples = options.minSamples ?? 10;
  }

  /**
   * Record a keydown event.
   * @param keyCode - KeyboardEvent.code of the key pressed
   * @param timestamp - Timestamp of the keydown event (default: Date.now())
   * @returns The HesitationRecord if this keystroke is a hesitation, null otherwise
   */
  onKeydown(keyCode: string, timestamp: number = Date.now()): HesitationRecord | null {
    let hesitation: HesitationRecord | null = null;

    if (this.lastKeydownAt !== null) {
      const flightTime = timestamp - this.lastKeydownAt;

      // Record flight time globally and per-key
      this.flightTimes.push(flightTime);
      if (!this.keyFlightTimes.has(keyCode)) {
        this.keyFlightTimes.set(keyCode, []);
      }
      this.keyFlightTimes.get(keyCode)!.push(flightTime);

      // Only start detecting once we have enough samples
      if (this.flightTimes.length >= this.minSamples) {
        const currentMedian = median(this.flightTimes);
        const ratio = currentMedian > 0 ? flightTime / currentMedian : 1;

        if (ratio >= this.threshold) {
          hesitation = {
            keyCode,
            flightTime,
            medianAtDetection: currentMedian,
            ratio,
            timestamp,
          };
          this.hesitations.push(hesitation);
        }
      }
    }

    this.lastKeydownAt = timestamp;
    return hesitation;
  }

  /**
   * Current session median flight time in milliseconds
   */
  get sessionMedian(): number {
    return median(this.flightTimes);
  }

  /**
   * All hesitation records collected so far
   */
  get allHesitations(): HesitationRecord[] {
    return [...this.hesitations];
  }

  /**
   * Summarise hesitation data for the completed session.
   * Returns per-key stats sorted by hesitation frequency.
   */
  getSummary(): HesitationSummary {
    const keyCounts = new Map<string, HesitationRecord[]>();

    for (const h of this.hesitations) {
      if (!keyCounts.has(h.keyCode)) {
        keyCounts.set(h.keyCode, []);
      }
      keyCounts.get(h.keyCode)!.push(h);
    }

    const hesitationKeys = Array.from(keyCounts.entries())
      .map(([keyCode, records]) => ({
        keyCode,
        count: records.length,
        avgRatio: records.reduce((s, r) => s + r.ratio, 0) / records.length,
        avgFlightTime: records.reduce((s, r) => s + r.flightTime, 0) / records.length,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      hesitationKeys,
      totalHesitations: this.hesitations.length,
      sessionMedian: this.sessionMedian,
    };
  }

  /**
   * Return the set of key codes flagged as hesitation keys this session.
   * Useful for feeding directly into the WeaknessModel.
   */
  getHesitationKeyCodes(): Set<string> {
    return new Set(this.hesitations.map((h) => h.keyCode));
  }

  reset(): void {
    this.flightTimes = [];
    this.keyFlightTimes = new Map();
    this.hesitations = [];
    this.lastKeydownAt = null;
  }
}
