/**
 * Adaptive Lesson Generator
 * Generates ephemeral practice lessons targeting weak keys/bigrams
 */

import type { Exercise, DifficultyLevel } from './types.js';
import { getRandomWords } from './wordlists/index.js';

export interface AdaptiveLessonRequest {
  weakKeys: string[];
  language: string;
  aiGeneratedText?: string;
}

export interface AdaptiveLesson {
  id: string;
  languageCode: string;
  layoutId: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  focusKeys: string[];
  prerequisites: string[];
  estimatedMinutes: number;
  exercises: Exercise[];
}

/**
 * Generate an adaptive lesson focused on weak keys
 */
export function generateAdaptiveLesson(request: AdaptiveLessonRequest): AdaptiveLesson {
  const { weakKeys, language, aiGeneratedText } = request;
  const normalizedLang = language.toLowerCase().trim();

  // Build exercises
  const exercises: Exercise[] = [];

  // 1. Key repetition drill
  exercises.push(generateKeyDrill(weakKeys));

  if (aiGeneratedText) {
    // If AI generated text is provided, use it as the primary practice content
    exercises.push({
      id: `adaptive-ai-${Date.now()}`,
      type: 'paragraphs',
      content: [aiGeneratedText],
      focusKeys: weakKeys,
    });
  } else {
    // 2. Word-based exercise using language wordlist filtered by weak keys
    exercises.push(generateWordExercise(weakKeys, normalizedLang));

    // 3. Sentence patterns
    exercises.push(generateSentenceExercise(weakKeys, normalizedLang));
  }

  const totalChars = exercises.reduce((sum, ex) => sum + (Array.isArray(ex.content) ? ex.content.join(' ').length : 0), 0);
  const estimatedMinutes = Math.max(3, Math.ceil(totalChars / 150));

  return {
    id: `adaptive-${weakKeys.join('-')}-${Date.now()}`,
    languageCode: normalizedLang,
    layoutId: 'qwerty',
    title: `Weak Key Drill: ${weakKeys.join(', ')}`,
    description: `Adaptive practice targeting your weak keys: ${weakKeys.join(', ')}`,
    difficulty: 'intermediate',
    focusKeys: weakKeys,
    prerequisites: [],
    estimatedMinutes,
    exercises,
  };
}

function generateKeyDrill(keys: string[]): Exercise {
  const content: string[] = [];
  for (let i = 0; i < 20; i++) {
    const key = keys[i % keys.length]!;
    content.push(key.repeat(4 + (i % 4)));
  }
  return {
    id: `adaptive-drill-${Date.now()}`,
    type: 'words',
    content,
    focusKeys: keys,
  };
}

function generateWordExercise(keys: string[], language: string): Exercise {
  const words = getRandomWords(language, 100);

  const filtered = words.filter((word) => {
    const lower = word.toLowerCase();
    return keys.some((k) => lower.includes(k.toLowerCase()));
  });

  const selected = filtered.length >= 15 ? filtered.slice(0, 25) : words.slice(0, 25);

  return {
    id: `adaptive-words-${Date.now()}`,
    type: 'words',
    content: selected,
    focusKeys: keys,
  };
}

function generateSentenceExercise(keys: string[], language: string): Exercise {
  const words = getRandomWords(language, 60);

  const filtered = words.filter((word) => {
    const lower = word.toLowerCase();
    return keys.some((k) => lower.includes(k.toLowerCase()));
  });

  const pool = filtered.length >= 10 ? filtered : words;
  const sentences: string[] = [];

  for (let i = 0; i < 10; i++) {
    const sentenceWords: string[] = [];
    const length = 4 + (i % 4);
    for (let j = 0; j < length; j++) {
      const word = pool[(i + j) % pool.length];
      if (word) sentenceWords.push(word);
    }
    sentences.push(sentenceWords.join(' '));
  }

  return {
    id: `adaptive-sentences-${Date.now()}`,
    type: 'sentences',
    content: sentences,
    focusKeys: keys,
  };
}
