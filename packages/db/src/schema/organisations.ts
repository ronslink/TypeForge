/**
 * Domain 2: Organisations Schema
 * Schools, companies, or any institutional account
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  timestamp,
  char,
  integer,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { users, homeRegionEnum } from './identity.js';

// Enums
export const orgTypeEnum = pgEnum('org_type', [
  'school',
  'university',
  'company',
  'nonprofit',
  'government',
  'other',
]);
export const orgStatusEnum = pgEnum('org_status', ['active', 'suspended', 'trial', 'cancelled']);
export const memberRoleEnum = pgEnum('member_role', ['admin', 'teacher', 'student', 'viewer']);
export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'invited',
  'suspended',
  'removed',
]);

// Organisations table
export const organisations = pgTable('organisations', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkOrgId: text('clerk_org_id').unique(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  orgType: orgTypeEnum('org_type').notNull().default('school'),
  status: orgStatusEnum('status').notNull().default('trial'),
  homeRegion: homeRegionEnum('home_region').notNull(),
  countryCode: char('country_code', { length: 2 }),
  website: text('website'),
  logoUrl: text('logo_url'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  contactPhone: text('contact_phone'),
  billingEmail: text('billing_email'),
  taxId: text('tax_id'),
  maxSeats: integer('max_seats'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

// Org members table
export const orgMembers = pgTable(
  'org_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organisations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    role: memberRoleEnum('role').notNull().default('student'),
    status: memberStatusEnum('status').notNull().default('invited'),
    invitedEmail: text('invited_email'),
    invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    orgUserUnique: { unique: true, columns: [table.orgId, table.userId] },
  })
);

// Org classes table
export const orgClasses = pgTable('org_classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  teacherId: uuid('teacher_id').references(() => users.id, { onDelete: 'set null' }),
  languageCode: text('language_code'),
  layoutId: text('layout_id'),
  archived: boolean('archived').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Class members table
export const classMembers = pgTable(
  'class_members',
  {
    classId: uuid('class_id')
      .notNull()
      .references(() => orgClasses.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    addedAt: timestamp('added_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: { primaryKey: true, columns: [table.classId, table.userId] },
  })
);

// Org invitations table
export const orgInvitations = pgTable('org_invitations', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .notNull()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => orgClasses.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  role: memberRoleEnum('role').notNull().default('student'),
  token: text('token')
    .unique()
    .notNull()
    .default(sql`gen_random_uuid()`),
  invitedBy: uuid('invited_by').references(() => users.id, { onDelete: 'set null' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull().defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Org settings table
export const orgSettings = pgTable('org_settings', {
  orgId: uuid('org_id')
    .primaryKey()
    .references(() => organisations.id, { onDelete: 'cascade' }),
  ssoEnabled: boolean('sso_enabled').notNull().default(false),
  ssoProvider: text('sso_provider'),
  ssoDomain: text('sso_domain'),
  enforceLayout: text('enforce_layout'),
  enforceLanguage: text('enforce_language'),
  allowSelfEnrol: boolean('allow_self_enrol').notNull().default(false),
  requireParentalConsent: boolean('require_parental_consent').notNull().default(false),
  customLessonEnabled: boolean('custom_lesson_enabled').notNull().default(false),
  brandingLogoUrl: text('branding_logo_url'),
  brandingPrimaryColor: text('branding_primary_color'),
  dataExportEnabled: boolean('data_export_enabled').notNull().default(true),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const organisationsRelations = relations(organisations, ({ many, one }) => ({
  members: many(orgMembers),
  classes: many(orgClasses),
  invitations: many(orgInvitations),
  settings: one(orgSettings, {
    fields: [organisations.id],
    references: [orgSettings.orgId],
  }),
}));

export const orgMembersRelations = relations(orgMembers, ({ one }) => ({
  org: one(organisations, {
    fields: [orgMembers.orgId],
    references: [organisations.id],
  }),
  user: one(users, {
    fields: [orgMembers.userId],
    references: [users.id],
  }),
}));

export const orgClassesRelations = relations(orgClasses, ({ one, many }) => ({
  org: one(organisations, {
    fields: [orgClasses.orgId],
    references: [organisations.id],
  }),
  teacher: one(users, {
    fields: [orgClasses.teacherId],
    references: [users.id],
  }),
  members: many(classMembers),
}));

export const classMembersRelations = relations(classMembers, ({ one }) => ({
  class: one(orgClasses, {
    fields: [classMembers.classId],
    references: [orgClasses.id],
  }),
  user: one(users, {
    fields: [classMembers.userId],
    references: [users.id],
  }),
}));

export const orgInvitationsRelations = relations(orgInvitations, ({ one }) => ({
  org: one(organisations, {
    fields: [orgInvitations.orgId],
    references: [organisations.id],
  }),
  class: one(orgClasses, {
    fields: [orgInvitations.classId],
    references: [orgClasses.id],
  }),
}));

export const orgSettingsRelations = relations(orgSettings, ({ one }) => ({
  org: one(organisations, {
    fields: [orgSettings.orgId],
    references: [organisations.id],
  }),
}));
