/**
 * Domain 7: Compliance Schema
 * GDPR, COPPA, FERPA, POPIA, Kenya DPA compliance
 * Consent records, data subject requests, audit logs
 */

import { pgTable, pgEnum, uuid, text, timestamp, boolean, jsonb, char } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, organisations } from './index.js';

// Enums
export const consentTypeEnum = pgEnum('consent_type', [
  'terms_of_service',
  'privacy_policy',
  'marketing_emails',
  'data_processing',
  'cookie_analytics',
  'cookie_marketing',
  'parental_consent', // COPPA
  'ferpa_disclosure', // FERPA
]);

export const requestStatusEnum = pgEnum('request_status', [
  'pending',
  'in_progress',
  'completed',
  'rejected',
  'expired',
]);

export const requestTypeEnum = pgEnum('request_type', [
  'access', // GDPR Art. 15
  'rectification', // GDPR Art. 16
  'erasure', // GDPR Art. 17
  'restriction', // GDPR Art. 18
  'portability', // GDPR Art. 20
  'objection', // GDPR Art. 21
  'withdraw_consent', // GDPR Art. 7
]);

// Consent records table
export const consentRecords = pgTable('consent_records', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'set null' }),
  consentType: consentTypeEnum('consent_type').notNull(),
  version: text('version').notNull(), // Version of the policy/term
  granted: boolean('granted').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  metadata: jsonb('metadata'), // Additional context
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Data subject requests table (GDPR, etc.)
export const dataSubjectRequests = pgTable('data_subject_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  requestType: requestTypeEnum('request_type').notNull(),
  status: requestStatusEnum('status').notNull().default('pending'),
  description: text('description'),
  requestDetails: jsonb('request_details'), // Specific data or scope of request
  verificationToken: text('verification_token'),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  assignedTo: uuid('assigned_to'), // Admin handling the request
  response: text('response'),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // GDPR: 30 days to respond
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Audit logs table (partitioned by date for performance)
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Who performed the action
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'set null' }),
  // What action was performed
  action: text('action').notNull(), // 'user.signup', 'lesson.complete', 'data.export', etc.
  entityType: text('entity_type'), // 'user', 'lesson', 'subscription', etc.
  entityId: uuid('entity_id'),
  // Data changes
  oldValue: jsonb('old_value'),
  newValue: jsonb('new_value'),
  // Context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  region: char('region', { length: 2 }), // EU, US, AF
  metadata: jsonb('metadata'),
  // Timestamp (used for partitioning)
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Data retention policies table
export const dataRetentionPolicies = pgTable('data_retention_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }),
  entityType: text('entity_type').notNull(), // 'typing_sessions', 'keystroke_events', etc.
  retentionDays: integer('retention_days').notNull(),
  deleteAfterRetention: boolean('delete_after_retention').notNull().default(true),
  anonymizeAfterRetention: boolean('anonymize_after_retention').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Cookie consent table (for GDPR compliance)
export const cookieConsent = pgTable('cookie_consent', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'),
  necessary: boolean('necessary').notNull().default(true), // Always true
  analytics: boolean('analytics').notNull().default(false),
  marketing: boolean('marketing').notNull().default(false),
  preferences: boolean('preferences').notNull().default(false),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  consentDate: timestamp('consent_date', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
  user: one(users, {
    fields: [consentRecords.userId],
    references: [users.id],
  }),
  org: one(organisations, {
    fields: [consentRecords.orgId],
    references: [organisations.id],
  }),
}));

export const dataSubjectRequestsRelations = relations(dataSubjectRequests, ({ one }) => ({
  user: one(users, {
    fields: [dataSubjectRequests.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
  org: one(organisations, {
    fields: [auditLogs.orgId],
    references: [organisations.id],
  }),
}));

export const dataRetentionPoliciesRelations = relations(dataRetentionPolicies, ({ one }) => ({
  org: one(organisations, {
    fields: [dataRetentionPolicies.orgId],
    references: [organisations.id],
  }),
}));

export const cookieConsentRelations = relations(cookieConsent, ({ one }) => ({
  user: one(users, {
    fields: [cookieConsent.userId],
    references: [users.id],
  }),
}));
