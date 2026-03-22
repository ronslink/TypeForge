/**
 * @typeforge/metrics — WPM/Accuracy calculation engine
 * Works in both browser and server environments
 */

export { MetricsEngine } from './engine.js';
export { WPMCalculator, type WPMResult } from './wpm.js';
export { AccuracyCalculator, AccuracyTracker, type AccuracyResult } from './accuracy.js';
export { ConsistencyAnalyzer, type ConsistencyResult } from './consistency.js';
export { KeystrokeAnalyzer, type KeystrokeStats } from './keystroke.js';
export { SessionRecorder, type SessionPayload, type KeystrokeEvent as SessionKeystrokeEvent } from './session.js';
export type { SessionMetrics, MetricsConfig } from './types.js';

// Browser-only components (import only in browser context)
export { IMEHandler, type IMEState, type IMECommitEvent } from './ime.js';
export { RTLHandler, detectDirection, type TextDirection } from './rtl.js';
export { CharComparator, compareChar, charsEqual, toNFC, scoreString, graphemeClusters } from './comparator.js';
export { HesitationDetector, type HesitationRecord, type HesitationSummary } from './hesitation.js';
