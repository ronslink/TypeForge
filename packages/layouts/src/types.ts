/**
 * Layout type definitions
 * Single, unified type system for keyboard layouts.
 */

export type Finger =
  | 'left-pinky'
  | 'left-ring'
  | 'left-middle'
  | 'left-index'
  | 'right-index'
  | 'right-middle'
  | 'right-ring'
  | 'right-pinky'
  | 'thumb';

export type Hand = 'left' | 'right' | 'thumb';

/** Available layout IDs */
export type LayoutName = 'qwerty-us' | 'azerty-fr' | 'qwertz-de' | 'dvorak' | 'arabic' | 'hebrew' | 'cyrillic-ru';

/** A single key in a row-based keyboard layout */
export interface Key {
  /** Key code (physical position, e.g., 'KeyA', 'Digit1') */
  code: string;
  /** Default character */
  char: string;
  /** Shift character */
  charShift?: string;
  /** Whether this key requires AltGr to access the character */
  requiresAltGr?: boolean;
  /** Finger responsible for this key */
  finger?: Finger;
  /** Hand that owns this key */
  hand?: Hand;
  /** Whether this key is marked for RTL rendering */
  rtl?: boolean;
  /** Visual width hint for special keys */
  width?: string;
}

/** Row-based keyboard layout */
export interface Layout {
  /** Layout identifier */
  id: string;
  /** Display name */
  name: string;
  /** Language code (BCP-47) */
  language: string;
  /** Optional layout variant description */
  variant?: string;
  /** Script family (e.g., 'Latin', 'Cyrillic', 'arabic', 'hebrew') */
  script: string;
  /** Whether this layout is RTL */
  rtl?: boolean;
  /** Rows of keys (0 = number row, 1 = top alpha, 2 = home row, 3 = bottom alpha, 4 = space) */
  rows: Key[][];
}
