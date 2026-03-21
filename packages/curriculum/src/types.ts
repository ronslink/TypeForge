/**
 * Curriculum types and interfaces
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Lesson {
  id: string;
  languageCode: string;
  layoutId: string;
  title: string;
  description?: string;
  difficulty: DifficultyLevel;
  focusKeys: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  exercises: Exercise[];
}

export interface Exercise {
  id: string;
  type: 'words' | 'sentences' | 'paragraphs' | 'code';
  content: string[];
  focusKeys?: string[];
}

export interface LessonProgress {
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  attempts: number;
  bestWpm: number;
  bestAccuracy: number;
  completedAt?: Date;
}

export interface UserProgress {
  userId: string;
  languageCode: string;
  layoutId: string;
  lessons: Map<string, LessonProgress>;
  keyMastery: Map<string, number>; // key -> mastery level (0-100)
  totalXp: number;
  currentLevel: number;
}

export interface SchedulerConfig {
  /** Minimum accuracy to consider a lesson mastered */
  masteryThreshold: number;
  /** Weight for recent performance in scheduling */
  recencyWeight: number;
  /** Weight for difficulty in scheduling */
  difficultyWeight: number;
  /** Weight for key mastery gaps in scheduling */
  gapWeight: number;
  /** Spaced repetition intervals (days) */
  spacedRepetitionIntervals: number[];
}

export interface ScheduledLesson {
  lessonId: string;
  reason: 'new' | 'review' | 'weakness' | 'prerequisite';
  priority: number;
  scheduledFor: Date;
}
