import { describe, expect, it } from 'vitest';

import { getTabDestinationIndex } from './focus-trap';

describe('getTabDestinationIndex', () => {
  it('moves forward and backward within the focus order', () => {
    expect(getTabDestinationIndex(1, 3, false)).toBe(2);
    expect(getTabDestinationIndex(1, 3, true)).toBe(0);
  });

  it('wraps at both boundaries', () => {
    expect(getTabDestinationIndex(2, 3, false)).toBe(0);
    expect(getTabDestinationIndex(0, 3, true)).toBe(2);
  });

  it('directs focus entering from outside to the correct edge', () => {
    expect(getTabDestinationIndex(-1, 3, false)).toBe(0);
    expect(getTabDestinationIndex(-1, 3, true)).toBe(2);
  });

  it('reports that an empty trap has no destination', () => {
    expect(getTabDestinationIndex(-1, 0, false)).toBe(-1);
  });
});
