/**
 * Shared typing-session kernel.
 *
 * Both the curriculum runner (`/learn/[lessonId]`) and the freeform sandbox
 * (`/practice`) score through this module, so a drill is judged the same way in
 * either place.
 *
 * Two facts drive the design:
 *
 * 1. A prompt is a sequence of **NFC grapheme clusters**, not UTF-16 code units.
 *    A Devanagari conjunct such as `क्ष` or a Hangul syllable is one thing to
 *    type and one thing to score, even though it is several code points.
 * 2. The curriculum assigns every unit a **physical key**. Correctness is
 *    therefore decided by `KeyboardEvent.code`, so a learner whose operating
 *    system is set to a different layout can still answer the drill the app is
 *    showing them. Comparing only the produced character fails exactly when the
 *    OS layout differs from the target language's layout.
 *
 * Text produced by an OS input method is scored separately, at commit time, by
 * `scoreCommittedText`. Nobody should convert a `keydown` into authoritative
 * text: see `@typeforge/metrics`' `IMEHandler` for the composition contract.
 */

import type { Layout } from '@typeforge/layouts';
import { findCharByCode, findCodeByChar } from '@typeforge/layouts';
import { normalizeText, type NormalizationPolicy } from '@typeforge/metrics';
import type { Finger } from '@typeforge/curriculum';
import {
  RUNNING_ACTIVITY_OUTCOME,
  transitionActivityOutcome,
  type ActivityEndReason,
  type ActivityOutcome,
} from './activity-outcome';

/** One scorable position in a prompt. */
export interface TypingPromptUnit {
  /** NFC grapheme cluster to display and to match committed text against. */
  readonly grapheme: string;
  /**
   * Physical key code the learner must press, resolved from the active layout
   * and falling back to the curriculum's own assignment, or `null` when the
   * prompt unit can only be produced by an input method.
   */
  readonly code: string | null;
  /** Curriculum finger assignment, used by the hand guide. */
  readonly finger: Finger;
}

export interface TypingState {
  /** Index of the next unscored prompt unit. */
  readonly currentIndex: number;
  /** Prompt positions that have been missed at least once. */
  readonly errors: ReadonlySet<number>;
}

export interface TypingAttempt {
  /** Prompt position this attempt was scored against. */
  readonly expectedIndex: number;
  readonly expected: string;
  /** What was produced, in the prompt's own script where the layout defines it. */
  readonly produced: string;
  readonly correct: boolean;
}

export interface TypingStepResult {
  readonly state: TypingState;
  /** Attempts produced by this single keystroke or commit, in cursor order. */
  readonly attempts: readonly TypingAttempt[];
  readonly outcome: ActivityOutcome;
}

/** A `keydown` reduced to the fields scoring actually needs. */
export interface TypingKeystroke {
  /** `KeyboardEvent.code` — the physical key. */
  readonly code: string;
  /** `KeyboardEvent.key`. */
  readonly key: string;
  /** `KeyboardEvent.isComposing`. */
  readonly isComposing?: boolean;
  /** Legacy `KeyboardEvent.keyCode`; `229` marks an IME-processed key. */
  readonly keyCode?: number;
}

export interface TypingPromptSource {
  readonly char: string;
  readonly code: string;
  readonly expectedFinger: Finger;
}

const MODIFIER_KEY_PATTERN = /^(Shift|Control|Alt|Meta|CapsLock|OS|Fn)/;
const NON_TYPING_KEYS = new Set([
  'Alt',
  'AltGraph',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Backspace',
  'CapsLock',
  'ContextMenu',
  'Control',
  'Dead',
  'Delete',
  'End',
  'Enter',
  'Escape',
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
  'Home',
  'Insert',
  'Meta',
  'PageDown',
  'PageUp',
  'Shift',
  'Tab',
  'Unidentified',
  'Process',
]);

/**
 * Build the scorable prompt from curriculum units and the layout the learner is
 * shown.
 *
 * One source unit becomes exactly one prompt unit: the unit boundaries are the
 * ones the curriculum chose, and re-segmenting them would move the cursor the
 * learner sees. Characters are NFC-normalized so a decomposed input and a
 * precomposed one are the same unit.
 */
export function createTypingPrompt(
  units: readonly TypingPromptSource[],
  layout: Layout | null,
): TypingPromptUnit[] {
  const prompt: TypingPromptUnit[] = [];

  for (const unit of units) {
    const grapheme = normalizeText(unit.char);
    if (grapheme.length === 0) continue;
    const curriculumCode =
      unit.code && unit.code !== 'Unknown' && unit.code.length > 0 ? unit.code : null;
    const layoutCode = layout ? findCodeByChar(layout, grapheme) : null;
    prompt.push({
      grapheme,
      code: layoutCode ?? curriculumCode,
      finger: unit.expectedFinger,
    });
  }

  return prompt;
}

export function initialTypingState(): TypingState {
  return { currentIndex: 0, errors: new Set<number>() };
}

/**
 * Whether a `keydown` should be scored at all. Modifiers, navigation keys and
 * keys consumed by an input method are ignored rather than counted as misses —
 * an accidental Shift press must not reset a streak.
 */
export function shouldScoreKeystroke(keystroke: TypingKeystroke): boolean {
  if (keystroke.isComposing === true) return false;
  if (keystroke.keyCode === 229) return false;
  if (keystroke.key === 'Process') return false;
  if (MODIFIER_KEY_PATTERN.test(keystroke.code)) return false;
  if (NON_TYPING_KEYS.has(keystroke.key)) return false;
  return true;
}

/**
 * Score one physical keystroke.
 *
 * A key is correct when it is the physical key the prompt points at. Pressing
 * the key the layout prints that character on is accepted as well, so an input
 * method or a native layout that produces the exact expected grapheme still
 * scores even if the app's own layout data is incomplete.
 */
export function scoreKeystroke(
  state: TypingState,
  keystroke: TypingKeystroke,
  prompt: readonly TypingPromptUnit[],
  layout: Layout | null = null,
): TypingStepResult {
  const expected = prompt[state.currentIndex];
  if (expected === undefined) {
    return { state, attempts: [], outcome: RUNNING_ACTIVITY_OUTCOME };
  }

  const produced = describeProduced(keystroke, expected, layout);
  const matchesCode = expected.code !== null && keystroke.code === expected.code;
  const matchesText =
    keystroke.key.length > 0 && normalizeText(keystroke.key) === expected.grapheme;
  const correct = matchesCode || matchesText;

  return step(state, prompt, [{ expectedIndex: state.currentIndex, expected: expected.grapheme, produced, correct }]);
}

/**
 * Score a keystroke only when it is a typing keystroke. Returns `null` for
 * modifiers, navigation keys and input-method-owned keys so callers cannot
 * accidentally score them.
 */
export function scoreKeystrokeIfTyping(
  state: TypingState,
  keystroke: TypingKeystroke,
  prompt: readonly TypingPromptUnit[],
  layout: Layout | null = null,
): TypingStepResult | null {
  if (!shouldScoreKeystroke(keystroke)) return null;
  return scoreKeystroke(state, keystroke, prompt, layout);
}

/**
 * Score text that an input method committed.
 *
 * The commit is consumed against the prompt as a prefix decomposition: the
 * cursor advances only when the text in hand starts with the expected unit, and
 * an unmatched chunk is recorded as a miss and skipped, exactly as the
 * keystroke path treats a wrong key. This keeps the two input paths identical
 * without depending on the commit and the prompt having been segmented the same
 * way.
 */
export function scoreCommittedText(
  state: TypingState,
  committedText: string,
  prompt: readonly TypingPromptUnit[],
  options: { normalization?: NormalizationPolicy } = {},
): TypingStepResult {
  const attempts: TypingAttempt[] = [];
  let text = normalizeText(committedText, options.normalization ?? 'NFC');
  let index = state.currentIndex;

  while (text.length > 0 && index < prompt.length) {
    const expected = prompt[index];
    if (expected === undefined) break;

    if (text.startsWith(expected.grapheme)) {
      attempts.push({
        expectedIndex: index,
        expected: expected.grapheme,
        produced: expected.grapheme,
        correct: true,
      });
      text = text.slice(expected.grapheme.length);
      index += 1;
      continue;
    }

    const [first = ''] = Array.from(text);
    attempts.push({
      expectedIndex: index,
      expected: expected.grapheme,
      produced: first,
      correct: false,
    });
    text = text.slice(first.length);
  }

  return step(state, prompt, attempts);
}

/**
 * The terminal transition for an activity. `text-finished` is only accepted once
 * every prompt unit has been committed, and `user-stopped` only before then, so
 * a drill cannot be recorded as finished or abandoned in the wrong state.
 */
export function resolveTypingOutcome(
  state: TypingState,
  prompt: readonly TypingPromptUnit[],
  reason: ActivityEndReason,
  started: boolean,
): ActivityOutcome {
  return transitionActivityOutcome(RUNNING_ACTIVITY_OUTCOME, {
    reason,
    started,
    committedNfcGraphemeUnits: Math.min(state.currentIndex, prompt.length),
    totalNfcGraphemeUnits: prompt.length,
  }).outcome;
}

export function isPromptComplete(
  state: TypingState,
  prompt: readonly TypingPromptUnit[],
): boolean {
  return prompt.length > 0 && state.currentIndex >= prompt.length;
}

/**
 * Describe a physical keystroke in the prompt's own script when the layout can
 * translate it. Recording the character the learner was told to press keeps
 * stored keystroke data comparable to `expected` regardless of the learner's
 * operating-system layout.
 */
function describeProduced(
  keystroke: TypingKeystroke,
  expected: TypingPromptUnit,
  layout: Layout | null,
): string {
  const fromLayout = layout ? findCharByCode(layout, keystroke.code) : null;
  if (fromLayout !== null) return fromLayout;
  if (keystroke.key.length > 0 && keystroke.key !== 'Process') return keystroke.key;
  return expected.grapheme;
}

function step(
  state: TypingState,
  prompt: readonly TypingPromptUnit[],
  attempts: readonly TypingAttempt[],
): TypingStepResult {
  let currentIndex = state.currentIndex;
  let errors: Set<number> | null = null;

  for (const attempt of attempts) {
    if (attempt.correct) {
      currentIndex = Math.max(currentIndex, attempt.expectedIndex + 1);
      continue;
    }
    errors ??= new Set(state.errors);
    errors.add(attempt.expectedIndex);
  }

  const nextState: TypingState = {
    currentIndex,
    errors: errors ?? state.errors,
  };

  return {
    state: nextState,
    attempts,
    outcome: isPromptComplete(nextState, prompt)
      ? resolveTypingOutcome(nextState, prompt, 'text-finished', true)
      : RUNNING_ACTIVITY_OUTCOME,
  };
}
