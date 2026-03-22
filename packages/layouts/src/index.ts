/**
 * @typeforge/layouts — Keyboard layout definitions
 * JSON maps for various keyboard layouts and finger assignments
 */

import qwertyUs from './layouts/qwerty-us.json' with { type: 'json' };
import azertyFr from './layouts/azerty-fr.json' with { type: 'json' };
import qwertzDe from './layouts/qwertz-de.json' with { type: 'json' };
import cyrillicRu from './layouts/cyrillic-ru.json' with { type: 'json' };
import arabic from './layouts/arabic.json' with { type: 'json' };
import hebrew from './layouts/hebrew.json' with { type: 'json' };
import dvorak from './layouts/dvorak.json' with { type: 'json' };

export type { KeyboardLayout, KeyDefinition, FingerAssignment, Layout, Key, Finger } from './types.js';
export { LayoutRegistry } from './registry.js';

// Re-export built-in layouts
export const layouts = {
  'qwerty-us': qwertyUs,
  'azerty-fr': azertyFr,
  'qwertz-de': qwertzDe,
  'cyrillic-ru': cyrillicRu,
  'arabic': arabic,
  'hebrew': hebrew,
  'dvorak': dvorak,
} as const;

export type LayoutId = keyof typeof layouts;

/**
 * Get a layout by its ID
 */
export function getLayout(id: LayoutId): typeof layouts[LayoutId] {
  return layouts[id];
}

/**
 * Get all available layouts
 */
export function getAllLayouts(): typeof layouts[LayoutId][] {
  return Object.values(layouts);
}

/**
 * Get layouts by script type
 */
export function getLayoutByScript(script: string): typeof layouts[LayoutId][] {
  return Object.values(layouts).filter(layout => layout.script === script);
}

/**
 * Get layout by language code
 */
export function getLayoutByLanguage(language: string): typeof layouts[LayoutId][] {
  return Object.values(layouts).filter(layout => layout.language === language);
}
