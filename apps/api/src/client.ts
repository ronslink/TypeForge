/**
 * TypeForge API - Typed Hono RPC Client
 * 
 * This file exports a fully typed Hono RPC client that can be used
 * by Agent 8 (frontend) to make type-safe API calls.
 * 
 * Usage:
 * ```typescript
 * import { api } from '@typeforge/api/client';
 * 
 * const response = await api.sessions.$post({
 *   json: { wpm: 60, accuracy: 95, ... }
 * });
 * ```
 */

import { hc } from 'hono/client';
import type { Hono } from 'hono';
import type { Env } from '../../../infra/contracts/bindings.js';

// ============================================================================
// Type Definitions for API Responses
// ============================================================================

export type Region = 'EU' | 'US' | 'AF';

export interface Session {
  id: string;
  userId: string;
  lessonId: string | null;
  exerciseId: string | null;
  languageCode: string;
  layoutId: string;
  status: 'in_progress' | 'completed' | 'abandoned';
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  totalCharacters: number;
  correctCharacters: number;
  errors: number;
  wpm: number | null;
  accuracy: number | null;
  rawWpm: number | null;
  consistency: number | null;
  burstWpm: number | null;
  createdAt: string;
}

export interface KeystrokeEvent {
  character: string;
  expected: string;
  correct: boolean;
  timestamp: string;
  keyDownAt: string;
  keyUpAt?: string;
  dwellTime?: number;
  flightTime?: number;
  finger?: string;
  hand?: string;
}

export interface SessionPayload {
  wpm: number;
  accuracy: number;
  keystrokes: KeystrokeEvent[];
  duration: number;
  lessonId?: string;
  language: string;
  layout: string;
  totalCharacters?: number;
  correctCharacters?: number;
  errors?: number;
  rawWpm?: number;
  consistency?: number;
  burstWpm?: number;
}

export interface SessionCreateResponse {
  session: Session;
  xpEarned: number;
  totalXp: number;
  currentLevel: number;
  streak: number;
}

export interface SessionsListResponse {
  sessions: Session[];
}

export interface SessionResponse {
  session: Session;
}

export interface KeystrokesRecordResponse {
  recorded: number;
}

export interface Lesson {
  id: string;
  categoryId: string | null;
  languageCode: string;
  layoutId: string | null;
  title: string;
  slug: string;
  description: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  focusKeys: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Exercise {
  id: string;
  lessonId: string;
  type: 'words' | 'sentences' | 'paragraphs' | 'code' | 'custom';
  content: unknown;
  displayOrder: number;
  createdAt: string;
}

export interface LessonWithExercises extends Lesson {
  exercises: Exercise[];
}

export interface LessonsListResponse {
  lessons: Lesson[];
}

export interface LessonResponse {
  lesson: LessonWithExercises;
}

export interface NextLessonResponse {
  lesson: LessonWithExercises;
  reason: 'weak_area' | 'next_row' | 'spaced_repetition' | 'new_lesson';
  priority: number;
}

export interface LessonCategory {
  id: string;
  languageCode: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  createdAt: string;
}

export interface LessonCategoriesResponse {
  categories: LessonCategory[];
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  rtl: boolean;
  isActive: boolean;
  displayOrder: number;
}

export interface LanguagesResponse {
  languages: Language[];
}

export interface ProgressResponse {
  xp: number;
  level: number;
  streak: number;
  totalSessions: number;
  avgWpm: number;
  avgAccuracy: number;
  history: Session[];
}

export interface WeeklyStats {
  sessions: number;
  wpm: number;
  accuracy: number;
}

export interface ProgressStatsResponse {
  thisWeek: WeeklyStats;
  lastWeek: WeeklyStats;
  improvement: number;
}

// ============================================================================
// Users types
// ============================================================================

export interface UserProfile {
  userId: string;
  bio: string | null;
  timezone: string | null;
  country: string | null;
  avatarUrl: string | null;
}

export interface UserPreferences {
  userId: string;
  theme: string;
  soundEnabled: boolean;
  keyClickVolume: number;
  showLiveWpm: boolean;
  showLiveAccuracy: boolean;
  showKeyboard: boolean;
  language: string;
  layoutId: string;
  updatedAt: string;
}

export interface User {
  id: string;
  clerkId: string;
  email: string;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  role: 'learner' | 'teacher' | 'org_admin' | 'platform_admin';
  status: 'active' | 'suspended' | 'deleted';
  homeRegion: string;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserWithProfile extends User {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
}

export interface UserResponse {
  user: UserWithProfile;
}

export interface UserUpdatePayload {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

export interface UserPreferencesUpdatePayload {
  theme?: string;
  soundEnabled?: boolean;
  keyClickVolume?: number;
  showLiveWpm?: boolean;
  showLiveAccuracy?: boolean;
  showKeyboard?: boolean;
  language?: string;
  layoutId?: string;
}

export interface UserPreferencesResponse {
  preferences: UserPreferences;
}

export interface UserProgressEntry {
  userId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  bestWpm: number | null;
  bestAccuracy: number | null;
  completedAt: string | null;
}

export interface UserProgressResponse {
  progress: UserProgressEntry[];
}

export interface DailyStat {
  userId: string;
  date: string;
  totalSessions: number;
  totalMinutes: number;
  totalCharacters: number;
  lessonsCompleted: number;
  avgWpm: number | null;
  avgAccuracy: number | null;
}

export interface UserStatsResponse {
  stats: DailyStat[];
  totals: {
    totalSessions: number;
    totalMinutes: number;
    totalCharacters: number;
    lessonsCompleted: number;
  };
  averages: {
    wpm: number;
    accuracy: number;
  };
}

export interface KeyMastery {
  userId: string;
  layoutId: string;
  keyCode: string;
  masteryLevel: number;
  totalAttempts: number;
  correctAttempts: number;
  avgFlightTime: number | null;
  updatedAt: string;
}

export interface UserWeaknessesResponse {
  weaknesses: KeyMastery[];
}

// ============================================================================
// Organisations types
// ============================================================================

export interface Organisation {
  id: string;
  name: string;
  slug: string;
  orgType: 'school' | 'company' | 'individual';
  status: 'trial' | 'active' | 'suspended' | 'cancelled';
  homeRegion: string;
  countryCode: string | null;
  website: string | null;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrgMember {
  orgId: string;
  userId: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'invited';
  joinedAt: string | null;
}

export interface OrgSettings {
  orgId: string;
  allowSelfJoin: boolean;
  requireApproval: boolean;
  defaultRole: string;
}

export interface OrgBilling {
  orgId: string;
  stripeSubscriptionId: string | null;
  seatPriceCents: number;
  billingInterval: 'monthly' | 'annual';
  currentSeatCount: number;
  purchasedSeats: number;
  pendingSeatCount: number | null;
  updatedAt: string;
}

export interface OrganisationsListResponse {
  organisations: Array<{ org: Organisation; member: OrgMember }>;
}

export interface OrganisationResponse {
  organisation: Organisation & {
    settings: OrgSettings | null;
    billing: OrgBilling | null;
    userRole: string;
  };
}

export interface OrganisationCreatePayload {
  name: string;
  slug: string;
  orgType?: 'school' | 'company' | 'individual';
  countryCode?: string;
  website?: string;
}

export interface OrgClass {
  id: string;
  orgId: string;
  name: string;
  description: string | null;
  teacherId: string | null;
  createdAt: string;
}

export interface OrgClassesResponse {
  classes: OrgClass[];
}

export interface OrgMembersResponse {
  members: Array<{ member: OrgMember; user: User }>;
}

export interface InvitePayload {
  email: string;
  role?: 'admin' | 'teacher' | 'student';
  classId?: string;
}

export interface InvitationResponse {
  invitation: {
    id: string;
    orgId: string;
    classId: string | null;
    email: string;
    role: string;
    invitedBy: string;
    expiresAt: string;
  };
}

export interface SeatCheckoutPayload {
  seatCount: number;
  successUrl?: string;
  cancelUrl?: string;
}

export interface SeatCheckoutResponse {
  checkoutUrl: string | null;
  sessionId: string;
  seatCount: number;
  monthlyCost: number;
}

export interface SeatUpgradePayload {
  additionalSeats: number;
}

export interface SeatUpgradeResponse {
  success: boolean;
  previousSeats: number;
  newSeats: number;
  additionalSeats: number;
  proratedCharge: boolean;
}

export interface SeatDowngradePayload {
  targetSeats: number;
}

export interface SeatDowngradeResponse {
  success: boolean;
  previousSeats: number;
  newSeats: number;
  effectiveAt: string;
  nextBillingDate: string;
}

export interface SeatsResponse {
  seats: {
    activeMembers: number;
    purchased: number;
    pending: number;
    available: number;
    pricePerSeat: number;
    interval: string;
    monthlyTotal: number;
    hasActiveSubscription: boolean;
  };
  seatAssignments: Array<{ seat: unknown; user: User | null }>;
}

export interface SeatAssignPayload {
  userId: string;
  role?: 'learner' | 'teacher' | 'admin';
}

export interface SeatAssignResponse {
  success: boolean;
  userId: string;
  role: string;
  seatAssigned: boolean;
}

export interface SeatRemoveResponse {
  success: boolean;
  userId: string;
  seatRemoved: boolean;
}

// ============================================================================
// Billing types
// ============================================================================

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  priceMonthly: number | null;
  priceAnnual: number | null;
  stripePriceId: string | null;
  isPublic: boolean;
  displayOrder: number;
  features: unknown;
  createdAt: string;
}

export interface PlansResponse {
  plans: Plan[];
}

export interface Subscription {
  id: string;
  entityId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  status: 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionResponse {
  subscription: { subscription: Subscription; plan: Plan } | undefined;
}

export interface CheckoutPayload {
  interval?: 'monthly' | 'annual';
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutResponse {
  checkoutUrl: string | null;
  sessionId: string;
}

export interface PortalResponse {
  portalUrl: string;
}

export interface Invoice {
  id: string;
  entityId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'void' | 'uncollectible';
  paidAt: string | null;
  pdfUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
}

export interface InvoicesResponse {
  invoices: Invoice[];
}

export interface WebhookResponse {
  received: boolean;
}

// ============================================================================
// Admin types
// ============================================================================

export interface AdminStatsResponse {
  stats: {
    users: number;
    organisations: number;
    sessions: number;
    activeSubscriptions: number;
  };
}

export interface AdminUsersResponse {
  users: User[];
  page: number;
  limit: number;
}

export interface AdminOrganisationsResponse {
  organisations: Organisation[];
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  page: number;
  limit: number;
}

export interface AdminUserStatusPayload {
  status: 'active' | 'suspended' | 'deleted';
}

export interface AdminUserResponse {
  user: User;
}

export interface ApiError {
  error: string;
  code: string;
  message?: string;
  stack?: string;
}

export interface HealthResponse {
  status: 'healthy';
  timestamp: string;
  version: string;
  environment: string;
}

export interface ApiInfoResponse {
  name: string;
  version: string;
  endpoints: {
    sessions: string;
    lessons: string;
    users: string;
    organisations: string;
    billing: string;
    admin: string;
  };
}

// ============================================================================
// Hono RPC Type Definitions
// ============================================================================

/**
 * Type definition for the Sessions API routes
 */
export type SessionsApiType = Hono<
  { Bindings: Env },
  {
    '/': {
      $get: {
        input: {
          query: {
            limit?: string;
          };
        };
        output: SessionsListResponse;
      };
      $post: {
        input: {
          json: SessionPayload;
        };
        output: SessionCreateResponse;
      };
    };
    '/:id': {
      $get: {
        input: {
          param: {
            id: string;
          };
        };
        output: SessionResponse;
      };
      $put: {
        input: {
          param: {
            id: string;
          };
          json: {
            status: 'in_progress' | 'completed' | 'abandoned';
            durationSeconds?: number;
            totalCharacters?: number;
            correctCharacters?: number;
            errors?: number;
            wpm?: number;
            accuracy?: number;
            rawWpm?: number;
            consistency?: number;
            burstWpm?: number;
          };
        };
        output: SessionResponse;
      };
    };
    '/:id/keystrokes': {
      $post: {
        input: {
          param: {
            id: string;
          };
          json: {
            keystrokes: KeystrokeEvent[];
          };
        };
        output: KeystrokesRecordResponse;
      };
    };
  }
>;

/**
 * Type definition for the Lessons API routes
 */
export type LessonsApiType = Hono<
  { Bindings: Env },
  {
    '/': {
      $get: {
        input: {
          query: {
            language?: string;
            layout?: string;
            difficulty?: string;
          };
        };
        output: LessonsListResponse;
      };
    };
    '/next': {
      $get: {
        output: NextLessonResponse;
      };
    };
    '/:id': {
      $get: {
        input: {
          param: {
            id: string;
          };
        };
        output: LessonResponse;
      };
    };
    '/categories': {
      $get: {
        input: {
          query: {
            language?: string;
          };
        };
        output: LessonCategoriesResponse;
      };
    };
    '/languages': {
      $get: {
        output: LanguagesResponse;
      };
    };
  }
>;

/**
 * Type definition for the Users API routes
 */
export type UsersApiType = Hono<
  { Bindings: Env },
  {
    '/me': {
      $get: {
        output: UserResponse;
      };
      $put: {
        input: {
          json: UserUpdatePayload;
        };
        output: UserResponse;
      };
    };
    '/me/preferences': {
      $put: {
        input: {
          json: UserPreferencesUpdatePayload;
        };
        output: UserPreferencesResponse;
      };
    };
    '/me/progress': {
      $get: {
        output: UserProgressResponse;
      };
    };
    '/me/stats': {
      $get: {
        output: UserStatsResponse;
      };
    };
    '/me/weaknesses': {
      $get: {
        input: {
          query: {
            layout?: string;
          };
        };
        output: UserWeaknessesResponse;
      };
    };
  }
>;

/**
 * Type definition for the Organisations API routes
 */
export type OrganisationsApiType = Hono<
  { Bindings: Env },
  {
    '/': {
      $get: {
        output: OrganisationsListResponse;
      };
      $post: {
        input: {
          json: OrganisationCreatePayload;
        };
        output: OrganisationResponse;
      };
    };
    '/:id': {
      $get: {
        input: {
          param: { id: string };
        };
        output: OrganisationResponse;
      };
    };
    '/:id/classes': {
      $get: {
        input: {
          param: { id: string };
        };
        output: OrgClassesResponse;
      };
    };
    '/:id/members': {
      $get: {
        input: {
          param: { id: string };
        };
        output: OrgMembersResponse;
      };
    };
    '/:id/invite': {
      $post: {
        input: {
          param: { id: string };
          json: InvitePayload;
        };
        output: InvitationResponse;
      };
    };
    '/:id/billing/seats': {
      $post: {
        input: {
          param: { id: string };
          json: SeatCheckoutPayload;
        };
        output: SeatCheckoutResponse;
      };
    };
    '/:id/billing/seats/upgrade': {
      $post: {
        input: {
          param: { id: string };
          json: SeatUpgradePayload;
        };
        output: SeatUpgradeResponse;
      };
    };
    '/:id/billing/seats/downgrade': {
      $post: {
        input: {
          param: { id: string };
          json: SeatDowngradePayload;
        };
        output: SeatDowngradeResponse;
      };
    };
    '/:id/seats': {
      $get: {
        input: {
          param: { id: string };
        };
        output: SeatsResponse;
      };
    };
    '/:id/seats/assign': {
      $post: {
        input: {
          param: { id: string };
          json: SeatAssignPayload;
        };
        output: SeatAssignResponse;
      };
    };
    '/:id/seats/:userId': {
      $delete: {
        input: {
          param: { id: string; userId: string };
        };
        output: SeatRemoveResponse;
      };
    };
  }
>;

/**
 * Type definition for the Billing API routes
 */
export type BillingApiType = Hono<
  { Bindings: Env },
  {
    '/plans': {
      $get: {
        output: PlansResponse;
      };
    };
    '/subscription': {
      $get: {
        output: SubscriptionResponse;
      };
    };
    '/checkout': {
      $post: {
        input: {
          json: CheckoutPayload;
        };
        output: CheckoutResponse;
      };
    };
    '/portal': {
      $post: {
        output: PortalResponse;
      };
    };
    '/invoices': {
      $get: {
        output: InvoicesResponse;
      };
    };
    '/webhook': {
      $post: {
        output: WebhookResponse;
      };
    };
  }
>;

/**
 * Type definition for the Admin API routes
 */
export type AdminApiType = Hono<
  { Bindings: Env },
  {
    '/stats': {
      $get: {
        output: AdminStatsResponse;
      };
    };
    '/users': {
      $get: {
        input: {
          query: {
            page?: string;
            limit?: string;
          };
        };
        output: AdminUsersResponse;
      };
    };
    '/organisations': {
      $get: {
        output: AdminOrganisationsResponse;
      };
    };
    '/audit-logs': {
      $get: {
        input: {
          query: {
            page?: string;
            limit?: string;
          };
        };
        output: AuditLogsResponse;
      };
    };
    '/users/:id/status': {
      $put: {
        input: {
          param: { id: string };
          json: AdminUserStatusPayload;
        };
        output: AdminUserResponse;
      };
    };
  }
>;

/**
 * Type definition for the Progress API routes
 */
export type ProgressApiType = Hono<
  { Bindings: Env },
  {
    '/': {
      $get: {
        output: ProgressResponse;
      };
    };
    '/stats': {
      $get: {
        output: ProgressStatsResponse;
      };
    };
  }
>;

/**
 * Combined API type for all routes
 */
export type AppType = Hono<
  { Bindings: Env },
  {
    '/health': {
      $get: {
        output: HealthResponse;
      };
    };
    '/api/v1': {
      $get: {
        output: ApiInfoResponse;
      };
    };
    '/api/v1/sessions': SessionsApiType;
    '/api/v1/lessons': LessonsApiType;
    '/api/v1/progress': ProgressApiType;
    '/api/v1/users': UsersApiType;
    '/api/v1/organisations': OrganisationsApiType;
    '/api/v1/billing': BillingApiType;
    '/api/v1/admin': AdminApiType;
  }
>;

// ============================================================================
// RPC Client Factory
// ============================================================================

/**
 * Create a typed Hono RPC client
 * 
 * @param baseUrl - The base URL of the API (defaults to relative '/')
 * @returns Typed Hono RPC client
 * 
 * @example
 * ```typescript
 * const client = createApiClient('https://api.typeforge.io');
 * const response = await client.api.v1.sessions.$get({ query: { limit: '10' } });
 * ```
 */
export function createApiClient(baseUrl: string = '/') {
  return hc<AppType>(baseUrl);
}

/**
 * Default typed API client instance
 * Uses relative URL for same-origin requests
 */
export const api = createApiClient();

// ============================================================================
// Re-export types for convenience
// ============================================================================

export type {
  Env,
} from '../../../infra/contracts/bindings.js';

// ============================================================================
// Helper types for frontend usage
// ============================================================================

/**
 * Infer the response type from an API endpoint
 * 
 * @example
 * type SessionList = InferResponse<typeof api.api.v1.sessions.$get>;
 */
export type InferResponse<T extends (...args: any[]) => Promise<any>> =
  T extends (...args: any[]) => Promise<infer R> ? R : never;

/**
 * Infer the request input type from an API endpoint
 * 
 * @example
 * type SessionPayload = InferRequest<typeof api.api.v1.sessions.$post>;
 */
export type InferRequest<T extends (...args: any[]) => Promise<any>> =
  T extends (input: infer I) => Promise<any> ? I : never;

// ============================================================================
// Default export
// ============================================================================

export default api;
