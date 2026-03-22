/**
 * CharComparator — Unicode-normalised character comparison
 *
 * All comparisons use NFC normalisation so that visually identical
 * characters (e.g. é as U+00E9 vs e + combining acute) are treated
 * as equal. This is required for correct scoring of accented characters
 * in French, Spanish, Arabic, and other languages.
 *
 * Rules (per Agent 4 spec):
 * - No fetch() calls — pure computation
 * - String.prototype.normalize('NFC') on every comparison
 */

/**
 * Normalise a string to NFC form
 */
export function toNFC(str: string): string {
  return str.normalize('NFC');
}

/**
 * Compare two characters (or short strings) after NFC normalisation.
 * Returns true if they are canonically equivalent.
 */
export function charsEqual(a: string, b: string): boolean {
  return toNFC(a) === toNFC(b);
}

/**
 * Compare a typed character against the expected character.
 * Case-sensitive by default; pass { caseInsensitive: true } to relax.
 */
export function compareChar(
  typed: string,
  expected: string,
  options: { caseInsensitive?: boolean } = {}
): boolean {
  const t = toNFC(typed);
  const e = toNFC(expected);
  if (options.caseInsensitive) {
    return t.toLowerCase() === e.toLowerCase();
  }
  return t === e;
}

/**
 * Score a typed string against an expected string character by character.
 * Returns an array of booleans — one per expected character.
 *
 * Handles the case where typed.length !== expected.length gracefully:
 * - Extra typed characters are ignored
 * - Missing typed characters are marked as incorrect
 */
export function scoreString(
  typed: string,
  expected: string,
  options: { caseInsensitive?: boolean } = {}
): boolean[] {
  const normTyped = [...toNFC(typed)];   // spread to handle multi-codepoint chars
  const normExpected = [...toNFC(expected)];

  return normExpected.map((expectedChar, i) => {
    if (i >= normTyped.length) return false;
    const typedChar = normTyped[i];
    if (options.caseInsensitive) {
      return typedChar.toLowerCase() === expectedChar.toLowerCase();
    }
    return typedChar === expectedChar;
  });
}

/**
 * Return the grapheme clusters of a string as an array.
 * Uses Intl.Segmenter when available (modern browsers), falls back to
 * spread operator (which handles surrogate pairs but not combining marks).
 */
export function graphemeClusters(str: string): string[] {
  const normalised = toNFC(str);

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new (Intl as typeof Intl & {
      Segmenter: new (locale?: string, options?: { granularity?: string }) => {
        segment: (str: string) => Iterable<{ segment: string }>;
      };
    }).Segmenter(undefined, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(normalised), (s) => s.segment);
  }

  // Fallback: spread handles surrogate pairs but not combining characters
  return [...normalised];
}

export class CharComparator {
  private readonly caseInsensitive: boolean;

  constructor(options: { caseInsensitive?: boolean } = {}) {
    this.caseInsensitive = options.caseInsensitive ?? false;
  }

  /**
   * Compare a single typed character against the expected character
   */
  compare(typed: string, expected: string): boolean {
    return compareChar(typed, expected, { caseInsensitive: this.caseInsensitive });
  }

  /**
   * Score a full typed string against the expected string
   */
  score(typed: string, expected: string): boolean[] {
    return scoreString(typed, expected, { caseInsensitive: this.caseInsensitive });
  }

  /**
   * Normalise a string to NFC
   */
  normalise(str: string): string {
    return toNFC(str);
  }

  /**
   * Split a string into grapheme clusters
   */
  clusters(str: string): string[] {
    return graphemeClusters(str);
  }
}
