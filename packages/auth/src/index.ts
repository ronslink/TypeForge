/**
 * @typeforge/auth — Authentication and authorization package
 * Clerk integration, regional routing, permissions
 */

export { getCurrentUser, validateJWT, getAuthState, type AuthState, type ClerkUser } from './clerk.js';
export { extractRegionFromClaims, getRegionFromUser, type Region } from './region.js';
export { 
  canAccessLesson, 
  hasActiveSubscription, 
  isOrgAdmin, 
  isTeacher,
  canViewStudentData,
  type PermissionContext 
} from './permissions.js';
