import { describe, expect, it } from 'vitest';
import {
  normalizeText,
  segmentGraphemes,
  segmentGraphemesFallback,
} from './grapheme.js';

describe('grapheme segmentation', () => {
  it.each([
    ['combining mark', 'e\u0301', ['é']],
    ['emoji ZWJ', '👩‍💻', ['👩‍💻']],
    ['Devanagari conjunct', 'क्ष', ['क्ष']],
    ['Thai combining mark', 'ก้', ['ก้']],
    ['Hangul Jamo', '한', ['한']],
  ])('segments %s as a single normalized unit', (_label, input, expected) => {
    expect(segmentGraphemes(input)).toEqual(expected);
  });

  it.each([
    ['e\u0301', ['e\u0301']],
    ['👩‍💻', ['👩‍💻']],
    ['क्ष', ['क्ष']],
    ['ก้', ['ก้']],
    ['한', ['한']],
  ])('keeps common clusters intact in the fallback: %s', (input, expected) => {
    expect(segmentGraphemesFallback(input)).toEqual(expected);
  });

  it('supports an explicit no-normalization policy', () => {
    expect(normalizeText('e\u0301', 'none')).toBe('e\u0301');
    expect(segmentGraphemes('e\u0301', { normalization: 'none' })).toEqual(['e\u0301']);
  });
});
