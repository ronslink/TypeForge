/**
 * @typeforge/layouts — Keyboard layout definitions
 * JSON maps for various keyboard layouts and finger assignments.
 * All layouts follow the row-based `Layout` schema.
 */

import qwertyUs from './layouts/qwerty-us.json' with { type: 'json' };
import azertyFr from './layouts/azerty-fr.json' with { type: 'json' };
import qwertzDe from './layouts/qwertz-de.json' with { type: 'json' };
import cyrillicRu from './layouts/cyrillic-ru.json' with { type: 'json' };
import arabic from './layouts/arabic.json' with { type: 'json' };
import hebrew from './layouts/hebrew.json' with { type: 'json' };
import dvorak from './layouts/dvorak.json' with { type: 'json' };

export type { Layout, Key, Finger, Hand, LayoutName } from './types.js';

/** All built-in layouts keyed by their ID */
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
 * Get a layout by its ID.
 */
export function getLayout(id: LayoutId) {
  return layouts[id];
}

/**
 * Get all available layouts as an array.
 */
export function getAllLayouts() {
  return Object.values(layouts);
}

/**
 * Get layouts matching a specific script type (e.g. 'Latin', 'arabic').
 */
export function getLayoutsByScript(script: string) {
  return Object.values(layouts).filter(layout => layout.script === script);
}

/**
 * Get layouts matching a specific language code.
 */
export function getLayoutsByLanguage(language: string) {
  return Object.values(layouts).filter(layout => layout.language === language);
}

// ---------------------------------------------------------------------------
// Language → Layout mapping
// Canonical layout to auto-select when a user switches practice language.
// ---------------------------------------------------------------------------

/**
 * Maps BCP-47 language codes to their canonical keyboard layout ID.
 * Languages not listed here default to 'qwerty-us'.
 */
export const LANGUAGE_TO_LAYOUT: Record<string, LayoutId> = {
  'en': 'qwerty-us',
  'en-US': 'qwerty-us',
  'en-GB': 'qwerty-us',
  'es': 'qwerty-us',
  'pt': 'qwerty-us',
  'it': 'qwerty-us',
  'nl': 'qwerty-us',
  'sv': 'qwerty-us',
  'no': 'qwerty-us',
  'da': 'qwerty-us',
  'fi': 'qwerty-us',
  'ms': 'qwerty-us',
  'tl': 'qwerty-us',
  'sw': 'qwerty-us',
  'hi': 'qwerty-us',
  'id': 'qwerty-us',
  'ja': 'qwerty-us',
  'ko': 'qwerty-us',
  'zh': 'qwerty-us',
  'fr': 'azerty-fr',
  'de': 'qwertz-de',
  'cs': 'qwertz-de',
  'hu': 'qwertz-de',
  'ar': 'arabic',
  'he': 'hebrew',
  'ru': 'cyrillic-ru',
  'uk': 'cyrillic-ru',
};

/**
 * Returns the canonical keyboard layout ID for a given language code.
 * Falls back to 'qwerty-us' for unknown languages.
 */
export function getDefaultLayoutForLanguage(langCode: string): LayoutId {
  return LANGUAGE_TO_LAYOUT[langCode] ?? 'qwerty-us';
}
