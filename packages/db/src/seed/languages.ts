/**
 * The languages the database must know about, derived from the shipped registry.
 *
 * `lessons.language_code` and `keyboard_layouts.language_code` are foreign keys
 * into `languages.code`, so every language the catalogues use needs a row.
 * Deriving from `ALL_LANGUAGES` rather than a hand-written list means the seed
 * cannot disagree with the app about which languages exist.
 *
 * `en-US` is the one addition: `qwerty-us.json` is filed under `en-US` while
 * every English lesson is filed under `en`, so the layout's FK needs both codes.
 */
import { ALL_LANGUAGES } from '@typeforge/curriculum';
import type { ReferenceLanguage } from './reference-data.js';

const EN_US: ReferenceLanguage = {
  code: 'en-US',
  name: 'English (US)',
  nativeName: 'English (US)',
  script: 'Latin',
  rtl: false,
  displayOrder: 0,
};

export const REFERENCE_LANGUAGES: ReferenceLanguage[] = [
  EN_US,
  ...ALL_LANGUAGES.map((language, index) => ({
    code: language.code,
    name: language.englishName,
    nativeName: language.nativeName,
    script: language.script,
    rtl: language.rtl,
    displayOrder: index + 1,
  })),
];
