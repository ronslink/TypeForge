/**
 * Layout type definitions
 */

export type Finger = 'left-pinky' | 'left-ring' | 'left-middle' | 'left-index' | 'right-index' | 'right-middle' | 'right-ring' | 'right-pinky' | 'thumb';

export type Hand = 'left' | 'right' | 'thumb';

export interface KeyDefinition {
  /** Key code (physical position) */
  code: string;
  /** Default character */
  char: string;
  /** Shift character */
  shift?: string;
  /** Alt character */
  alt?: string;
  /** Alt+Shift character */
  altShift?: string;
  /** Finger assignment */
  finger: Finger;
  /** Hand */
  hand: Hand;
  /** Row number (0 = number row, 1 = top, 2 = home, 3 = bottom, 4 = space) */
  row: number;
  /** Column position */
  column: number;
}

export interface KeyboardLayout {
  /** Layout identifier */
  id: string;
  /** Display name */
  name: string;
  /** Language code (BCP-47) */
  languageCode: string;
  /** Layout variant */
  variant?: string;
  /** Key definitions */
  keys: KeyDefinition[];
  /** Finger map for quick lookup */
  fingerMap: Record<string, Finger>;
  /** Dead keys */
  deadKeys?: Record<string, string>;
}

export interface FingerAssignment {
  finger: Finger;
  keys: string[];
}

// ============================================================================
// New Layout Types (Row-based)
// ============================================================================

/** Available layout names */
export type LayoutName = 
  | 'qwerty-us'
  | 'azerty-fr'
  | 'qwertz-de'
  | 'dvorak'
  | 'arabic'
  | 'cyrillic';

/** Key definition in row-based layout */
export interface Key {
  /** Key code (physical position, e.g., 'KeyA', 'Digit1') */
  code: string;
  /** Default character */
  char: string;
  /** Shift character */
  charShift?: string;
  /** Whether this key requires AltGr to access the character */
  requiresAltGr?: boolean;
}

/** Row-based keyboard layout */
export interface Layout {
  /** Layout identifier */
  id: string;
  /** Display name */
  name: string;
  /** Language code (BCP-47) */
  language: string;
  /** Rows of keys (0 = number row, 1 = top alpha, 2 = home row, 3 = bottom alpha, 4 = space/modifiers) */
  rows: Key[][];
}
