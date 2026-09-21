import {
  normalizeText,
  segmentGraphemes,
  type CommittedTextScoringOptions,
} from '@typeforge/metrics';
import { scoreCommittedText, type TypingPromptUnit } from './typing-session';

export interface StrictTypingAttempt {
  /** Prompt position in the expected text when this attempt was scored. */
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

export function initialStrictTypingState(): StrictTypingState {
  return { currentIndex: 0, errors: new Set<number>() };
}

/**
 * Strict mode advances only after a correct committed grapheme. A commit may
 * contain several graphemes (for example an IME phrase); each one is scored in
 * order against the cursor position produced by the preceding unit.
 *
 * The scoring itself lives in `scoreCommittedText`, which is the same routine
 * the lesson and practice runners use, so a commit cannot be judged one way in
 * a drill and another way here.
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
  const expectedGraphemes = segmentGraphemes(normalizeText(expectedText, normalization), {
    locale: options.locale,
    normalization: 'none',
  });
  const prompt: TypingPromptUnit[] = expectedGraphemes.map((grapheme) => ({
    grapheme,
    code: null,
    finger: 'left_thumb',
  }));

  const result = scoreCommittedText(
    { currentIndex: state.currentIndex, errors: state.errors },
    committedText,
    prompt,
    { normalization },
  );

  return {
    currentIndex: result.state.currentIndex,
    errors: result.state.errors,
    attempts: result.attempts.map((attempt) => ({
      expectedIndex: attempt.expectedIndex,
      expected: attempt.expected,
      committed: attempt.produced,
      correct: attempt.correct,
    })),
    expectedCount: prompt.length,
    complete: result.state.currentIndex >= prompt.length,
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
