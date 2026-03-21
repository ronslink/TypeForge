/**
 * Domain 7: Notifications & Audit Schema
 * Notifications, audit logs, and system events
 */

import { pgTable, pgEnum, uuid, text, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, organisations } from './index.js';

// Enums
export const notificationChannelEnum = pgEnum('notification_channel', ['email', 'push', 'in_app']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'delivered', 'failed']);

// Notification templates table
export const notificationTemplates = pgTable('notification_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  subject: text('subject'),
  bodyTemplate: text('body_template').notNull(),
  channels: jsonb('channels').notNull(), // ['email', 'push']
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  templateId: uuid('template_id').references(() => notificationTemplates.id),
  channel: notificationChannelEnum('channel').notNull(),
  status: notificationStatusEnum('status').notNull().default('pending'),
  subject: text('subject'),
  body: text('body').notNull(),
  data: jsonb('data'), // Template variables
  sentAt: timestamp('sent_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  readAt: timestamp('read_at', { withTimezone: true }),
  failedAt: timestamp('failed_at', { withTimezone: true }),
  failureReason: text('failure_reason'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// System audit logs table (for application-level events)
export const systemAuditLogs = pgTable('system_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'set null' }),
  action: text('action').notNull(), // 'user.signup', 'lesson.complete', 'subscription.create', etc.
  entityType: text('entity_type'), // 'user', 'lesson', 'subscription', etc.
  entityId: uuid('entity_id'),
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  metadata: jsonb('metadata'), // IP, user agent, etc.
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// System events table (for internal tracking)
export const systemEvents = pgTable('system_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type').notNull(), // 'backup.completed', 'migration.run', etc.
  severity: text('severity').notNull().default('info'), // 'debug' | 'info' | 'warning' | 'error'
  message: text('message').notNull(),
  data: jsonb('data'),
  region: text('region'), // 'EU' | 'US' | 'AF'
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Relations
export const notificationTemplatesRelations = relations(notificationTemplates, ({ many }) => ({
  notifications: many(notifications),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  template: one(notificationTemplates, {
    fields: [notifications.templateId],
    references: [notificationTemplates.id],
  }),
}));

export const systemAuditLogsRelations = relations(systemAuditLogs, ({ one }) => ({
  user: one(users, {
    fields: [systemAuditLogs.userId],
    references: [users.id],
  }),
  org: one(organisations, {
    fields: [systemAuditLogs.orgId],
    references: [organisations.id],
  }),
}));
