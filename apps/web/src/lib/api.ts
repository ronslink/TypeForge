/**
 * TypeForge API Client
 * Re-export from @typeforge/api/client for use in the web app
 */

export {
  createApiClient,
  api,
  default,
} from '@typeforge/api/client';

export type {
  Region,
  Session,
  KeystrokeEvent,
  SessionPayload,
  SessionCreateResponse,
  SessionsListResponse,
  SessionResponse,
  KeystrokesRecordResponse,
  Lesson,
  Exercise,
  LessonWithExercises,
  LessonsListResponse,
  LessonResponse,
  NextLessonResponse,
  LessonCategory,
  LessonCategoriesResponse,
  Language,
  LanguagesResponse,
  ProgressResponse,
  WeeklyStats,
  ProgressStatsResponse,
  ApiError,
  HealthResponse,
  ApiInfoResponse,
  SessionsApiType,
  LessonsApiType,
  ProgressApiType,
  AppType,
  InferResponse,
  InferRequest,
} from '@typeforge/api/client';
