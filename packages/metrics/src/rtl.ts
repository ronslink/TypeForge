/**
 * RTLHandler — Right-to-left text direction manager
 *
 * Tracks whether the current lesson is in an RTL script (Arabic, Hebrew, etc.)
 * and provides direction-aware cursor movement helpers so the typing engine
 * advances through lesson text correctly regardless of reading direction.
 *
 * Rules (per Agent 4 spec):
 * - No fetch() calls — pure computation
 * - Unicode normalisation via CharComparator (NFC)
 */

export type TextDirection = 'ltr' | 'rtl';

/** Unicode script ranges that are inherently RTL */
const RTL_RANGES: [number, number][] = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic
  [0x0700, 0x074f], // Syriac
  [0x0750, 0x077f], // Arabic Supplement
  [0x07c0, 0x07ff], // N'Ko
  [0x0800, 0x083f], // Samaritan
  [0x0840, 0x085f], // Mandaic
  [0xfb1d, 0xfb4f], // Hebrew Presentation Forms
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
];

/**
 * Determine whether a Unicode code point is in an RTL script range
 */
function isRTLCodePoint(cp: number): boolean {
  return RTL_RANGES.some(([start, end]) => cp >= start && cp <= end);
}

/**
 * Detect the dominant text direction of a string by scanning its code points
 */
export function detectDirection(text: string): TextDirection {
  let rtlCount = 0;
  let ltrCount = 0;

  for (const char of text) {
    const cp = char.codePointAt(0) ?? 0;
    if (isRTLCodePoint(cp)) {
      rtlCount++;
    } else if (cp > 0x0040) {
      // Skip ASCII punctuation/digits; count only letters
      ltrCount++;
    }
  }

  return rtlCount > ltrCount ? 'rtl' : 'ltr';
}

export class RTLHandler {
  private _direction: TextDirection;
  private _lessonText: string;

  constructor(lessonText: string) {
    this._lessonText = lessonText;
    this._direction = detectDirection(lessonText);
  }

  get direction(): TextDirection {
    return this._direction;
  }

  get isRTL(): boolean {
    return this._direction === 'rtl';
  }

  /**
   * Update the lesson text and re-detect direction
   */
  setLessonText(text: string): void {
    this._lessonText = text;
    this._direction = detectDirection(text);
  }

  /**
   * Override direction explicitly (e.g. when set from user preferences)
   */
  setDirection(direction: TextDirection): void {
    this._direction = direction;
  }

  /**
   * Given a cursor position and the lesson text, return the next cursor
   * position after a correct keystroke — moves right in LTR, left in RTL.
   *
   * For RTL text, index 0 is the rightmost (first) character visually.
   * The engine always works with logical (Unicode) indices, so advancing
   * means incrementing the index regardless of direction; this method
   * exists to centralise the convention and make RTL intent explicit.
   */
  advance(currentIndex: number): number {
    return currentIndex + 1;
  }

  /**
   * Return the CSS direction value for this lesson
   */
  cssDirection(): 'ltr' | 'rtl' {
    return this._direction;
  }

  /**
   * Return the appropriate text-align CSS value
   */
  cssTextAlign(): 'left' | 'right' {
    return this._direction === 'rtl' ? 'right' : 'left';
  }

  /**
   * Return the Unicode Bidi control character to embed in displayed text
   */
  bidiEmbedChar(): string {
    return this._direction === 'rtl' ? '\u202B' : '\u202A'; // RLE : LRE
  }

  reset(): void {
    this._direction = detectDirection(this._lessonText);
  }
}
