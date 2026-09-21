import { describe, expect, it } from 'vitest';
import {
  COMMITTED_TEXT_SCORING_VERSION,
  scoreCommittedText,
} from './committed-text.js';

describe('committed-text scoring', () => {
  it('scores canonically equivalent committed text by grapheme', () => {
    const result = scoreCommittedText('e\u0301👩‍💻क्षก้한', 'é👩‍💻क्षก้한');

    expect(result.scoringVersion).toBe(COMMITTED_TEXT_SCORING_VERSION);
    expect(result.expectedCount).toBe(5);
    expect(result.committedCount).toBe(5);
    expect(result.correctCount).toBe(5);
    expect(result.isExact).toBe(true);
  });

  it('reports incorrect, missing, and extra units without hiding them', () => {
    expect(scoreCommittedText('ax', 'ab').units.map((unit) => unit.status)).toEqual([
      'correct',
      'incorrect',
    ]);
    expect(scoreCommittedText('a', 'ab').units.map((unit) => unit.status)).toEqual([
      'correct',
      'missing',
    ]);
    expect(scoreCommittedText('abc', 'ab').units.map((unit) => unit.status)).toEqual([
      'correct',
      'correct',
      'extra',
    ]);
  });

  it('can deliberately disable canonical normalization', () => {
    const result = scoreCommittedText('e\u0301', 'é', { normalization: 'none' });

    expect(result.normalization).toBe('none');
    expect(result.isExact).toBe(false);
  });
});
