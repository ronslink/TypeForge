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
import greek from './layouts/greek.json' with { type: 'json' };
import dubeolsik from './layouts/dubeolsik.json' with { type: 'json' };
import devanagariPhonetic from './layouts/devanagari-phonetic.json' with { type: 'json' };
import romaji from './layouts/romaji.json' with { type: 'json' };
import type { Key, Layout } from './types.js';

export type { Layout, Key, Finger, Hand, LayoutName, KeyboardLayout, KeyDefinition } from './types.js';

/** Every key in a layout, flattened out of its rows. */
export function getAllKeys(layout: Layout): Key[] {
  return layout.rows.flat();
}

/**
 * Resolve the physical key that produces `char` on this layout.
 *
 * Layouts are the app's own statement of which physical key types which
 * character, so this is the authoritative mapping for scoring: it makes a drill
 * answerable on any operating-system keyboard layout. `charShift` is included
 * so shifted symbols (for example `?`) resolve to their physical key.
 */
export function findKeyByChar(layout: Layout, char: string): Key | undefined {
  if (char.length === 0) return undefined;
  const keys = getAllKeys(layout);
  return keys.find((key) => key.char === char) ?? keys.find((key) => key.charShift === char);
}

/**
 * Resolve the physical key code that produces `char` on this layout.
 * Returns `null` when the layout does not define the character.
 */
export function findCodeByChar(layout: Layout, char: string): string | null {
  return findKeyByChar(layout, char)?.code ?? null;
}

/** Resolve a physical key by its `KeyboardEvent.code`. */
export function findKeyByCode(layout: Layout, code: string): Key | undefined {
  return getAllKeys(layout).find((key) => key.code === code);
}

/**
 * Resolve the character this layout prints for a physical key.
 * This is the label the learner was told to press, which is not necessarily
 * what their operating-system layout produces.
 */
export function findCharByCode(layout: Layout, code: string): string | null {
  return findKeyByCode(layout, code)?.char ?? null;
}

/** All built-in layouts keyed by their ID */
export const layouts = {
  'qwerty-us': qwertyUs,
  'azerty-fr': azertyFr,
  'qwertz-de': qwertzDe,
  'cyrillic-ru': cyrillicRu,
  'arabic': arabic,
  'hebrew': hebrew,
  'dvorak': dvorak,
  'greek': greek,
  'dubeolsik': dubeolsik,
  'devanagari-phonetic': devanagariPhonetic,
  'romaji': romaji,
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
  'hi': 'devanagari-phonetic',
  'id': 'qwerty-us',
  'ja': 'romaji',
  'ko': 'dubeolsik',
  'zh': 'qwerty-us',
  'fr': 'azerty-fr',
  'de': 'qwertz-de',
  'cs': 'qwertz-de',
  'hu': 'qwertz-de',
  'ar': 'arabic',
  'he': 'hebrew',
  'ru': 'cyrillic-ru',
  'uk': 'cyrillic-ru',
  'el': 'greek',
  'tr': 'qwerty-us',
};

/**
 * Returns the canonical keyboard layout ID for a given language code.
 * Falls back to 'qwerty-us' for unknown languages.
 */
export function getDefaultLayoutForLanguage(langCode: string): LayoutId {
  return LANGUAGE_TO_LAYOUT[langCode] ?? 'qwerty-us';
}
