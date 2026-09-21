import { describe, expect, it, vi } from 'vitest';
import { IMEHandler } from '@typeforge/metrics';
import { applyStrictCommittedText, getStrictInputDecision } from './strict-typing';

const emptyState = () => ({ currentIndex: 0, errors: new Set<number>() });

describe('strict committed-text typing', () => {
  it('normalizes combining marks before scoring', () => {
    const result = applyStrictCommittedText(emptyState(), 'e\u0301', 'é', { locale: 'fr' });
    expect(result.currentIndex).toBe(1);
    expect(result.attempts).toEqual([
      expect.objectContaining({ expected: 'é', committed: 'é', correct: true }),
    ]);
  });

  it.each([
    ['emoji ZWJ', '👩🏽‍💻'],
    ['Devanagari conjunct', 'क्ष'],
    ['Thai base and mark', 'ก้'],
    ['Hangul jamo sequence', '한'],
  ])('keeps %s as one scored grapheme', (_label, grapheme) => {
    const result = applyStrictCommittedText(emptyState(), grapheme, grapheme);
    expect(result.attempts).toHaveLength(1);
    expect(result.currentIndex).toBe(1);
    expect(result.complete).toBe(true);
  });

  it('processes a multi-grapheme commit in strict cursor order', () => {
    const result = applyStrictCommittedText(emptyState(), 'axb', 'abc');
    expect(result.attempts.map(({ expected, committed, correct }) => ({ expected, committed, correct })))
      .toEqual([
        { expected: 'a', committed: 'a', correct: true },
        { expected: 'b', committed: 'x', correct: false },
        { expected: 'b', committed: 'b', correct: true },
      ]);
    expect(result.currentIndex).toBe(2);
    expect(result.errors).toEqual(new Set([1]));
  });

  it('suppresses the input echo after compositionend before scoring', () => {
    const commits: string[] = [];
    const controller = new IMEHandler();
    controller.onCommit(({ committed }) => commits.push(committed));

    controller.handleCompositionStart();
    controller.handleCompositionUpdate({ data: '한' });
    controller.handleCompositionEnd({ data: '한' });
    controller.handleInput({ data: '한', value: '한', inputType: 'insertText' });

    expect(commits).toEqual(['한']);
    const result = applyStrictCommittedText(emptyState(), commits.join(''), '한');
    expect(result.currentIndex).toBe(1);
    expect(result.attempts).toHaveLength(1);
  });

  it('blocks backspace/delete without reading or scoring text', () => {
    expect(getStrictInputDecision('deleteContentBackward')).toMatchObject({
      allow: false,
      reason: 'delete',
    });
    expect(getStrictInputDecision('deleteContentForward')).toMatchObject({
      allow: false,
      reason: 'delete',
    });
    expect(getStrictInputDecision('insertText')).toEqual({ allow: true });
  });

  it('blocks paste before clipboard plaintext is consumed', () => {
    const clipboardRead = vi.fn();
    const decision = getStrictInputDecision('insertFromPaste');
    expect(decision).toMatchObject({ allow: false, reason: 'paste' });
    expect(clipboardRead).not.toHaveBeenCalled();
  });
});
