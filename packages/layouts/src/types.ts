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
