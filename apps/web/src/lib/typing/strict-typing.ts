import {
  normalizeText,
  scoreCommittedText,
  segmentGraphemes,
  type CommittedTextScoringOptions,
} from '@typeforge/metrics';

export interface StrictTypingAttempt {
  /** Grapheme-cluster position in the prompt when this attempt was scored. */
  expectedIndex: number;
  expected: string | null;
  committed: string;
  correct: boolean;
}

export interface StrictTypingState {
  currentIndex: number;
  errors: ReadonlySet<number>;
}

export interface StrictTypingCommitResult extends StrictTypingState {
  attempts: StrictTypingAttempt[];
  expectedCount: number;
  complete: boolean;
}

export type StrictInputBlockReason = 'delete' | 'paste' | 'drop' | 'history';

export interface StrictInputDecision {
  allow: boolean;
  reason?: StrictInputBlockReason;
  announcement?: string;
}

/**
 * Strict mode advances only after a correct committed grapheme. A commit may
 * contain several graphemes (for example an IME phrase); each one is scored in
 * order against the cursor position produced by the preceding unit.
 *
 * This function is deliberately pure. Raw committed text remains in the
 * caller's in-memory session state and is never a transport payload.
 */
export function applyStrictCommittedText(
  state: StrictTypingState,
  committedText: string,
  expectedText: string,
  options: CommittedTextScoringOptions = {},
): StrictTypingCommitResult {
  const normalization = options.normalization ?? 'NFC';
  const normalizedExpected = normalizeText(expectedText, normalization);
  const normalizedCommitted = normalizeText(committedText, normalization);
  const expectedGraphemes = segmentGraphemes(normalizedExpected, {
    locale: options.locale,
    normalization: 'none',
  });
  const committedGraphemes = segmentGraphemes(normalizedCommitted, {
    locale: options.locale,
    normalization: 'none',
  });

  let currentIndex = Math.max(0, Math.min(state.currentIndex, expectedGraphemes.length));
  const errors = new Set(state.errors);
  const attempts: StrictTypingAttempt[] = [];

  for (const committed of committedGraphemes) {
    const expected = expectedGraphemes[currentIndex] ?? null;
    const unitScore = scoreCommittedText(committed, expected ?? '', {
      ...options,
      normalization: 'none',
    });
    const correct = expected !== null && unitScore.isExact;

    attempts.push({ expectedIndex: currentIndex, expected, committed, correct });

    if (correct) {
      currentIndex += 1;
    } else if (expected !== null) {
      errors.add(currentIndex);
    }
  }

  return {
    currentIndex,
    errors,
    attempts,
    expectedCount: expectedGraphemes.length,
    complete: currentIndex >= expectedGraphemes.length,
  };
}

/**
 * Native text insertion and IME composition are allowed. Strict mode blocks
 * destructive editing because an incorrect attempt never advances the cursor,
 * and it blocks bulk insertion because paste/drop would invalidate a typing
 * measurement. No clipboard or deleted plaintext is inspected.
 */
export function getStrictInputDecision(inputType: string): StrictInputDecision {
  if (inputType.startsWith('delete')) {
    return {
      allow: false,
      reason: 'delete',
      announcement: 'Backspace and delete are disabled in strict typing mode.',
    };
  }

  if (inputType === 'insertFromPaste' || inputType === 'insertFromPasteAsQuotation') {
    return {
      allow: false,
      reason: 'paste',
      announcement: 'Pasting is disabled in strict typing mode.',
    };
  }

  if (inputType === 'insertFromDrop') {
    return {
      allow: false,
      reason: 'drop',
      announcement: 'Dropping text is disabled in strict typing mode.',
    };
  }

  if (inputType === 'historyUndo' || inputType === 'historyRedo') {
    return {
      allow: false,
      reason: 'history',
      announcement: 'Undo and redo are disabled in strict typing mode.',
    };
  }

  return { allow: true };
}

