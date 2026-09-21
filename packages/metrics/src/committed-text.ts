import {
  GRAPHEME_SEGMENTATION_VERSION,
  TEXT_NORMALIZATION_VERSION,
  normalizeText,
  segmentGraphemes,
  type NormalizationPolicy,
} from './grapheme.js';

export const COMMITTED_TEXT_SCORING_VERSION = 'committed-text-v1' as const;

export interface CommittedTextScoringOptions {
  normalization?: NormalizationPolicy;
  locale?: string;
  caseInsensitive?: boolean;
}

export type CommittedTextUnitStatus = 'correct' | 'incorrect' | 'missing' | 'extra';

export interface CommittedTextUnitScore {
  index: number;
  expected: string | null;
  committed: string | null;
  status: CommittedTextUnitStatus;
}

export interface CommittedTextScore {
  scoringVersion: typeof COMMITTED_TEXT_SCORING_VERSION;
  segmentationVersion: typeof GRAPHEME_SEGMENTATION_VERSION;
  normalizationVersion: typeof TEXT_NORMALIZATION_VERSION;
  normalization: NormalizationPolicy;
  expectedText: string;
  committedText: string;
  units: CommittedTextUnitScore[];
  expectedCount: number;
  committedCount: number;
  correctCount: number;
  incorrectCount: number;
  missingCount: number;
  extraCount: number;
  isExact: boolean;
}

function comparableValue(value: string, options: CommittedTextScoringOptions): string {
  return options.caseInsensitive
    ? value.toLocaleLowerCase(options.locale)
    : value;
}

/**
 * Score committed text by extended grapheme cluster. IME pre-edit text must not
 * be passed to this function; use `IMEHandler` to emit committed chunks only.
 */
export function scoreCommittedText(
  committedText: string,
  expectedText: string,
  options: CommittedTextScoringOptions = {},
): CommittedTextScore {
  const normalization = options.normalization ?? 'NFC';
  const normalizedCommitted = normalizeText(committedText, normalization);
  const normalizedExpected = normalizeText(expectedText, normalization);
  const committed = segmentGraphemes(normalizedCommitted, {
    normalization: 'none',
    locale: options.locale,
  });
  const expected = segmentGraphemes(normalizedExpected, {
    normalization: 'none',
    locale: options.locale,
  });
  const unitCount = Math.max(committed.length, expected.length);
  const units: CommittedTextUnitScore[] = [];

  for (let index = 0; index < unitCount; index += 1) {
    const expectedUnit = expected[index] ?? null;
    const committedUnit = committed[index] ?? null;
    let status: CommittedTextUnitStatus;

    if (expectedUnit === null) {
      status = 'extra';
    } else if (committedUnit === null) {
      status = 'missing';
    } else if (
      comparableValue(committedUnit, options) === comparableValue(expectedUnit, options)
    ) {
      status = 'correct';
    } else {
      status = 'incorrect';
    }

    units.push({ index, expected: expectedUnit, committed: committedUnit, status });
  }

  const count = (status: CommittedTextUnitStatus): number =>
    units.filter((unit) => unit.status === status).length;
  const correctCount = count('correct');
  const incorrectCount = count('incorrect');
  const missingCount = count('missing');
  const extraCount = count('extra');

  return {
    scoringVersion: COMMITTED_TEXT_SCORING_VERSION,
    segmentationVersion: GRAPHEME_SEGMENTATION_VERSION,
    normalizationVersion: TEXT_NORMALIZATION_VERSION,
    normalization,
    expectedText: normalizedExpected,
    committedText: normalizedCommitted,
    units,
    expectedCount: expected.length,
    committedCount: committed.length,
    correctCount,
    incorrectCount,
    missingCount,
    extraCount,
    isExact:
      correctCount === expected.length &&
      committed.length === expected.length &&
      incorrectCount === 0,
  };
}
