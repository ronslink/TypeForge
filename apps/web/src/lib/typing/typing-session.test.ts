import { describe, expect, it } from 'vitest';
import type { Layout } from '@typeforge/layouts';
import { layouts } from '@typeforge/layouts';
import { IMEHandler } from '@typeforge/metrics';
import {
  createTypingPrompt,
  initialTypingState,
  isPromptComplete,
  resolveTypingOutcome,
  scoreCommittedText,
  scoreKeystroke,
  scoreKeystrokeIfTyping,
  shouldScoreKeystroke,
  type TypingPromptSource,
} from './typing-session';

const qwerty = layouts['qwerty-us'] as unknown as Layout;
const devanagari = layouts['devanagari-phonetic'] as unknown as Layout;

const char = (value: string, code: string, finger: TypingPromptSource['expectedFinger'] = 'right_index'): TypingPromptSource => ({
  char: value,
  code,
  expectedFinger: finger,
});

describe('prompt construction', () => {
  it('resolves a curriculum character to the physical key on the active layout', () => {
    const prompt = createTypingPrompt([char('र', 'KeyR')], devanagari);
    expect(prompt).toEqual([{ grapheme: 'र', code: 'KeyR', finger: 'right_index' }]);
  });

  it('keeps a Devanagari conjunct as one scorable grapheme', () => {
    const prompt = createTypingPrompt([char('क्ष', 'KeyX')], devanagari);
    expect(prompt).toHaveLength(1);
    expect(prompt[0]?.grapheme).toBe('क्ष');
    expect(prompt[0]?.code).toBe('KeyX');
  });

  it('normalizes combining marks onto the base grapheme', () => {
    const prompt = createTypingPrompt([char('e\u0301', 'KeyE')], qwerty);
    expect(prompt).toHaveLength(1);
    expect(prompt[0]?.grapheme).toBe('é');
  });

  it('falls back to the curriculum code when the layout does not define the character', () => {
    // The Devanagari vowel sign ी is not a key on the layout, but the lesson
    // still assigns it to KeyI.
    const prompt = createTypingPrompt([char('ी', 'KeyI')], devanagari);
    expect(prompt[0]?.code).toBe('KeyI');
  });

  it('marks the layout the active one so the on-screen keyboard and scorer agree', () => {
    // On QWERTZ the physical KeyY prints z.
    const qwertz = layouts['qwertz-de'] as unknown as Layout;
    const prompt = createTypingPrompt([char('z', 'KeyZ')], qwertz);
    expect(prompt[0]?.code).toBe('KeyY');
  });
});

describe('physical keystroke scoring', () => {
  const prompt = createTypingPrompt([char('र', 'KeyR'), char('त', 'KeyT')], devanagari);

  it('accepts the expected physical key even when the OS layout prints something else', () => {
    const result = scoreKeystroke(initialTypingState(), { code: 'KeyR', key: 'r' }, prompt, devanagari);
    expect(result.state.currentIndex).toBe(1);
    expect(result.attempts).toEqual([
      { expectedIndex: 0, expected: 'र', produced: 'र', correct: true },
    ]);
  });

  it('records a miss without advancing the cursor', () => {
    const result = scoreKeystroke(initialTypingState(), { code: 'KeyG', key: 'g' }, prompt, devanagari);
    expect(result.state.currentIndex).toBe(0);
    expect(result.state.errors).toEqual(new Set([0]));
    expect(result.attempts[0]).toMatchObject({ expected: 'र', correct: false });
  });

  it('still accepts the produced character when the layout cannot name a key', () => {
    const emojiPrompt = createTypingPrompt([char('👩‍💻', 'Unknown')], qwerty);
    expect(emojiPrompt[0]?.code).toBeNull();
    const result = scoreKeystroke(initialTypingState(), { code: 'Unidentified', key: '👩‍💻' }, emojiPrompt, qwerty);
    expect(result.state.currentIndex).toBe(1);
  });

  it('reports completion as an accepted text-finished outcome', () => {
    const state = { currentIndex: 1, errors: new Set<number>() };
    const result = scoreKeystroke(state, { code: 'KeyT', key: 't' }, prompt, devanagari);
    expect(isPromptComplete(result.state, prompt)).toBe(true);
    expect(result.outcome).toMatchObject({ kind: 'text-finished', committedNfcGraphemeUnits: 2 });
  });

  it('ignores keystrokes past the end of the prompt', () => {
    const state = { currentIndex: 2, errors: new Set<number>() };
    const result = scoreKeystroke(state, { code: 'KeyT', key: 't' }, prompt, devanagari);
    expect(result.attempts).toHaveLength(0);
    expect(result.state).toBe(state);
  });
});

describe('non-typing keystrokes', () => {
  it.each([
    ['Shift', { code: 'ShiftLeft', key: 'Shift' }],
    ['Control', { code: 'ControlLeft', key: 'Control' }],
    ['Arrow', { code: 'ArrowLeft', key: 'ArrowLeft' }],
    ['Backspace', { code: 'Backspace', key: 'Backspace' }],
    ['Escape', { code: 'Escape', key: 'Escape' }],
    ['IME process key', { code: 'KeyR', key: 'Process' }],
    ['composition in progress', { code: 'KeyR', key: 'r', isComposing: true }],
    ['legacy IME keyCode', { code: 'KeyR', key: 'r', keyCode: 229 }],
  ])('does not score %s', (_label, keystroke) => {
    expect(shouldScoreKeystroke(keystroke)).toBe(false);
  });

  it('scores an ordinary character key', () => {
    expect(shouldScoreKeystroke({ code: 'KeyR', key: 'r' })).toBe(true);
  });

  it('guards the streak: a Shift press produces no attempt at all', () => {
    const prompt = createTypingPrompt([char('र', 'KeyR')], devanagari);
    const state = initialTypingState();
    const result = scoreKeystrokeIfTyping(state, { code: 'ShiftLeft', key: 'Shift' }, prompt, devanagari);
    expect(result).toBeNull();
    expect(state.currentIndex).toBe(0);
    expect(state.errors.size).toBe(0);
  });
});

describe('committed input-method text', () => {
  const prompt = createTypingPrompt([char('अ', 'KeyA'), char('ा', 'KeyA'), char('न', 'KeyN')], devanagari);

  it('scores a multi-grapheme commit in cursor order', () => {
    const result = scoreCommittedText(initialTypingState(), 'अान', prompt);
    expect(result.state.currentIndex).toBe(3);
    expect(result.attempts.map((attempt) => attempt.correct)).toEqual([true, true, true]);
    expect(result.outcome).toMatchObject({ kind: 'text-finished' });
  });

  it('stops at the first unmatched grapheme and records the miss', () => {
    const result = scoreCommittedText(initialTypingState(), 'अन', prompt);
    expect(result.state.currentIndex).toBe(1);
    expect(result.state.errors).toEqual(new Set([1]));
  });

  it('consumes a multi-code-point prompt unit as a whole', () => {
    const conjunct = createTypingPrompt([char('क्ष', 'KeyX')], devanagari);
    const result = scoreCommittedText(initialTypingState(), 'क्ष', conjunct);
    expect(result.state.currentIndex).toBe(1);
    expect(result.attempts).toEqual([
      { expectedIndex: 0, expected: 'क्ष', produced: 'क्ष', correct: true },
    ]);
  });

  it('scores a commit whose segmentation differs from the prompt units', () => {
    // ICU groups `अ` with its vowel sign into one cluster, but the drill's units
    // are the code points it was written with. Both must score the same.
    const units = createTypingPrompt([char('अ', 'KeyA'), char('ा', 'KeyA')], devanagari);
    expect(scoreCommittedText(initialTypingState(), 'अा', units).state.currentIndex).toBe(2);
  });

  it('scores committed text exactly once around a composition cycle', () => {
    const prompt = createTypingPrompt([char('한', 'KeyG')], qwerty);
    const commits: string[] = [];
    const controller = new IMEHandler();
    controller.onCommit(({ committed }) => commits.push(committed));

    controller.handleCompositionStart();
    controller.handleCompositionUpdate({ data: '하' });
    controller.handleCompositionEnd({ data: '한' });
    // Browsers re-emit the committed text as an input event; it must not score twice.
    controller.handleInput({ data: '한', value: '한', inputType: 'insertText' });

    expect(commits).toEqual(['한']);
    const result = scoreCommittedText(initialTypingState(), commits.join(''), prompt);
    expect(result.state.currentIndex).toBe(1);
    expect(result.attempts).toHaveLength(1);
  });

  it('never treats pre-edit text as committed', () => {
    const controller = new IMEHandler();
    const commits: string[] = [];
    controller.onCommit(({ committed }) => commits.push(committed));

    controller.handleCompositionStart();
    controller.handleCompositionUpdate({ data: 'ㅎ' });
    expect(commits).toEqual([]);
    expect(controller.isComposing).toBe(true);
    expect(controller.shouldSuppressKeystroke({ isComposing: true })).toBe(true);

    controller.handleCompositionCancel();
    expect(commits).toEqual([]);
    expect(controller.isComposing).toBe(false);
  });
});

describe('activity outcome transitions', () => {
  const prompt = createTypingPrompt([char('अ', 'KeyA'), char('न', 'KeyN')], devanagari);

  it('rejects text-finished before the prompt is exhausted', () => {
    const outcome = resolveTypingOutcome({ currentIndex: 1, errors: new Set() }, prompt, 'text-finished', true);
    expect(outcome).toEqual({ kind: 'running' });
  });

  it('rejects a user stop that arrives after the prompt was exhausted', () => {
    const outcome = resolveTypingOutcome({ currentIndex: 2, errors: new Set() }, prompt, 'user-stopped', true);
    expect(outcome.kind).toBe('running');
  });

  it('accepts a user stop mid-drill', () => {
    const outcome = resolveTypingOutcome({ currentIndex: 1, errors: new Set() }, prompt, 'user-stopped', true);
    expect(outcome).toEqual({
      kind: 'user-stopped',
      committedNfcGraphemeUnits: 1,
      totalNfcGraphemeUnits: 2,
    });
  });

  it('rejects any transition before the activity started', () => {
    const outcome = resolveTypingOutcome({ currentIndex: 1, errors: new Set() }, prompt, 'user-stopped', false);
    expect(outcome).toEqual({ kind: 'running' });
  });

  it('rejects an empty prompt', () => {
    const outcome = resolveTypingOutcome(initialTypingState(), [], 'text-finished', true);
    expect(outcome).toEqual({ kind: 'running' });
    expect(isPromptComplete(initialTypingState(), [])).toBe(false);
  });
});
