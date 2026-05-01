/**
 * Billing routes
 * Stripe integration for individual subscriptions and billing management
 */

import { Hono } from 'hono';
import { requireAuth, getAuth, getDb } from '../middleware/index.js';
import { subscriptions, plans, invoices, planPrices, users, orgBilling } from '@typeforge/db';
import { and, eq } from 'drizzle-orm';
import Stripe from 'stripe';

const app = new Hono();

// Individual plan prices (in cents)
const INDIVIDUAL_PRICES = {
  monthly: {
    amount: 900, // $9.00
    priceId: process.env.STRIPE_PRICE_MONTHLY || 'price_monthly_placeholder',
  },
  annual: {
    amount: 7900, // $79.00
    priceId: process.env.STRIPE_PRICE_ANNUAL || 'price_annual_placeholder',
  },
};

/**
 * Initialize Stripe client
 */
function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY as string;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY not configured');
  }
  return new Stripe(secretKey, { apiVersion: '2023-10-16' });
}

function getEntityTypeFromMetadata(metadata: Stripe.Metadata | null | undefined): 'user' | 'organisation' {
  return metadata?.orgId ? 'organisation' : 'user';
}

async function resolvePlanId(
  db: any,
  priceId: string | undefined,
  entityType: 'user' | 'organisation',
  interval: 'monthly' | 'annual' = 'monthly'
): Promise<string> {
  if (priceId) {
    const [price] = await db
      .select({ planId: planPrices.planId })
      .from(planPrices)
      .where(eq(planPrices.stripePriceId, priceId))
      .limit(1) as unknown as { planId: string }[];

    if (price?.planId) return price.planId;
  }

  const fallbackSlug = entityType === 'organisation' ? 'org-seats' : 'individual';
  const fallbackPlanType = entityType === 'organisation' ? 'org_seat' : 'individual';

  const [existingPlan] = await db
    .select({ id: plans.id })
    .from(plans)
    .where(eq(plans.slug, fallbackSlug))
    .limit(1) as unknown as { id: string }[];

  if (existingPlan?.id) return existingPlan.id;

  const createdPlans = await db
    .insert(plans)
    .values({
      name: entityType === 'organisation' ? 'Organisation Seats' : 'Individual',
      slug: fallbackSlug,
      planType: fallbackPlanType,
      interval,
      priceUsdCents: entityType === 'organisation' ? 600 : 900,
      priceEurCents: entityType === 'organisation' ? 600 : 900,
      includedSeats: entityType === 'organisation' ? 1 : null,
      features: {},
      isPublic: false,
      displayOrder: 999,
    })
    .onConflictDoUpdate({
      target: plans.slug,
      set: { updatedAt: new Date() },
    })
    .returning({ id: plans.id }) as unknown as { id: string }[];

  return createdPlans[0]!.id;
}

async function upsertSubscriptionFromStripe(subscription: Stripe.Subscription, db: any): Promise<void> {
  const userId = subscription.metadata?.userId;
  const orgId = subscription.metadata?.orgId;
  const entityId = userId || orgId;

  if (!entityId) {
    console.warn('Subscription missing entity ID in metadata');
    return;
  }

  const entityType = getEntityTypeFromMetadata(subscription.metadata);
  const status = mapStripeStatus(subscription.status);
  const currentPeriodStart = new Date(subscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
  const priceId = subscription.items.data[0]?.price.id;
  const planId = await resolvePlanId(db, priceId, entityType);
  const cancelAt = subscription.cancel_at_period_end ? currentPeriodEnd : null;

  const [existingByStripeId] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id))
    .limit(1) as unknown as { id: string }[];

  const [existingByEntity] = existingByStripeId?.id
    ? []
    : await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(and(eq(subscriptions.entityType, entityType), eq(subscriptions.entityId, entityId)))
        .limit(1) as unknown as { id: string }[];

  const existing = existingByStripeId || existingByEntity;

  if (existing?.id) {
    await db
      .update(subscriptions)
      .set({
        planId,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAt,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db
      .insert(subscriptions)
      .values({
        entityType,
        entityId,
        planId,
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAt,
      })
      .returning();
  }

  if (orgId) {
    const seatCount = Number(subscription.metadata?.seatCount || subscription.items.data[0]?.quantity || 1);
    const cooldownDays = Number(subscription.metadata?.cooldownDays || 180);
    await db
      .update(orgBilling)
      .set({
        stripeSubscriptionId: subscription.id,
        purchasedSeats: seatCount,
        pendingSeatCount: null,
        seatCooldownDays: cooldownDays,
        updatedAt: new Date(),
      })
      .where(eq(orgBilling.orgId, orgId));
  }
}

/**
 * GET /billing/plans - List available plans
 */
app.get('/plans', async (c) => {
  const db = getDb(c);
  
  const planList = await db
    .select()
    .from(plans)
    .where(eq(plans.isPublic, true))
    .orderBy(plans.displayOrder);
  
  return c.json({ plans: planList });
});

/**
 * GET /billing/subscription - Get current user's subscription
 */
app.get('/subscription', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const [subscription] = await db
    .select({
      subscription: subscriptions,
      plan: plans,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.planId, plans.id))
    .where(eq(subscriptions.entityId, auth.userId))
    .limit(1);
  
  return c.json({ subscription });
});

/**
 * POST /billing/checkout - Create Stripe checkout session for individual plans
 */
app.post('/checkout', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  const stripe = getStripe();
  
  const body = await c.req.json();
  const { interval = 'monthly', successUrl, cancelUrl } = body;
  
  if (interval !== 'monthly' && interval !== 'annual') {
    return c.json({ error: 'Invalid interval. Must be monthly or annual', code: 'INVALID_INTERVAL' }, 400);
  }
  
  const db = getDb(c);
  
  // Get or create Stripe customer
  const [userRecord] = await db
    .select({ stripeCustomerId: users.stripeCustomerId, email: users.email })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);
  
  let customerId = userRecord?.stripeCustomerId;
  
  if (!customerId) {
    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: userRecord?.email || auth.user?.email,
      metadata: {
        userId: auth.userId,
        type: 'individual',
      },
    });
    customerId = customer.id;
    
    // Store customer ID in database
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, auth.userId));
  }
  
  // Get price ID from environment or use default
  const priceId = interval === 'monthly' 
    ? (process.env.STRIPE_PRICE_MONTHLY || INDIVIDUAL_PRICES.monthly.priceId)
    : (process.env.STRIPE_PRICE_ANNUAL || INDIVIDUAL_PRICES.annual.priceId);
  
  // Mock checkout fallback if price IDs are not configured
  if (priceId.includes('placeholder')) {
    console.warn(`Mock checkout triggered for individual plan. No real Stripe price ID configured for ${interval}.`);
    const mockSessionId = `mock_session_${Date.now()}`;
    const url = (successUrl || `${process.env.APP_URL || 'https://typeforge.io'}/billing/success?session_id={CHECKOUT_SESSION_ID}`).replace('{CHECKOUT_SESSION_ID}', mockSessionId);
    return c.json({ 
      checkoutUrl: url,
      sessionId: mockSessionId,
    });
  }

  try {
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.APP_URL || 'https://typeforge.io'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'https://typeforge.io'}/billing/cancel`,
      metadata: {
        userId: auth.userId,
        type: 'individual',
        interval,
      },
      subscription_data: {
        metadata: {
          userId: auth.userId,
          type: 'individual',
        },
      },
    });
    
    return c.json({ 
      checkoutUrl: session.url,
      sessionId: session.id,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return c.json({ error: error.message || 'Failed to initialize Stripe checkout' }, 500);
  }
});

/**
 * POST /billing/portal - Create Stripe Customer Portal session
 */
app.post('/portal', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  const stripe = getStripe();
  const db = getDb(c);
  
  // Get user's Stripe customer ID
  const [userRecord] = await db
    .select({ stripeCustomerId: users.stripeCustomerId })
    .from(users)
    .where(eq(users.id, auth.userId))
    .limit(1);
  
  if (!userRecord?.stripeCustomerId) {
    return c.json({ error: 'No billing account found', code: 'NO_CUSTOMER' }, 404);
  }
  
  // Create portal session
  const session = await stripe.billingPortal.sessions.create({
    customer: userRecord.stripeCustomerId,
    return_url: `${process.env.APP_URL || 'https://typeforge.io'}/billing`,
  });
  
  return c.json({ 
    portalUrl: session.url,
  });
});

/**
 * GET /billing/invoices - List user's invoices
 */
app.get('/invoices', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  const invoiceList = await db
    .select()
    .from(invoices)
    .where(eq(invoices.entityId, auth.userId))
    .orderBy(invoices.createdAt);
  
  return c.json({
    invoices: invoiceList.map((invoice: any) => ({
      ...invoice,
      amount: invoice.totalCents,
      pdfUrl: invoice.invoicePdfUrl,
    })),
  });
});

/**
 * POST /billing/webhook - Stripe webhook handler
 */
app.post('/webhook', async (c) => {
  const stripe = getStripe();
  const body = await c.req.text();
  const signature = c.req.header('Stripe-Signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
  
  if (!signature || !webhookSecret) {
    return c.json({ error: 'Missing signature or webhook secret', code: 'INVALID_REQUEST' }, 400);
  }
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return c.json({ error: 'Invalid signature', code: 'INVALID_SIGNATURE' }, 400);
  }
  
  const db = getDb(c);
  
  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription, db);
      break;
    }
    
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionDeletion(subscription, db);
      break;
    }
    
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      await handleCheckoutCompleted(session, stripe, db);
      break;
    }
    
    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaid(invoice, db);
      break;
    }
    
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      await handleInvoicePaymentFailed(invoice, db);
      break;
    }
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  
  return c.json({ received: true });
});

/**
 * Handle subscription created/updated webhook
 */
async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  db: any
): Promise<void> {
  await upsertSubscriptionFromStripe(subscription, db);
  
  console.log(`[Billing] Subscription ${subscription.id} updated: ${subscription.status}`);
}

/**
 * Handle subscription deletion webhook
 */
async function handleSubscriptionDeletion(
  subscription: Stripe.Subscription,
  db: any
): Promise<void> {
  await db
    .update(subscriptions)
    .set({
      status: 'cancelled',
      cancelledAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  
  console.log(`[Billing] Subscription ${subscription.id} cancelled`);
}

/**
 * Handle checkout session completed webhook
 */
async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe,
  db: any
): Promise<void> {
  if (session.mode !== 'subscription') {
    return;
  }
  
  if (!session.subscription) {
    return;
  }
  
  // Fetch the subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  await upsertSubscriptionFromStripe(subscription, db);
  
  console.log(`[Billing] Checkout completed for subscription ${subscription.id}`);
}

/**
 * Handle invoice paid webhook
 */
async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  db: any
): Promise<void> {
  if (!invoice.subscription) {
    return;
  }
  
  // Find the subscription
  const subRecord = await db
    .select({
      id: subscriptions.id,
      entityId: subscriptions.entityId,
      entityType: subscriptions.entityType,
    })
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string))
    .limit(1) as unknown as { id: string; entityId: string; entityType: 'user' | 'organisation' }[];
  
  if (subRecord.length === 0) {
    return;
  }
  
  // Create invoice record
  await db
    .insert(invoices)
    .values({
      entityId: subRecord[0]!.entityId,
      entityType: subRecord[0]!.entityType,
      subscriptionId: subRecord[0]!.id,
      stripeInvoiceId: invoice.id,
      currency: invoice.currency,
      status: 'paid',
      subtotalCents: invoice.subtotal || 0,
      taxCents: invoice.tax || 0,
      totalCents: invoice.total || invoice.amount_due || 0,
      amountPaidCents: invoice.amount_paid || 0,
      amountDueCents: invoice.amount_due || 0,
      paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions!.paid_at * 1000) : new Date(),
      invoicePdfUrl: invoice.invoice_pdf,
      invoiceNumber: invoice.number,
      periodStart: invoice.period_start ? new Date(invoice.period_start * 1000) : null,
      periodEnd: invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
    })
    .onConflictDoUpdate({
      target: invoices.stripeInvoiceId,
      set: {
        status: 'paid',
        subtotalCents: invoice.subtotal || 0,
        taxCents: invoice.tax || 0,
        totalCents: invoice.total || invoice.amount_due || 0,
        amountPaidCents: invoice.amount_paid || 0,
        amountDueCents: invoice.amount_due || 0,
        invoicePdfUrl: invoice.invoice_pdf,
        paidAt: invoice.status_transitions?.paid_at ? new Date(invoice.status_transitions!.paid_at * 1000) : new Date(),
      },
    })
    .returning();
  
  console.log(`[Billing] Invoice ${invoice.id} paid`);
}

/**
 * Handle invoice payment failed webhook
 */
async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  db: any
): Promise<void> {
  if (!invoice.subscription) {
    return;
  }
  
  // Update subscription status to past_due
  await db
    .update(subscriptions)
    .set({
      status: 'past_due',
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeSubscriptionId, invoice.subscription as string));
  
  console.log(`[Billing] Invoice ${invoice.id} payment failed`);
}

/**
 * Map Stripe subscription status to our internal status
 */
function mapStripeStatus(stripeStatus: Stripe.Subscription.Status): 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' {
  const statusMap: Record<string, 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired'> = {
    trialing: 'trialing',
    active: 'active',
    past_due: 'past_due',
    canceled: 'cancelled',
    unpaid: 'past_due',
    incomplete: 'past_due',
    incomplete_expired: 'expired',
    paused: 'cancelled',
  };
  
  return statusMap[stripeStatus] || 'expired';
}

export default app;
