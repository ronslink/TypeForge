/**
 * Permission helpers
 * Role-based access control and resource authorization
 */

import type { ClerkUser } from './clerk.js';

export interface PermissionContext {
  userId: string;
  role: ClerkUser['role'];
  orgId?: string;
  orgRole?: string;
  subscriptionStatus?: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
}

/**
 * Check if user can access a specific lesson
 */
export function canAccessLesson(
  ctx: PermissionContext,
  lesson: { id: string; isPremium?: boolean; orgId?: string }
): boolean {
  // Platform admins can access everything
  if (ctx.role === 'platform_admin') return true;
  
  // Free lessons are accessible to all
  if (!lesson.isPremium) return true;
  
  // Premium lessons require active subscription
  if (ctx.subscriptionStatus === 'active' || ctx.subscriptionStatus === 'trialing') {
    return true;
  }
  
  // Org members can access org-licensed lessons
  if (lesson.orgId && ctx.orgId === lesson.orgId) {
    return true;
  }
  
  return false;
}

/**
 * Check if user has an active subscription
 */
export function hasActiveSubscription(ctx: PermissionContext): boolean {
  return ctx.subscriptionStatus === 'active' || ctx.subscriptionStatus === 'trialing';
}

/**
 * Check if user is an org admin
 */
export function isOrgAdmin(ctx: PermissionContext, orgId?: string): boolean {
  if (ctx.role === 'platform_admin') return true;
  if (ctx.orgRole === 'org_admin') {
    if (orgId) {
      return ctx.orgId === orgId;
    }
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
  // Platform admins can view all
  if (ctx.role === 'platform_admin') return true;
  
  // Org admins can view students in their org
  if (ctx.orgRole === 'org_admin' && ctx.orgId === studentOrgId) {
    return true;
  }
  
  // Teachers can view students in their org
  if (ctx.role === 'teacher' && ctx.orgId === studentOrgId) {
    return true;
  }
  
  return false;
}

/**
 * Check if user can manage billing
 */
export function canManageBilling(ctx: PermissionContext): boolean {
  return ['org_admin', 'platform_admin'].includes(ctx.role) || 
         ctx.orgRole === 'admin';
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
    case 'platform_admin':
      return 100;
    case 'org_admin':
      return 75;
    case 'teacher':
      return 50;
    case 'learner':
    default:
      return 25;
  }
}
