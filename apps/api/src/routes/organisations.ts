/**
 * Organisations routes
 * School and company management with seat-based billing
 */

import { Hono } from 'hono';
import { requireAuth, requireRole, getAuth, getDb } from '../middleware/index.js';
import { organisations, orgMembers, orgClasses, orgInvitations, orgSettings, orgBilling, subscriptionSeats, users, dailyStats, streaks } from '@typeforge/db';
import { eq, and, or, sql, inArray } from 'drizzle-orm';
import Stripe from 'stripe';

const app = new Hono();

// Org seat pricing: $6/seat/month (in cents)
const SEAT_PRICE_CENTS = 600;
const SEAT_PRICE_ID = process.env.STRIPE_SEAT_PRICE_ID || 'price_seat_placeholder';

// All org routes require authentication
app.use('*', requireAuth);

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

/**
 * GET /organisations - List user's organisations
 */
app.get('/', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  
  // Get orgs where user is a member
  const memberships = await db
    .select({
      org: organisations,
      member: orgMembers,
    })
    .from(orgMembers)
    .innerJoin(organisations, eq(orgMembers.orgId, organisations.id))
    .where(eq(orgMembers.userId, auth.userId));
  
  return c.json({ organisations: memberships });
});

/**
 * POST /organisations - Create a new organisation
 */
app.post('/', async (c) => {
  try {
    const auth = getAuth(c)!;
    const db = getDb(c);
    
    const body = await c.req.json();
    const { name, slug, orgType, countryCode, website } = body;
    
    const [org] = await db.insert(organisations).values({
      name,
      slug,
      orgType: orgType ?? 'school',
      status: 'trial',
      homeRegion: auth.region,
      countryCode,
      website,
    }).returning();
    
    // Add creator as admin
    await db.insert(orgMembers).values({
      orgId: org!.id,
      userId: auth.userId,
      role: 'admin',
      status: 'active',
      joinedAt: new Date(),
    });
    
    // Create default org settings
    await db.insert(orgSettings).values({
      orgId: org!.id,
    });
    
    // Initialize org billing record
    await db.insert(orgBilling).values({
      orgId: org!.id,
      seatPriceCents: SEAT_PRICE_CENTS,
      billingInterval: 'monthly',
      currentSeatCount: 1, // Creator counts as 1 seat
      purchasedSeats: 1,
    });
    
    return c.json({ organisation: org }, 201);
  } catch (err: any) {
    return c.json({ error: err.message, stack: err.stack }, 500);
  }
});

/**
 * GET /organisations/:id - Get organisation details
 */
app.get('/:id', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  const [org] = await db
    .select()
    .from(organisations)
    .where(eq(organisations.id, orgId))
    .limit(1);
  
  if (!org) {
    return c.json({ error: 'Organisation not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Check membership
  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(and(
      eq(orgMembers.orgId, orgId),
      eq(orgMembers.userId, auth.userId)
    ))
    .limit(1);
  
  if (!membership) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }
  
  // Get settings
  const [settings] = await db
    .select()
    .from(orgSettings)
    .where(eq(orgSettings.orgId, orgId))
    .limit(1);
  
  // Get billing info
  const [billing] = await db
    .select()
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  return c.json({ 
    organisation: {
      ...org,
      settings,
      billing,
      userRole: membership.role,
    }
  });
});

/**
 * GET /organisations/:id/classes - List organisation classes
 */
app.get('/:id/classes', async (c) => {
  getAuth(c);
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  const classes = await db
    .select()
    .from(orgClasses)
    .where(eq(orgClasses.orgId, orgId));
  
  return c.json({ classes });
});

/**
 * GET /organisations/:id/dashboard - Get statistical aggregates for org
 */
app.get('/:id/dashboard', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, auth.userId)))
    .limit(1);
    
  if (!membership) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }

  // Get all members
  const allMembers = await db
    .select({ status: orgMembers.status, userId: orgMembers.userId })
    .from(orgMembers)
    .where(eq(orgMembers.orgId, orgId));
    
  const totalMembers = allMembers.length;
  const activeMembers = allMembers.filter(m => m.status === 'active').length;
  const userIds = allMembers.map(m => m.userId).filter(Boolean) as string[];

  let averageAccuracy = 0;
  let averageWpm = 0;
  let totalLessonsCompleted = 0;
  let atRiskCount = 0;

  if (userIds.length > 0) {
    const stats = await db.select({
        userId: dailyStats.userId,
        avgAccuracy: sql<number>`AVG(${dailyStats.avgAccuracy})`,
        avgWpm: sql<number>`AVG(${dailyStats.avgWpm})`,
        lessonsCompleted: sql<number>`SUM(${dailyStats.lessonsCompleted})`
      })
      .from(dailyStats)
      .where(inArray(dailyStats.userId, userIds))
      .groupBy(dailyStats.userId);

    if (stats.length > 0) {
      const totalAccuracy = stats.reduce((sum, s) => sum + (Number(s.avgAccuracy) || 0), 0);
      const totalWpm = stats.reduce((sum, s) => sum + (Number(s.avgWpm) || 0), 0);
      const totalLessons = stats.reduce((sum, s) => sum + (Number(s.lessonsCompleted) || 0), 0);
      averageAccuracy = Math.round(totalAccuracy / stats.length);
      averageWpm = Math.round(totalWpm / stats.length);
      totalLessonsCompleted = totalLessons;
      atRiskCount = stats.filter(s => (Number(s.avgAccuracy) || 0) < 70).length;
    }
  }

  // Get seat info
  const [billing] = await db
    .select({
      purchasedSeats: orgBilling.purchasedSeats,
      currentSeatCount: orgBilling.currentSeatCount,
      seatCooldownDays: orgBilling.seatCooldownDays,
      seatPriceCents: orgBilling.seatPriceCents,
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);

  return c.json({ 
    stats: {
      totalMembers,
      activeMembers,
      averageAccuracy,
      averageWpm,
      totalLessonsCompleted,
      atRiskCount,
      seats: billing ? {
        used: billing.currentSeatCount,
        purchased: billing.purchasedSeats,
        cooldownDays: billing.seatCooldownDays,
        pricePerSeatCents: billing.seatPriceCents,
      } : null,
    }
  });
});

/**
 * GET /organisations/:id/members - List organisation members
 */
app.get('/:id/members', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  const [membership] = await db
    .select()
    .from(orgMembers)
    .where(and(eq(orgMembers.orgId, orgId), eq(orgMembers.userId, auth.userId)))
    .limit(1);
    
  if (!membership) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }

  const rawMembers = await db
    .select({
      member: orgMembers,
      user: users,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, orgId));

  const userIds = rawMembers.map(m => m.user.id);
  
  const stats = userIds.length > 0 
    ? await db.select({
        userId: dailyStats.userId,
        avgWpm: sql<number>`AVG(${dailyStats.avgWpm})`,
        avgAccuracy: sql<number>`AVG(${dailyStats.avgAccuracy})`,
        lessonsCompleted: sql<number>`SUM(${dailyStats.lessonsCompleted})`
      })
      .from(dailyStats)
      .where(inArray(dailyStats.userId, userIds))
      .groupBy(dailyStats.userId)
    : [];

  const userStreaks = userIds.length > 0
    ? await db.select()
      .from(streaks)
      .where(and(inArray(streaks.userId, userIds), eq(streaks.type, 'daily')))
    : [];

  const members = rawMembers.map(m => {
    const userStat = stats.find(s => s.userId === m.user.id);
    const userStreak = userStreaks.find(s => s.userId === m.user.id);
    return {
      id: m.user.id,
      name: m.user.displayName || m.user.firstName || m.user.email?.split('@')[0] || 'Unknown',
      email: m.user.email,
      status: m.member.status,
      lastActive: m.user.lastActiveAt,
      role: m.member.role,
      wpm: userStat ? Math.round(Number(userStat.avgWpm) || 0) : 0,
      accuracy: userStat ? Math.round(Number(userStat.avgAccuracy) || 0) : 0,
      lessonsCompleted: userStat ? Number(userStat.lessonsCompleted) || 0 : 0,
      streak: userStreak ? userStreak.currentStreak : 0,
    };
  });
  
  return c.json({ members });
});

/**
 * POST /organisations/:id/invite - Invite a member
 */
app.post('/:id/invite', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  const body = await c.req.json();
  const { email, role, classId } = body;
  
  // Check if we have available seats
  const [billing] = await db
    .select({
      currentSeatCount: orgBilling.currentSeatCount,
      purchasedSeats: orgBilling.purchasedSeats,
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  if (billing && billing.currentSeatCount >= billing.purchasedSeats) {
    return c.json({ 
      error: 'No available seats. Please purchase more seats.',
      code: 'NO_SEATS_AVAILABLE',
      currentSeats: billing.currentSeatCount,
      purchasedSeats: billing.purchasedSeats,
    }, 403);
  }
  
  // Create invitation
  const [invitation] = await db.insert(orgInvitations).values({
    orgId,
    classId,
    email,
    role: role ?? 'student',
    invitedBy: auth.userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }).returning();
  
  // TODO: Send invitation email
  
  return c.json({ invitation }, 201);
});

/**
 * POST /organisations/:id/billing/seats - Create Stripe subscription for org seat licensing
 */
app.post('/:id/billing/seats', requireRole('org_admin', 'platform_admin'), async (c) => {
  getAuth(c);
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  const stripe = getStripe();
  
  const body = await c.req.json();
  const { seatCount, cooldownDays = 180, successUrl, cancelUrl } = body;
  
  if (!seatCount || seatCount < 1) {
    return c.json({ error: 'Seat count must be at least 1', code: 'INVALID_SEAT_COUNT' }, 400);
  }
  
  if (cooldownDays !== 90 && cooldownDays !== 180) {
    return c.json({ error: 'Cooldown days must be 90 or 180', code: 'INVALID_COOLDOWN' }, 400);
  }
  
  // Get org details
  const [org] = await db
    .select({ name: organisations.name, stripeCustomerId: organisations.stripeCustomerId })
    .from(organisations)
    .where(eq(organisations.id, orgId))
    .limit(1);
  
  if (!org) {
    return c.json({ error: 'Organisation not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Get or create Stripe customer
  let customerId = org.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: org.name,
      metadata: {
        orgId,
        type: 'organisation',
      },
    });
    customerId = customer.id;
    
    // Store customer ID
    await db
      .update(organisations)
      .set({ stripeCustomerId: customerId })
      .where(eq(organisations.id, orgId));
  }
  
  // Create checkout session for seats
  const priceId = cooldownDays === 90 
    ? (process.env.STRIPE_SEAT_PRICE_ID_90 || 'price_seat_90_placeholder') 
    : (process.env.STRIPE_SEAT_PRICE_ID_180 || 'price_seat_180_placeholder');
    
  const priceCents = cooldownDays === 90 ? 600 : 800;

  // Mock checkout fallback if price IDs are not configured
  if (priceId.includes('placeholder')) {
    console.warn(`Mock checkout triggered for org plan. No real Stripe price ID configured.`);
    const mockSessionId = `mock_session_${Date.now()}`;
    const url = (successUrl || `${process.env.APP_URL || 'https://typeforge.io'}/org/${orgId}/billing/success?session_id={CHECKOUT_SESSION_ID}`).replace('{CHECKOUT_SESSION_ID}', mockSessionId);
    return c.json({ 
      checkoutUrl: url,
      sessionId: mockSessionId,
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId as string,
      line_items: [
        {
          price: priceId,
          quantity: seatCount,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${process.env.APP_URL || 'https://typeforge.io'}/org/${orgId}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL || 'https://typeforge.io'}/org/${orgId}/billing/cancel`,
      metadata: {
        orgId,
        type: 'org_seats',
        seatCount: seatCount.toString(),
      },
      subscription_data: {
        metadata: {
          orgId,
          type: 'org_seats',
          seatCount: seatCount.toString(),
          cooldownDays: cooldownDays.toString(),
        },
      },
    });
    
    // Update billing record with pending seat count and cooldown settings
    await db
      .update(orgBilling)
      .set({
        pendingSeatCount: seatCount,
        seatCooldownDays: cooldownDays,
        seatPriceCents: priceCents,
        updatedAt: new Date(),
      })
      .where(eq(orgBilling.orgId, orgId));
    
    return c.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      seatCount,
      cooldownDays,
      monthlyCost: (seatCount * priceCents) / 100,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return c.json({ error: error.message || 'Failed to initialize Stripe checkout' }, 500);
  }
});

/**
 * POST /organisations/:id/billing/seats/upgrade - Add seats with prorated billing
 */
app.post('/:id/billing/seats/upgrade', requireRole('org_admin', 'platform_admin'), async (c) => {
  getAuth(c);
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  const stripe = getStripe();
  
  const body = await c.req.json();
  const { additionalSeats } = body;
  
  if (!additionalSeats || additionalSeats < 1) {
    return c.json({ error: 'Must add at least 1 seat', code: 'INVALID_SEAT_COUNT' }, 400);
  }
  
  // Get current billing info
  const [billing] = await db
    .select({
      stripeSubscriptionId: orgBilling.stripeSubscriptionId,
      currentSeatCount: orgBilling.currentSeatCount,
      purchasedSeats: orgBilling.purchasedSeats,
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  if (!billing?.stripeSubscriptionId) {
    return c.json({ error: 'No active subscription found', code: 'NO_SUBSCRIPTION' }, 404);
  }
  
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
  
  // Find the seat item
  const seatItem = subscription.items.data.find(
    (item) => 
      item.price.id === (process.env.STRIPE_SEAT_PRICE_ID_90 || 'price_seat_90_placeholder') ||
      item.price.id === (process.env.STRIPE_SEAT_PRICE_ID_180 || 'price_seat_180_placeholder') ||
      item.price.id === (process.env.STRIPE_SEAT_PRICE_ID || SEAT_PRICE_ID)
  );
  
  if (!seatItem) {
    return c.json({ error: 'Seat subscription item not found', code: 'ITEM_NOT_FOUND' }, 404);
  }
  
  // Update subscription quantity (prorated)
  const newQuantity = (seatItem.quantity || 1) + additionalSeats;
  
  await stripe.subscriptionItems.update(seatItem.id, {
    quantity: newQuantity,
    proration_behavior: 'create_prorations',
  });
  
  // Update billing record
  await db
    .update(orgBilling)
    .set({
      purchasedSeats: newQuantity,
      updatedAt: new Date(),
    })
    .where(eq(orgBilling.orgId, orgId));
  
  return c.json({
    success: true,
    previousSeats: seatItem.quantity || 1,
    newSeats: newQuantity,
    additionalSeats,
    proratedCharge: true,
  });
});

/**
 * POST /organisations/:id/billing/seats/downgrade - Remove seats at end of billing period
 */
app.post('/:id/billing/seats/downgrade', requireRole('org_admin', 'platform_admin'), async (c) => {
  getAuth(c);
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  const stripe = getStripe();
  
  const body = await c.req.json();
  const { targetSeats } = body;
  
  if (!targetSeats || targetSeats < 1) {
    return c.json({ error: 'Must keep at least 1 seat', code: 'INVALID_SEAT_COUNT' }, 400);
  }
  
  // Get current billing info
  const [billing] = await db
    .select({
      stripeSubscriptionId: orgBilling.stripeSubscriptionId,
      currentSeatCount: orgBilling.currentSeatCount,
      purchasedSeats: orgBilling.purchasedSeats,
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  if (!billing?.stripeSubscriptionId) {
    return c.json({ error: 'No active subscription found', code: 'NO_SUBSCRIPTION' }, 404);
  }
  
  if (targetSeats >= billing.purchasedSeats) {
    return c.json({ error: 'Target seats must be less than current purchased seats', code: 'INVALID_DOWNGRADE' }, 400);
  }
  
  if (targetSeats < billing.currentSeatCount) {
    return c.json({ 
      error: `Cannot reduce to ${targetSeats} seats when ${billing.currentSeatCount} seats are in use`,
      code: 'SEATS_IN_USE',
      currentSeatCount: billing.currentSeatCount,
    }, 400);
  }
  
  // Get current subscription
  const subscription = await stripe.subscriptions.retrieve(billing.stripeSubscriptionId);
  
  // Find the seat item
  const seatItem = subscription.items.data.find(
    (item) => 
      item.price.id === (process.env.STRIPE_SEAT_PRICE_ID_90 || 'price_seat_90_placeholder') ||
      item.price.id === (process.env.STRIPE_SEAT_PRICE_ID_180 || 'price_seat_180_placeholder') ||
      item.price.id === (process.env.STRIPE_SEAT_PRICE_ID || SEAT_PRICE_ID)
  );
  
  if (!seatItem) {
    return c.json({ error: 'Seat subscription item not found', code: 'ITEM_NOT_FOUND' }, 404);
  }
  
  // Schedule quantity update at period end
  await stripe.subscriptionItems.update(seatItem.id, {
    quantity: targetSeats,
    proration_behavior: 'none', // No proration for downgrades at period end
  });
  
  // Update billing record
  await db
    .update(orgBilling)
    .set({
      purchasedSeats: targetSeats,
      updatedAt: new Date(),
    })
    .where(eq(orgBilling.orgId, orgId));
  
  return c.json({
    success: true,
    previousSeats: billing.purchasedSeats,
    newSeats: targetSeats,
    effectiveAt: 'end_of_period',
    nextBillingDate: new Date(subscription.current_period_end * 1000),
  });
});

/**
 * GET /organisations/:id/seats - Get current seat usage vs purchased
 */
app.get('/:id/seats', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  // Check membership
  const [membership] = await db
    .select({ role: orgMembers.role })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.orgId, orgId),
      eq(orgMembers.userId, auth.userId)
    ))
    .limit(1);
  
  if (!membership) {
    return c.json({ error: 'Access denied', code: 'FORBIDDEN' }, 403);
  }
  
  // Get billing info
  const [billing] = await db
    .select({
      currentSeatCount: orgBilling.currentSeatCount,
      purchasedSeats: orgBilling.purchasedSeats,
      pendingSeatCount: orgBilling.pendingSeatCount,
      seatPriceCents: orgBilling.seatPriceCents,
      billingInterval: orgBilling.billingInterval,
      stripeSubscriptionId: orgBilling.stripeSubscriptionId,
      seatCooldownDays: orgBilling.seatCooldownDays,
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  if (!billing) {
    return c.json({ error: 'Billing info not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Count active members
  const memberCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(orgMembers)
    .where(and(
      eq(orgMembers.orgId, orgId),
      eq(orgMembers.status, 'active')
    ));
  
  const activeMembers = memberCount[0]?.count || 0;
  
  // Get detailed seat assignments
  const seatDetails = await db
    .select({
      seat: subscriptionSeats,
      user: users,
    })
    .from(subscriptionSeats)
    .leftJoin(users, eq(subscriptionSeats.userId, users.id))
    .where(eq(subscriptionSeats.orgId, orgId));
  
  const [seatCountRecord] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptionSeats)
    .where(and(
      eq(subscriptionSeats.orgId, orgId),
      or(
        sql`${subscriptionSeats.revokedAt} IS NULL`,
        sql`${subscriptionSeats.reassignableAt} > NOW()`
      )
    ));
  const dynamicSeatCount = Number(seatCountRecord?.count || 0);
  
  // Sync the cached count
  await db.update(orgBilling)
    .set({ currentSeatCount: dynamicSeatCount })
    .where(eq(orgBilling.orgId, orgId));

  return c.json({
    seats: {
      activeMembers,
      purchased: billing.purchasedSeats,
      pending: billing.pendingSeatCount || 0,
      available: Math.max(0, billing.purchasedSeats - dynamicSeatCount),
      pricePerSeat: billing.seatPriceCents / 100,
      interval: billing.billingInterval,
      monthlyTotal: (billing.purchasedSeats * billing.seatPriceCents) / 100,
      hasActiveSubscription: !!billing.stripeSubscriptionId,
      seatCooldownDays: billing.seatCooldownDays,
    },
    seatAssignments: seatDetails,
  });
});

/**
 * POST /organisations/:id/seats/assign - Assign a seat to a user
 */
app.post('/:id/seats/assign', requireRole('org_admin', 'teacher'), async (c) => {
  getAuth(c);
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  
  const body = await c.req.json();
  const { userId, role = 'learner' } = body;
  
  // Check available seats
  const [billing] = await db
    .select({
      currentSeatCount: orgBilling.currentSeatCount,
      purchasedSeats: orgBilling.purchasedSeats,
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  if (!billing) {
    return c.json({ error: 'Billing info not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Calculate dynamic seat usage
  const [seatCountRecord] = await db
    .select({ count: sql<number>`count(*)` })
    .from(subscriptionSeats)
    .where(and(
      eq(subscriptionSeats.orgId, orgId),
      or(
        sql`${subscriptionSeats.revokedAt} IS NULL`,
        sql`${subscriptionSeats.reassignableAt} > NOW()`
      )
    ));
  const dynamicSeatCount = Number(seatCountRecord?.count || 0);
  
  if (dynamicSeatCount >= billing.purchasedSeats) {
    return c.json({ 
      error: 'No available seats',
      code: 'NO_SEATS_AVAILABLE',
    }, 403);
  }
  
  // Check if user is already a member
  const [existingMember] = await db
    .select()
    .from(orgMembers)
    .where(and(
      eq(orgMembers.orgId, orgId),
      eq(orgMembers.userId, userId)
    ))
    .limit(1);
  
  if (existingMember) {
    return c.json({ error: 'User is already a member', code: 'ALREADY_MEMBER' }, 409);
  }
  
  // Add member
  await db.insert(orgMembers).values({
    orgId,
    userId,
    role,
    status: 'active',
    joinedAt: new Date(),
  });
  
  // Try to claim a cooled-down seat first
  const [expiredSeat] = await db.select()
    .from(subscriptionSeats)
    .where(and(
      eq(subscriptionSeats.orgId, orgId),
      sql`${subscriptionSeats.revokedAt} IS NOT NULL`,
      sql`${subscriptionSeats.reassignableAt} <= NOW()`
    ))
    .limit(1);

  if (expiredSeat) {
    await db.update(subscriptionSeats).set({
      userId,
      allocatedAt: new Date(),
      revokedAt: null,
      reassignableAt: null,
    }).where(eq(subscriptionSeats.id, expiredSeat.id));
  } else {
    await db.insert(subscriptionSeats).values({
      orgId,
      userId,
      allocatedAt: new Date(),
    });
  }
  
  // Update seat count cache
  await db
    .update(orgBilling)
    .set({
      currentSeatCount: dynamicSeatCount + 1,
      updatedAt: new Date(),
    })
    .where(eq(orgBilling.orgId, orgId));
  
  return c.json({
    success: true,
    userId,
    role,
    seatAssigned: true,
  }, 201);
});

/**
 * DELETE /organisations/:id/seats/:userId - Remove a seat assignment
 */
app.delete('/:id/seats/:userId', requireRole('org_admin', 'teacher'), async (c) => {
  getAuth(c);
  const db = getDb(c);
  const orgId = c.req.param('id') as string;
  const targetUserId = c.req.param('userId') as string;
  
  // Get current billing info
  const [billing] = await db
    .select({ 
      currentSeatCount: orgBilling.currentSeatCount,
      seatCooldownDays: orgBilling.seatCooldownDays 
    })
    .from(orgBilling)
    .where(eq(orgBilling.orgId, orgId))
    .limit(1);
  
  if (!billing) {
    return c.json({ error: 'Billing info not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Remove member
  await db
    .delete(orgMembers)
    .where(and(
      eq(orgMembers.orgId, orgId),
      eq(orgMembers.userId, targetUserId)
    ));
  
  // Mark seat as revoked and set cooldown
  const cooldownDays = billing.seatCooldownDays || 180;
  const reassignableAt = new Date(Date.now() + cooldownDays * 24 * 60 * 60 * 1000);

  await db
    .update(subscriptionSeats)
    .set({
      revokedAt: new Date(),
      reassignableAt,
    })
    .where(and(
      eq(subscriptionSeats.orgId, orgId),
      eq(subscriptionSeats.userId, targetUserId)
    ));
  
  // We do NOT decrement the cached seat count immediately because the seat is in cooldown.
  // The seat is still considered "active" towards the quota.
  await db
    .update(orgBilling)
    .set({
      updatedAt: new Date(),
    })
    .where(eq(orgBilling.orgId, orgId));
  
  return c.json({
    success: true,
    userId: targetUserId,
    seatRemoved: true,
  });
});

export default app;
