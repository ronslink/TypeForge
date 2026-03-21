/**
 * Billing routes
 * Stripe webhook handling and subscription management
 */

import { Hono } from 'hono';
import { requireAuth, getAuth, getDb } from '../middleware/index.js';
import { subscriptions, plans, invoices, subscriptionSeats } from '@typeforge/db';
import { eq } from 'drizzle-orm';

const app = new Hono();

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
 * POST /billing/checkout - Create Stripe checkout session
 */
app.post('/checkout', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  
  const body = await c.req.json();
  const { planId, interval } = body;
  
  // TODO: Create Stripe checkout session
  // This would integrate with Stripe SDK
  
  return c.json({ 
    checkoutUrl: 'https://checkout.stripe.com/placeholder',
    message: 'Stripe integration pending'
  });
});

/**
 * POST /billing/portal - Create Stripe billing portal link
 */
app.post('/portal', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  
  // TODO: Create Stripe billing portal session
  
  return c.json({ 
    portalUrl: 'https://billing.stripe.com/placeholder',
    message: 'Stripe integration pending'
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
  
  return c.json({ invoices: invoiceList });
});

/**
 * POST /billing/webhook - Stripe webhook handler
 */
app.post('/webhook', async (c) => {
  const body = await c.req.text();
  const signature = c.req.header('Stripe-Signature');
  
  // TODO: Verify webhook signature and process event
  
  console.log('Stripe webhook received:', body.substring(0, 100));
  
  return c.json({ received: true });
});

export default app;
