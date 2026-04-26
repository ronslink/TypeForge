/**
 * Domain 3: Subscriptions & Billing Schema
 * Plans, subscriptions, invoices, and payment tracking
 */

import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  timestamp,
  char,
  jsonb,
  boolean,
  smallint,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, organisations } from './index.js';

// Enums
export const planTypeEnum = pgEnum('plan_type', [
  'free',
  'individual',
  'org_seat',
  'org_flat',
  'custom',
]);
export const planIntervalEnum = pgEnum('plan_interval', [
  'monthly',
  'annual',
  'lifetime',
  'one_time',
]);

// Org Billing table
export const orgBilling = pgTable('org_billing', {
  orgId: uuid('org_id').primaryKey().references(() => organisations.id, { onDelete: 'cascade' }),
  stripeSubscriptionId: text('stripe_subscription_id'),
  seatPriceCents: integer('seat_price_cents').notNull().default(600),
  billingInterval: planIntervalEnum('billing_interval').notNull().default('monthly'),
  currentSeatCount: integer('current_seat_count').notNull().default(0),
  purchasedSeats: integer('purchased_seats').notNull().default(0),
  pendingSeatCount: integer('pending_seat_count'),
  seatCooldownDays: integer('seat_cooldown_days').notNull().default(180),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
export const subStatusEnum = pgEnum('sub_status', [
  'trialing',
  'active',
  'past_due',
  'cancelled',
  'paused',
  'expired',
]);
export const entityTypeEnum = pgEnum('entity_type', ['user', 'organisation']);
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'open',
  'paid',
  'void',
  'uncollectible',
]);

// Plans table
export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  stripeProductId: text('stripe_product_id').unique(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  planType: planTypeEnum('plan_type').notNull(),
  interval: planIntervalEnum('interval'),
  priceUsdCents: integer('price_usd_cents').notNull().default(0),
  priceEurCents: integer('price_eur_cents').notNull().default(0),
  includedSeats: integer('included_seats'),
  maxSeats: integer('max_seats'),
  features: jsonb('features').notNull().default({}),
  isPublic: boolean('is_public').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  displayOrder: smallint('display_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Subscriptions table
export const subscriptions = pgTable(
  'subscriptions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entityType: entityTypeEnum('entity_type').notNull(),
    entityId: uuid('entity_id').notNull(),
    planId: uuid('plan_id')
      .notNull()
      .references(() => plans.id),
    stripeSubscriptionId: text('stripe_subscription_id').unique(),
    stripeCustomerId: text('stripe_customer_id'),
    status: subStatusEnum('status').notNull().default('trialing'),
    trialStart: timestamp('trial_start', { withTimezone: true }),
    trialEnd: timestamp('trial_end', { withTimezone: true }),
    currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
    currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
    cancelAt: timestamp('cancel_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    customPriceCents: integer('custom_price_cents'),
    customSeatLimit: integer('custom_seat_limit'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    entityUnique: { unique: true, columns: [table.entityType, table.entityId] },
  })
);

// Subscription seats table
export const subscriptionSeats = pgTable(
  'subscription_seats',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriptionId: uuid('subscription_id')
      .references(() => subscriptions.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id').references(() => organisations.id, { onDelete: 'cascade' }),
    allocatedAt: timestamp('allocated_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    reassignableAt: timestamp('reassignable_at', { withTimezone: true }),
  },
  (table) => ({
    subUserUnique: { unique: true, columns: [table.subscriptionId, table.userId] },
  })
);

// Plan prices table
export const planPrices = pgTable('plan_prices', {
  id: uuid('id').primaryKey().defaultRandom(),
  planId: uuid('plan_id')
    .notNull()
    .references(() => plans.id, { onDelete: 'cascade' }),
  stripePriceId: text('stripe_price_id').unique().notNull(),
  interval: planIntervalEnum('interval').notNull(),
  currency: char('currency', { length: 3 }).notNull().default('USD'),
  unitAmountCents: integer('unit_amount_cents').notNull(),
  isDefault: boolean('is_default').notNull().default(false),
  active: boolean('active').notNull().default(true),
});

// Invoices table
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id').references(() => subscriptions.id, {
    onDelete: 'set null',
  }),
  stripeInvoiceId: text('stripe_invoice_id').unique(),
  entityType: entityTypeEnum('entity_type').notNull(),
  entityId: uuid('entity_id').notNull(),
  status: invoiceStatusEnum('status').notNull().default('draft'),
  currency: char('currency', { length: 3 }).notNull().default('USD'),
  subtotalCents: integer('subtotal_cents').notNull().default(0),
  taxCents: integer('tax_cents').notNull().default(0),
  totalCents: integer('total_cents').notNull().default(0),
  amountPaidCents: integer('amount_paid_cents').notNull().default(0),
  amountDueCents: integer('amount_due_cents').notNull().default(0),
  invoicePdfUrl: text('invoice_pdf_url'),
  invoiceNumber: text('invoice_number'),
  periodStart: timestamp('period_start', { withTimezone: true }),
  periodEnd: timestamp('period_end', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  voidedAt: timestamp('voided_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Invoice line items table
export const invoiceLineItems = pgTable('invoice_line_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  quantity: integer('quantity').notNull().default(1),
  unitAmountCents: integer('unit_amount_cents').notNull(),
  totalAmountCents: integer('total_amount_cents').notNull(),
  stripeLineItemId: text('stripe_line_item_id'),
});

// Relations
export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
  prices: many(planPrices),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id],
  }),
  seats: many(subscriptionSeats),
  invoices: many(invoices),
}));

export const subscriptionSeatsRelations = relations(subscriptionSeats, ({ one }) => ({
  subscription: one(subscriptions, {
    fields: [subscriptionSeats.subscriptionId],
    references: [subscriptions.id],
  }),
  user: one(users, {
    fields: [subscriptionSeats.userId],
    references: [users.id],
  }),
}));

export const planPricesRelations = relations(planPrices, ({ one }) => ({
  plan: one(plans, {
    fields: [planPrices.planId],
    references: [plans.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id],
  }),
  lineItems: many(invoiceLineItems),
}));

export const invoiceLineItemsRelations = relations(invoiceLineItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceLineItems.invoiceId],
    references: [invoices.id],
  }),
}));
