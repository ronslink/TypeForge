/**
 * Domain 6: Gamification & Social Schema
 * Achievements, streaks, leaderboards, and social features
 */

import { pgTable, pgEnum, uuid, text, integer, timestamp, boolean, smallint, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './identity.js';

// Enums
export const achievementCategoryEnum = pgEnum('achievement_category', ['speed', 'accuracy', 'streak', 'lessons', 'social', 'special']);

// Achievements table
export const achievements = pgTable('achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  description: text('description').notNull(),
  category: achievementCategoryEnum('category').notNull(),
  icon: text('icon').notNull(),
  requirement: jsonb('requirement').notNull(), // { type: 'wpm', value: 100 }
  xpReward: integer('xp_reward').notNull().default(0),
  isSecret: boolean('is_secret').notNull().default(false),
  displayOrder: smallint('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// User achievements table
export const userAchievements = pgTable('user_achievements', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: uuid('achievement_id').notNull().references(() => achievements.id, { onDelete: 'cascade' }),
  earnedAt: timestamp('earned_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userAchievementUnique: { unique: true, columns: [table.userId, table.achievementId] },
}));

// Streaks table
export const streaks = pgTable('streaks', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull().default('daily'), // 'daily' | 'weekly'
  currentStreak: integer('current_streak').notNull().default(0),
  longestStreak: integer('longest_streak').notNull().default(0),
  lastActivityAt: timestamp('last_activity_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userTypeUnique: { unique: true, columns: [table.userId, table.type] },
}));

// XP and levels table
export const userXp = pgTable('user_xp', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  totalXp: integer('total_xp').notNull().default(0),
  currentLevel: smallint('current_level').notNull().default(1),
  xpToNextLevel: integer('xp_to_next_level').notNull().default(100),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Leaderboards table (cached)
export const leaderboards = pgTable('leaderboards', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'global' | 'language' | 'region' | 'org'
  scope: text('scope').notNull(), // 'weekly' | 'monthly' | 'all_time'
  scopeValue: text('scope_value'), // language code, region, or org id
  data: jsonb('data').notNull(), // [{ userId, rank, wpm, accuracy, ... }]
  generatedAt: timestamp('generated_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  typeScopeUnique: { unique: true, columns: [table.type, table.scope, table.scopeValue] },
}));

// User follows table
export const userFollows = pgTable('user_follows', {
  followerId: uuid('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: uuid('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  pk: { primaryKey: true, columns: [table.followerId, table.followingId] },
}));

// Relations
export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, {
    fields: [streaks.userId],
    references: [users.id],
  }),
}));

export const userXpRelations = relations(userXp, ({ one }) => ({
  user: one(users, {
    fields: [userXp.userId],
    references: [users.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
  }),
}));
