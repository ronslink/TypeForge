import type { DbClient } from '../client.js';
import { typingSessions } from '../schema/index.js';

export type InsertSession = typeof typingSessions.$inferInsert;
export type SelectSession = typeof typingSessions.$inferSelect;

export async function createSession(db: DbClient, data: InsertSession): Promise<SelectSession> {
  const [row] = await db.insert(typingSessions).values(data).returning();
  return row!;
}

export async function getSession(db: DbClient, sessionId: string): Promise<SelectSession | null> {
  const result = await db.query.typingSessions.findFirst({
    where: (s, { eq }) => eq(s.id, sessionId),
  });
  return result ?? null;
}

export async function getUserSessions(
  db: DbClient,
  userId: string,
  limit: number = 20
): Promise<SelectSession[]> {
  return db.query.typingSessions.findMany({
    where: (s, { eq }) => eq(s.userId, userId),
    orderBy: (s, { desc }) => [desc(s.startedAt)],
    limit,
  });
}
