/**
 * Domain 1: Identity Schema
 * Core user record, extended profile, preferences, and device registry
 */

import { pgTable, pgEnum, uuid, text, boolean, date, timestamp, smallint, char, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userStatusEnum = pgEnum('user_status', ['active', 'suspended', 'pending_verification', 'deleted']);
export const userRoleEnum = pgEnum('user_role', ['learner', 'teacher', 'org_admin', 'platform_admin']);
export const accountTypeEnum = pgEnum('account_type', ['individual', 'institutional']);
export const homeRegionEnum = pgEnum('home_region', ['EU', 'US', 'AF']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: text('clerk_id').unique().notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('email_verified').notNull().default(false),
  displayName: text('display_name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  avatarUrl: text('avatar_url'),
  accountType: accountTypeEnum('account_type').notNull().default('individual'),
  role: userRoleEnum('role').notNull().default('learner'),
  status: userStatusEnum('status').notNull().default('pending_verification'),
  homeRegion: homeRegionEnum('home_region').notNull(),
  locale: text('locale').notNull().default('en'),
  timezone: text('timezone').notNull().default('UTC'),
  dateOfBirth: date('date_of_birth'),
  isMinor: boolean('is_minor').generatedAlwaysAs(
    'date_of_birth IS NOT NULL AND date_of_birth > CURRENT_DATE - INTERVAL \'18 years\'',
    { mode: 'stored' }
  ),
  parentalConsentAt: timestamp('parental_consent_at', { withTimezone: true }),
  parentalEmail: text('parental_email'),
  referredBy: uuid('referred_by').references(() => users.id, { onDelete: 'set null' }),
  lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// User profiles table (extended profile)
export const userProfiles = pgTable('user_profiles', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  bio: text('bio'),
  countryCode: char('country_code', { length: 2 }),
  city: text('city'),
  occupation: text('occupation'),
  typingGoal: text('typing_goal'),
  wpmTarget: smallint('wpm_target'),
  publicProfile: boolean('public_profile').notNull().default(false),
  showOnLeaderboard: boolean('show_on_leaderboard').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// User preferences table
export const userPreferences = pgTable('user_preferences', {
  userId: uuid('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  defaultLanguageCode: text('default_language_code').notNull().default('en'),
  defaultLayoutId: text('default_layout_id').notNull().default('qwerty-us'),
  showKeyboardVisual: boolean('show_keyboard_visual').notNull().default(true),
  showFingerHints: boolean('show_finger_hints').notNull().default(true),
  showWpmLive: boolean('show_wpm_live').notNull().default(true),
  cursorStyle: text('cursor_style').notNull().default('block'),
  soundEnabled: boolean('sound_enabled').notNull().default(false),
  soundVolume: smallint('sound_volume').notNull().default(50),
  theme: text('theme').notNull().default('dark'),
  fontSize: text('font_size').notNull().default('md'),
  highContrast: boolean('high_contrast').notNull().default(false),
  reduceMotion: boolean('reduce_motion').notNull().default(false),
  lessonEndAction: text('lesson_end_action').notNull().default('show_results'),
  dailyGoalMinutes: smallint('daily_goal_minutes').notNull().default(10),
  emailStreakReminder: boolean('email_streak_reminder').notNull().default(true),
  emailWeeklyReport: boolean('email_weekly_report').notNull().default(true),
  emailProductUpdates: boolean('email_product_updates').notNull().default(false),
  pushEnabled: boolean('push_enabled').notNull().default(false),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// User devices table
export const userDevices = pgTable('user_devices', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  deviceName: text('device_name'),
  deviceType: text('device_type'),
  os: text('os'),
  browser: text('browser'),
  pushToken: text('push_token'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (table) => ({
  userPushTokenUnique: { unique: true, columns: [table.userId, table.pushToken] },
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, {
    fields: [users.id],
    references: [userProfiles.userId],
  }),
  preferences: one(userPreferences, {
    fields: [users.id],
    references: [userPreferences.userId],
  }),
  devices: many(userDevices),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
}));
