/**
 * @typeforge/layouts — Keyboard layout definitions
 * JSON maps for various keyboard layouts and finger assignments
 */

import qwertyUs from './layouts/qwerty-us.json' with { type: 'json' };
import azertyFr from './layouts/azerty-fr.json' with { type: 'json' };
import qwertzDe from './layouts/qwertz-de.json' with { type: 'json' };

export type { KeyboardLayout, KeyDefinition, FingerAssignment } from './types.js';
export { LayoutRegistry } from './registry.js';

// Re-export built-in layouts
export const layouts = {
  'qwerty-us': qwertyUs,
  'azerty-fr': azertyFr,
  'qwertz-de': qwertzDe,
} as const;
