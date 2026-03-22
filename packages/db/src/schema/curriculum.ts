/**
 * Domain 4: Content & Curriculum Schema
 * Languages, keyboard layouts, lessons, and exercises
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  boolean,
  smallint,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const lessonDifficultyEnum = pgEnum('lesson_difficulty', [
  'beginner',
  'intermediate',
  'advanced',
  'expert',
]);
export const exerciseTypeEnum = pgEnum('exercise_type', [
  'words',
  'sentences',
  'paragraphs',
  'code',
  'custom',
]);

// Languages table
export const languages = pgTable('languages', {
  code: text('code').primaryKey(), // BCP-47 code: 'en', 'de', 'fr', 'zh-Hans', etc.
  name: text('name').notNull(),
  nativeName: text('native_name').notNull(),
  script: text('script').notNull(), // Latin, Cyrillic, Arabic, Han, etc.
  rtl: boolean('rtl').notNull().default(false), // Right-to-left
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: smallint('display_order').notNull().default(0),
});

// Keyboard layouts table
export const keyboardLayouts = pgTable('keyboard_layouts', {
  id: text('id').primaryKey(), // 'qwerty-us', 'azerty-fr', 'qwertz-de', etc.
  name: text('name').notNull(),
  languageCode: text('language_code')
    .notNull()
    .references(() => languages.code),
  layoutData: jsonb('layout_data').notNull(), // Key mapping JSON
  fingerMap: jsonb('finger_map').notNull(), // Finger assignments for each key
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: smallint('display_order').notNull().default(0),
});

// Lesson categories table
export const lessonCategories = pgTable(
  'lesson_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    languageCode: text('language_code')
      .notNull()
      .references(() => languages.code),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    displayOrder: smallint('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    langSlugUnique: { unique: true, columns: [table.languageCode, table.slug] },
  })
);

// Lessons table
export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id').references(() => lessonCategories.id, { onDelete: 'set null' }),
    languageCode: text('language_code')
      .notNull()
      .references(() => languages.code),
    layoutId: text('layout_id').references(() => keyboardLayouts.id),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    description: text('description'),
    difficulty: lessonDifficultyEnum('difficulty').notNull().default('beginner'),
    focusKeys: jsonb('focus_keys').notNull().default([]), // Keys introduced in this lesson
    prerequisites: jsonb('prerequisites').notNull().default([]), // Lesson IDs that must be completed first
    estimatedMinutes: smallint('estimated_minutes').notNull().default(5),
    isActive: boolean('is_active').notNull().default(true),
    displayOrder: smallint('display_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    langSlugUnique: { unique: true, columns: [table.languageCode, table.slug] },
  })
);

// Exercises table
export const exercises = pgTable('exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  lessonId: uuid('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  type: exerciseTypeEnum('type').notNull().default('words'),
  content: jsonb('content').notNull(), // Array of words/sentences/paragraphs
  displayOrder: smallint('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Custom lessons table (org-specific)
export const customLessons = pgTable('custom_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull(),
  createdBy: uuid('created_by').notNull(),
  languageCode: text('language_code')
    .notNull()
    .references(() => languages.code),
  title: text('title').notNull(),
  description: text('description'),
  content: jsonb('content').notNull(),
  isPublic: boolean('is_public').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const languagesRelations = relations(languages, ({ many }) => ({
  layouts: many(keyboardLayouts),
  categories: many(lessonCategories),
  lessons: many(lessons),
}));

export const keyboardLayoutsRelations = relations(keyboardLayouts, ({ one, many }) => ({
  language: one(languages, {
    fields: [keyboardLayouts.languageCode],
    references: [languages.code],
  }),
  lessons: many(lessons),
}));

export const lessonCategoriesRelations = relations(lessonCategories, ({ one, many }) => ({
  language: one(languages, {
    fields: [lessonCategories.languageCode],
    references: [languages.code],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  category: one(lessonCategories, {
    fields: [lessons.categoryId],
    references: [lessonCategories.id],
  }),
  language: one(languages, {
    fields: [lessons.languageCode],
    references: [languages.code],
  }),
  layout: one(keyboardLayouts, {
    fields: [lessons.layoutId],
    references: [keyboardLayouts.id],
  }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one }) => ({
  lesson: one(lessons, {
    fields: [exercises.lessonId],
    references: [lessons.id],
  }),
}));
