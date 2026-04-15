/**
 * Domain 5: Typing Sessions & Metrics Schema
 * Session tracking, keystroke data, and performance metrics
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  boolean,
  smallint,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, lessons, exercises } from './index.js';

// Enums
export const sessionStatusEnum = pgEnum('session_status', [
  'in_progress',
  'completed',
  'abandoned',
]);

// Typing sessions table
export const typingSessions = pgTable('typing_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  lessonId: uuid('lesson_id').references(() => lessons.id, { onDelete: 'set null' }),
  exerciseId: uuid('exercise_id').references(() => exercises.id, { onDelete: 'set null' }),
  languageCode: text('language_code').notNull(),
  layoutId: text('layout_id').notNull(),
  status: sessionStatusEnum('status').notNull().default('in_progress'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  durationSeconds: integer('duration_seconds'),
  totalCharacters: integer('total_characters').notNull().default(0),
  correctCharacters: integer('correct_characters').notNull().default(0),
  errors: integer('errors').notNull().default(0),
  wpm: real('wpm'),
  accuracy: real('accuracy'),
  rawWpm: real('raw_wpm'),
  consistency: real('consistency'),
  burstWpm: real('burst_wpm'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Keystroke events table (for detailed analysis)
export const keystrokeEvents = pgTable('keystroke_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => typingSessions.id, { onDelete: 'cascade' }),
  character: text('character').notNull(),
  expected: text('expected').notNull(),
  correct: boolean('correct').notNull(),
  timestamp: timestamp('timestamp', { withTimezone: true }).notNull(),
  keyDownAt: timestamp('key_down_at', { withTimezone: true }).notNull(),
  keyUpAt: timestamp('key_up_at', { withTimezone: true }),
  dwellTime: integer('dwell_time'), // milliseconds
  flightTime: integer('flight_time'), // milliseconds since previous key
  finger: text('finger'),
  hand: text('hand'), // 'left' | 'right'
});

// Daily stats table (aggregated)
export const dailyStats = pgTable(
  'daily_stats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),
    languageCode: text('language_code').notNull(),
    totalSessions: integer('total_sessions').notNull().default(0),
    totalMinutes: integer('total_minutes').notNull().default(0),
    totalCharacters: integer('total_characters').notNull().default(0),
    avgWpm: real('avg_wpm'),
    avgAccuracy: real('avg_accuracy'),
    bestWpm: real('best_wpm'),
    lessonsCompleted: integer('lessons_completed').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userDateLangUnique: { unique: true, columns: [table.userId, table.date, table.languageCode] },
  })
);

// User progress table (per lesson)
export const userProgress = pgTable(
  'user_progress',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id')
      .notNull()
      .references(() => lessons.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('not_started'), // 'not_started' | 'in_progress' | 'completed'
    bestWpm: real('best_wpm'),
    bestAccuracy: real('best_accuracy'),
    attempts: integer('attempts').notNull().default(0),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userLessonUnique: { unique: true, columns: [table.userId, table.lessonId] },
  })
);

// Key mastery table (per user, per key)
export const keyMastery = pgTable(
  'key_mastery',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    layoutId: text('layout_id').notNull(),
    key: text('key').notNull(),
    totalAttempts: integer('total_attempts').notNull().default(0),
    correctAttempts: integer('correct_attempts').notNull().default(0),
    avgDwellTime: integer('avg_dwell_time'),
    masteryLevel: smallint('mastery_level').notNull().default(0), // 0-100
    lastPracticedAt: timestamp('last_practiced_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userLayoutKeyUnique: { unique: true, columns: [table.userId, table.layoutId, table.key] },
  })
);

// User placement test results table
export const userPlacementResults = pgTable('user_placement_results', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  testId: text('test_id').notNull(),
  passed: boolean('passed').notNull(),
  accuracy: real('accuracy'),
  wpm: real('wpm'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const typingSessionsRelations = relations(typingSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [typingSessions.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [typingSessions.lessonId],
    references: [lessons.id],
  }),
  exercise: one(exercises, {
    fields: [typingSessions.exerciseId],
    references: [exercises.id],
  }),
  keystrokes: many(keystrokeEvents),
}));

export const keystrokeEventsRelations = relations(keystrokeEvents, ({ one }) => ({
  session: one(typingSessions, {
    fields: [keystrokeEvents.sessionId],
    references: [typingSessions.id],
  }),
}));

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
  user: one(users, {
    fields: [dailyStats.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const keyMasteryRelations = relations(keyMastery, ({ one }) => ({
  user: one(users, {
    fields: [keyMastery.userId],
    references: [users.id],
  }),
}));

export const userPlacementResultsRelations = relations(userPlacementResults, ({ one }) => ({
  user: one(users, {
    fields: [userPlacementResults.userId],
    references: [users.id],
  }),
}));

// Alias for backwards compatibility with API
export const sessions = typingSessions;
