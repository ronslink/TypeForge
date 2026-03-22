/**
 * @typeforge/auth — Authentication and authorization package
 * Clerk integration, regional routing, permissions, COPPA compliance, SSO
 */

export { getCurrentUser, validateJWT, getAuthState, extractBearerToken, type AuthState, type ClerkUser } from './clerk.js';
export { extractRegionFromClaims, getRegionFromUser, type Region } from './region.js';
export { 
  canAccessLesson, 
  hasActiveSubscription, 
  isOrgAdmin, 
  isTeacher,
  canViewStudentData,
  type PermissionContext 
} from './permissions.js';

// COPPA compliance exports
export {
  isUnder13,
  canCollectData,
  createParentalConsentRequest,
  verifyParentalConsent,
  setParentalConsent,
  getCoppaConsentBanner,
  requireCoppaCompliance,
  type ParentalConsentRequest,
  type ParentalConsentData,
} from './coppa.js';

// Google Workspace SSO exports
export {
  getGoogleAuthUrl,
  exchangeGoogleCode,
  decodeGoogleIdToken,
  getWorkspaceDomain,
  verifyWorkspaceDomain,
  linkUserToOrg,
  handleGoogleWorkspaceSSO,
  generateOAuthState,
  storeOAuthState,
  verifyOAuthState,
  type GoogleTokens,
  type GoogleUserInfo,
  type WorkspaceConfig,
  type OrgMembershipResult,
} from './sso.js';
