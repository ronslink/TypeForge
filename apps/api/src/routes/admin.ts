/**
 * Admin routes
 * Platform administration (platform_admin role required)
 */

import { Hono } from 'hono';
import { requireRole, getDb } from '../middleware/index.js';
import { users, organisations, subscriptions, sessions, auditLogs } from '@typeforge/db';
import { desc, count, sql, eq } from 'drizzle-orm';

const app = new Hono();

// All admin routes require platform_admin role
app.use('*', requireRole('platform_admin'));

/**
 * GET /admin/stats - Platform statistics
 */
app.get('/stats', async (c) => {
  const db = getDb(c);
  
  const [userCount] = await db.select({ count: count() }).from(users);
  const [orgCount] = await db.select({ count: count() }).from(organisations);
  const [sessionCount] = await db.select({ count: count() }).from(sessions);
  const [activeSubCount] = await db
    .select({ count: count() })
    .from(subscriptions)
    .where(sql`${subscriptions.status} = 'active'`);
  
  return c.json({
    stats: {
      users: userCount?.count || 0,
      organisations: orgCount?.count || 0,
      sessions: sessionCount?.count || 0,
      activeSubscriptions: activeSubCount?.count || 0,
    }
  });
});

/**
 * GET /admin/users - List all users (paginated)
 */
app.get('/users', async (c) => {
  const db = getDb(c);
  
  const page = parseInt(c.req.query('page') ?? '1');
  const limit = parseInt(c.req.query('limit') ?? '50');
  const offset = (page - 1) * limit;
  
  const userList = await db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);
  
  return c.json({ users: userList, page, limit });
});

/**
 * GET /admin/organisations - List all organisations
 */
app.get('/organisations', async (c) => {
  const db = getDb(c);
  
  const orgList = await db
    .select()
    .from(organisations)
    .orderBy(desc(organisations.createdAt));
  
  return c.json({ organisations: orgList });
});

/**
 * GET /admin/audit-logs - View audit logs
 */
app.get('/audit-logs', async (c) => {
  const db = getDb(c);
  
  const page = parseInt(c.req.query('page') ?? '1');
  const limit = parseInt(c.req.query('limit') ?? '100');
  const offset = (page - 1) * limit;
  
  const logs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .offset(offset);
  
  return c.json({ logs, page, limit });
});

/**
 * PUT /admin/users/:id/status - Update user status
 */
app.put('/users/:id/status', async (c) => {
  const db = getDb(c);
  const userId = c.req.param('id');
  
  const body = await c.req.json();
  const { status } = body;
  
  const [user] = await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  
  return c.json({ user });
});

export default app;
