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

// Grapheme segmentation and committed-text scoring primitives.
export {
  GRAPHEME_SEGMENTATION_VERSION,
  TEXT_NORMALIZATION_VERSION,
  normalizeText,
  segmentGraphemes,
  segmentGraphemesFallback,
  type GraphemeSegmentOptions,
  type NormalizationPolicy,
} from './grapheme.js';
export {
  COMMITTED_TEXT_SCORING_VERSION,
  scoreCommittedText,
  type CommittedTextScore,
  type CommittedTextScoringOptions,
  type CommittedTextUnitScore,
  type CommittedTextUnitStatus,
} from './committed-text.js';

// Browser-only components (import only in browser context)
export {
  COMPOSITION_INPUT_VERSION,
  IMEHandler,
  type IMEState,
  type IMECommitEvent,
  type NativeInputCommit,
  type KeyboardCompositionState,
} from './ime.js';
export { RTLHandler, detectDirection, type TextDirection } from './rtl.js';
export { CharComparator, compareChar, charsEqual, toNFC, scoreString, graphemeClusters } from './comparator.js';
export { HesitationDetector, type HesitationRecord, type HesitationSummary } from './hesitation.js';
