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
