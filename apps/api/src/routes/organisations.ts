/**
 * Organisations routes
 * School and company management
 */

import { Hono } from 'hono';
import { requireAuth, requireRole, getAuth, getDb } from '../middleware/index.js';
import { organisations, orgMembers, orgClasses, classMembers, orgInvitations, orgSettings } from '@typeforge/db';
import { eq, and } from 'drizzle-orm';

const app = new Hono();

// All org routes require authentication
app.use('*', requireAuth);

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
app.post('/', requireRole('org_admin', 'platform_admin'), async (c) => {
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
    orgId: org.id,
    userId: auth.userId,
    role: 'admin',
    status: 'active',
    joinedAt: new Date(),
  });
  
  // Create default org settings
  await db.insert(orgSettings).values({
    orgId: org.id,
  });
  
  return c.json({ organisation: org }, 201);
});

/**
 * GET /organisations/:id - Get organisation details
 */
app.get('/:id', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id');
  
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
  
  return c.json({ 
    organisation: {
      ...org,
      settings,
      userRole: membership.role,
    }
  });
});

/**
 * GET /organisations/:id/classes - List organisation classes
 */
app.get('/:id/classes', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id');
  
  const classes = await db
    .select()
    .from(orgClasses)
    .where(eq(orgClasses.orgId, orgId));
  
  return c.json({ classes });
});

/**
 * GET /organisations/:id/members - List organisation members
 */
app.get('/:id/members', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id');
  
  const members = await db
    .select({
      member: orgMembers,
      user: users,
    })
    .from(orgMembers)
    .innerJoin(users, eq(orgMembers.userId, users.id))
    .where(eq(orgMembers.orgId, orgId));
  
  return c.json({ members });
});

/**
 * POST /organisations/:id/invite - Invite a member
 */
app.post('/:id/invite', async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const orgId = c.req.param('id');
  
  const body = await c.req.json();
  const { email, role, classId } = body;
  
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

export default app;
