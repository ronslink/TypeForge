/**
 * Reference-data seeding, exposed for the CLI and for tests.
 *
 * Kept as a subpath (`@typeforge/db/seed`) rather than part of the package root
 * so that importing the database client does not also pull in seeding code.
 */
export {
  seedReferenceData,
  type LessonDifficulty,
  type ReferenceData,
  type ReferenceLanguage,
  type ReferenceLayout,
  type ReferenceLesson,
  type SeedCounts,
} from './reference-data.js';
export {
  buildReferenceData,
  difficultyForLevel,
  DIFFICULTY_BY_LEVEL,
  type BuildReferenceDataInput,
  type CatalogLayoutInput,
  type CatalogLessonInput,
} from './from-catalog.js';
export { REFERENCE_LANGUAGES } from './languages.js';
