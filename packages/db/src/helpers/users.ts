import { eq } from 'drizzle-orm';
import type { DbClient } from '../client.js';
import { users } from '../schema/index.js';

export type InsertUser = typeof users.$inferInsert;
export type SelectUser = typeof users.$inferSelect;

export async function getUser(db: DbClient, userId: string): Promise<SelectUser | null> {
  const result = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, userId),
  });
  return result ?? null;
}

export async function getUserByClerkId(db: DbClient, clerkId: string): Promise<SelectUser | null> {
  const result = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.clerkId, clerkId),
  });
  return result ?? null;
}

export async function createUser(db: DbClient, data: InsertUser): Promise<SelectUser> {
  const [row] = await db.insert(users).values(data).returning();
  return row!;
}

export async function updateUserLastActive(
  db: DbClient,
  userId: string
): Promise<SelectUser | null> {
  const [row] = await db
    .update(users)
    .set({ lastActiveAt: new Date() })
    .where(eq(users.id, userId))
    .returning();
  return row ?? null;
}
