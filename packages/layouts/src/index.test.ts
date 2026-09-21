import { describe, expect, it } from 'vitest';
import { findCodeByChar, findKeyByChar, getAllKeys, layouts } from './index.js';
import type { Layout } from './types.js';

const qwerty = layouts['qwerty-us'] as unknown as Layout;
const devanagari = layouts['devanagari-phonetic'] as unknown as Layout;
const dubeolsik = layouts['dubeolsik'] as unknown as Layout;

describe('layout key lookup', () => {
  it('flattens every row into a single key list', () => {
    const keys = getAllKeys(qwerty);
    expect(keys.length).toBeGreaterThan(40);
    expect(keys).toContainEqual(expect.objectContaining({ code: 'KeyA', char: 'a' }));
  });

  it('resolves an unshifted character to its physical key', () => {
    expect(findCodeByChar(qwerty, 'a')).toBe('KeyA');
    expect(findKeyByChar(qwerty, 'a')).toMatchObject({ char: 'a', code: 'KeyA' });
  });

  it('resolves a shifted character to the same physical key', () => {
    expect(findCodeByChar(qwerty, '?')).toBe('Slash');
  });

  it('resolves a non-Latin character through the target-language layout', () => {
    // र is the Devanagari letter the curriculum maps to KeyR; a learner on any
    // OS layout presses that physical key.
    expect(findCodeByChar(devanagari, 'र')).toBe('KeyR');
    expect(findCodeByChar(devanagari, 'क्ष')).toBe('KeyX');
    expect(findCodeByChar(dubeolsik, 'ㅏ')).toBe('KeyK');
  });

  it('returns null rather than inventing a key for characters the layout lacks', () => {
    expect(findKeyByChar(qwerty, 'र')).toBeUndefined();
    expect(findCodeByChar(qwerty, 'र')).toBeNull();
    expect(findCodeByChar(qwerty, '')).toBeNull();
  });

  it('agrees with the curriculum key map for every Devanagari lesson character', () => {
    // Guard against the layout and the lessons drifting apart: if they disagree,
    // the on-screen keyboard points at a different key than the scorer accepts.
    const curriculumCodes: Record<string, string> = {
      र: 'KeyR',
      त: 'KeyT',
      य: 'KeyY',
      स: 'KeyS',
      द: 'KeyD',
      फ: 'KeyF',
      ग: 'KeyG',
      ह: 'KeyH',
      ज: 'KeyJ',
      क: 'KeyK',
      ल: 'KeyL',
      व: 'KeyV',
      ब: 'KeyB',
      न: 'KeyN',
      म: 'KeyM',
    };
    for (const [char, code] of Object.entries(curriculumCodes)) {
      expect(findCodeByChar(devanagari, char)).toBe(code);
    }
  });
});
