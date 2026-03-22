/**
 * Permission helpers
 * Role-based access control and resource authorization
 */

import type { Context } from 'hono';
import type { Env } from '../../../infra/contracts/bindings.js';
import type { ClerkUser } from './clerk.js';
import { getCurrentUser } from './clerk.js';

export interface PermissionContext {
  userId: string;
  role: ClerkUser['role'];
  orgId?: string;
  orgRole?: string;
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
}

/**
 * Check if user can access a specific lesson
 * Teachers/org_admins/platform_admins access freely; learners need active subscription
 */
export async function canAccessLesson(
  ctx: Context<{ Bindings: Env }>,
  _lessonId?: string
): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  // Platform admins can access everything
  if (user.role === 'platform_admin') return true;

  // Teachers and org admins can access freely
  if (['teacher', 'org_admin'].includes(user.role)) return true;

  // Learners need active subscription
  return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
}

/**
 * Check if user has an active subscription
 */
export async function hasActiveSubscription(
  ctx: Context<{ Bindings: Env }>
): Promise<boolean> {
  const user = await getCurrentUser(ctx);
  if (!user) return false;

  return user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing';
}

/**
 * Check if user is an org admin
 */
export function isOrgAdmin(ctx: PermissionContext, orgId?: string): boolean {
  if (ctx.role === 'platform_admin') return true;
  if (ctx.orgRole === 'org_admin') {
    if (orgId) return ctx.orgId === orgId;
    return true;
  }
  return false;
}

/**
 * Check if user is a teacher (or higher)
 */
export function isTeacher(ctx: PermissionContext): boolean {
  return ['teacher', 'org_admin', 'platform_admin'].includes(ctx.role);
}

/**
 * Check if user can view student data
 * Teachers can view students in their org
 */
export function canViewStudentData(
  ctx: PermissionContext,
  studentOrgId?: string
): boolean {
  if (ctx.role === 'platform_admin') return true;
  if (ctx.orgRole === 'org_admin' && ctx.orgId === studentOrgId) return true;
  if (ctx.role === 'teacher' && ctx.orgId === studentOrgId) return true;
  return false;
}

/**
 * Check if user can manage billing
 */
export function canManageBilling(ctx: PermissionContext): boolean {
  return ['org_admin', 'platform_admin'].includes(ctx.role) || ctx.orgRole === 'admin';
}

/**
 * Check if user can create custom lessons
 */
export function canCreateCustomLessons(ctx: PermissionContext): boolean {
  if (ctx.role === 'platform_admin') return true;
  if (isTeacher(ctx)) return true;
  return false;
}

/**
 * Get the permission level for a context
 */
export function getPermissionLevel(ctx: PermissionContext): number {
  switch (ctx.role) {
    case 'platform_admin': return 100;
    case 'org_admin': return 75;
    case 'teacher': return 50;
    case 'learner': return 25;
    default: return 0;
  }
}
