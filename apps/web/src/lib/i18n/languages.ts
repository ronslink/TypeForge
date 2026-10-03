/**
 * Language registry — re-exported from `@typeforge/curriculum`.
 *
 * The registry moved into the curriculum package because the database seed needs
 * the same data: `lessons.language_code` and `keyboard_layouts.language_code` are
 * foreign keys into `languages.code`, so the seed has to agree with the app about
 * which languages exist and how they are named. Two copies would drift.
 *
 * This module stays as the app's import path so no caller had to change.
 */
export {
  ALL_LANGUAGES,
  REGIONS,
  getLanguagesByRegion,
  getLanguageByCode,
  type Language,
  type Region,
} from '@typeforge/curriculum';
