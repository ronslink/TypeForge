/**
 * Lessons routes
 * Curriculum and lesson management
 */

import { Hono } from 'hono';
import { getDb } from '../middleware/index.js';
import { lessons, exercises, lessonCategories, languages } from '@typeforge/db';
import { eq, and, inArray } from 'drizzle-orm';

const app = new Hono();

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
  
  return c.json({ lessons: lessonList });
});

/**
 * GET /lessons/:id - Get a specific lesson with exercises
 */
app.get('/:id', async (c) => {
  const db = getDb(c);
  const lessonId = c.req.param('id');
  
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(eq(lessons.id, lessonId))
    .limit(1);
  
  if (!lesson) {
    return c.json({ error: 'Lesson not found', code: 'NOT_FOUND' }, 404);
  }
  
  // Get exercises for this lesson
  const lessonExercises = await db
    .select()
    .from(exercises)
    .where(eq(exercises.lessonId, lessonId));
  
  return c.json({ 
    lesson: {
      ...lesson,
      exercises: lessonExercises,
    }
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
  
  const languageList = await db
    .select()
    .from(languages)
    .where(eq(languages.isActive, true));
  
  return c.json({ languages: languageList });
});

export default app;
