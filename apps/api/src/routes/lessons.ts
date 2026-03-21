/**
 * Lessons routes
 * Curriculum and lesson management
 */

import { Hono } from 'hono';
import { requireAuth, getAuth } from '../middleware/index.js';
import { getDb } from '../middleware/regional-routing.js';
import { lessons, exercises, lessonCategories, languages, typingSessions, keyMastery } from '@typeforge/db';
import { eq, and, inArray, desc } from 'drizzle-orm';
import { selectNextLesson, type SessionHistoryEntry, type WeakArea } from '@typeforge/curriculum/lesson-selector';
import type { Env } from '../../../../infra/contracts/bindings.js';
import type { Lesson as CurriculumLesson } from '@typeforge/curriculum/types';

const app = new Hono<{ Bindings: Env }>();

/**
 * Type definitions
 */
interface LessonResponse {
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
  createdAt: Date;
  updatedAt: Date;
  exercises?: ExerciseResponse[];
}

interface ExerciseResponse {
  id: string;
  lessonId: string;
  type: 'words' | 'sentences' | 'paragraphs' | 'code' | 'custom';
  content: unknown;
  displayOrder: number;
  createdAt: Date;
}

/**
 * GET /lessons - List available lessons
 */
app.get('/', async (c) => {
  const db = getDb(c);

  const languageCode = c.req.query('language');
  const layoutId = c.req.query('layout');
  const difficulty = c.req.query('difficulty');

  let query = db.select().from(lessons);

  const conditions = [];
  if (languageCode) {
    conditions.push(eq(lessons.languageCode, languageCode));
  }
  if (layoutId) {
    conditions.push(eq(lessons.layoutId, layoutId));
  }
  if (difficulty) {
    conditions.push(eq(lessons.difficulty, difficulty));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const lessonList = await query;

  return c.json({ lessons: lessonList as LessonResponse[] });
});

/**
 * GET /lessons/next - Get the next lesson to practice
 * Calls the curriculum's selectNextLesson() function
 * Returns the next Lesson based on user's session history and weak areas
 */
app.get('/next', requireAuth, async (c) => {
  const auth = getAuth(c)!;
  const db = getDb(c);
  const userId = auth.userId;

  // Get user's session history
  const sessionHistory = await db
    .select({
      lessonId: typingSessions.lessonId,
      completedAt: typingSessions.completedAt,
      accuracy: typingSessions.accuracy,
      wpm: typingSessions.wpm,
      durationSeconds: typingSessions.durationSeconds,
    })
    .from(typingSessions)
    .where(and(eq(typingSessions.userId, userId), eq(typingSessions.status, 'completed')))
    .orderBy(desc(typingSessions.completedAt))
    .limit(100);

  // Get user's key mastery data for weak areas
  const keyMasteryData = await db
    .select({
      key: keyMastery.key,
      masteryLevel: keyMastery.masteryLevel,
      totalAttempts: keyMastery.totalAttempts,
      correctAttempts: keyMastery.correctAttempts,
      lastPracticedAt: keyMastery.lastPracticedAt,
    })
    .from(keyMastery)
    .where(eq(keyMastery.userId, userId));

  // Build weak areas map from key mastery data
  const weakAreas = new Map<string, WeakArea>();
  for (const km of keyMasteryData) {
    const accuracy = km.totalAttempts > 0 ? (km.correctAttempts / km.totalAttempts) * 100 : 100;
    if (accuracy < 85) {
      weakAreas.set(km.key, {
        keyOrBigram: km.key,
        accuracy,
        lastPracticedAt: km.lastPracticedAt || new Date(),
        attemptCount: km.totalAttempts,
      });
    }
  }

  // Build session history entries
  const historyEntries: SessionHistoryEntry[] = sessionHistory
    .filter((s) => s.lessonId && s.completedAt)
    .map((s) => ({
      lessonId: s.lessonId!,
      completedAt: s.completedAt!,
      accuracy: s.accuracy || 0,
      wpm: s.wpm || 0,
      durationSeconds: s.durationSeconds || 0,
    }));

  // Call selectNextLesson from curriculum package
  const nextLesson = await selectNextLesson(userId, historyEntries, weakAreas);

  // Fetch full lesson details from database
  const [dbLesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, nextLesson.id))
    .limit(1);

  if (!dbLesson) {
    return c.json(
      {
        error: 'Lesson not found in database',
        code: 'NOT_FOUND',
      },
      404
    );
  }

  // Get exercises for the lesson
  const lessonExercises = await db
    .select({
      id: exercises.id,
      lessonId: exercises.lessonId,
      type: exercises.type,
      content: exercises.content,
      displayOrder: exercises.displayOrder,
      createdAt: exercises.createdAt,
    })
    .from(exercises)
    .where(eq(exercises.lessonId, dbLesson.id))
    .orderBy(exercises.displayOrder);

  const response: LessonResponse = {
    ...dbLesson,
    exercises: lessonExercises as ExerciseResponse[],
  };

  return c.json({
    lesson: response,
    reason: nextLesson.reason,
    priority: nextLesson.priority,
  });
});

/**
 * GET /lessons/:id - Get a specific lesson with exercises
 */
app.get('/:id', async (c) => {
  const db = getDb(c);
  const lessonId = c.req.param('id');

  const [lesson] = await db
    .select({
      id: lessons.id,
      categoryId: lessons.categoryId,
      languageCode: lessons.languageCode,
      layoutId: lessons.layoutId,
      title: lessons.title,
      slug: lessons.slug,
      description: lessons.description,
      difficulty: lessons.difficulty,
      focusKeys: lessons.focusKeys,
      prerequisites: lessons.prerequisites,
      estimatedMinutes: lessons.estimatedMinutes,
      isActive: lessons.isActive,
      displayOrder: lessons.displayOrder,
      createdAt: lessons.createdAt,
      updatedAt: lessons.updatedAt,
    })
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (!lesson) {
    return c.json({ error: 'Lesson not found', code: 'NOT_FOUND' }, 404);
  }

  // Get exercises for this lesson
  const lessonExercises = await db
    .select({
      id: exercises.id,
      lessonId: exercises.lessonId,
      type: exercises.type,
      content: exercises.content,
      displayOrder: exercises.displayOrder,
      createdAt: exercises.createdAt,
    })
    .from(exercises)
    .where(eq(exercises.lessonId, lessonId))
    .orderBy(exercises.displayOrder);

  return c.json({
    lesson: {
      ...lesson,
      exercises: lessonExercises as ExerciseResponse[],
    } as LessonResponse,
  });
});

/**
 * GET /lessons/categories - List lesson categories
 */
app.get('/categories', async (c) => {
  const db = getDb(c);
  const languageCode = c.req.query('language');

  let query = db.select().from(lessonCategories);

  if (languageCode) {
    query = query.where(eq(lessonCategories.languageCode, languageCode));
  }

  const categories = await query;

  return c.json({ categories });
});

/**
 * GET /languages - List supported languages
 */
app.get('/languages', async (c) => {
  const db = getDb(c);

  const languageList = await db.select().from(languages).where(eq(languages.isActive, true));

  return c.json({ languages: languageList });
});

export default app;
