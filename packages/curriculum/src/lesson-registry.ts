/**
 * Lesson Registry - Catalog of all available lessons
 */

// Import RTL lessons and wordlists
import { arabicLessons } from './rtl-lessons.js';
import { getRandomWords } from './wordlists/index.js';
export { getRandomWords };

export type Finger =
  | 'left_pinky'
  | 'left_ring'
  | 'left_middle'
  | 'left_index'
  | 'right_index'
  | 'right_middle'
  | 'right_ring'
  | 'right_pinky'
  | 'left_thumb'
  | 'right_thumb';

export interface LessonChar {
  /** The character to type */
  char: string;
  /** The key code for the character */
  code: string;
  /** The expected finger to use */
  expectedFinger: Finger;
}

export interface Lesson {
  /** Unique lesson identifier */
  id: string;
  /** Lesson title */
  title: string;
  /** Language code (e.g., 'en', 'zh', 'es') */
  language: string;
  /** Script type (e.g., 'latin', 'cyrillic', 'han') */
  script: string;
  /** Difficulty level (1-5) */
  difficulty: number;
  /** Tags for categorization */
  tags: {
    /** Which hand: 'left', 'right', or 'both' */
    hand: 'left' | 'right' | 'both';
    /** Primary finger focus */
    finger: Finger | 'all';
    /** Key or bigram focus (e.g., 'f_j', 'th', 'as') */
    key_bigram: string;
    /** Speed focus: 'accuracy', 'speed', or 'endurance' */
    speed: 'accuracy' | 'speed' | 'endurance';
  };
  /** Lesson content - characters to practice */
  content: LessonChar[];
}

/**
 * Helper to generate repetitive character drills
 */
function generateDrill(char: string, code: string, finger: Finger, length: number = 60): LessonChar[] {
  return Array(length).fill(null).map((_, i) => {
    // Every 5 characters, insert a space
    if (i > 0 && (i + 1) % 6 === 0) {
      return { char: ' ', code: 'Space', expectedFinger: 'left_thumb' };
    }
    return { char, code, expectedFinger: finger };
  });
}

/**
 * Helper to generate alternating bigram drills
 */
function generateBigramDrill(
  char1: string, code1: string, finger1: Finger,
  char2: string, code2: string, finger2: Finger,
  length: number = 60
): LessonChar[] {
  return Array(length).fill(null).map((_, i) => {
    if (i > 0 && (i + 1) % 6 === 0) return { char: ' ', code: 'Space', expectedFinger: 'left_thumb' };
    const isFirst = i % 2 === 0;
    return { 
      char: isFirst ? char1 : char2, 
      code: isFirst ? code1 : code2, 
      expectedFinger: isFirst ? finger1 : finger2 
    };
  });
}

/**
 * Complete catalog of lessons organized by difficulty and focus
 */
export let LESSON_CATALOG: Lesson[] = [
  // === Difficulty 1: Home Row Basics ===
  {
    id: 'home-row-left-pinky-a',
    title: 'Home Row Left Pinky - A',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'left_pinky',
      key_bigram: 'a',
      speed: 'accuracy',
    },
    content: generateDrill('a', 'KeyA', 'left_pinky'),
  },
  {
    id: 'home-row-left-ring-s',
    title: 'Home Row Left Ring - S',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'left_ring',
      key_bigram: 's',
      speed: 'accuracy',
    },
    content: generateDrill('s', 'KeyS', 'left_ring'),
  },
  {
    id: 'home-row-left-middle-d',
    title: 'Home Row Left Middle - D',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'left_middle',
      key_bigram: 'd',
      speed: 'accuracy',
    },
    content: generateDrill('d', 'KeyD', 'left_middle'),
  },
  {
    id: 'home-row-left-index-f',
    title: 'Home Row Left Index - F',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'left_index',
      key_bigram: 'f',
      speed: 'accuracy',
    },
    content: generateDrill('f', 'KeyF', 'left_index'),
  },
  {
    id: 'home-row-right-index-j',
    title: 'Home Row Right Index - J',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'right_index',
      key_bigram: 'j',
      speed: 'accuracy',
    },
    content: generateDrill('j', 'KeyJ', 'right_index'),
  },
  {
    id: 'home-row-right-middle-k',
    title: 'Home Row Right Middle - K',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'right_middle',
      key_bigram: 'k',
      speed: 'accuracy',
    },
    content: generateDrill('k', 'KeyK', 'right_middle'),
  },
  {
    id: 'home-row-right-ring-l',
    title: 'Home Row Right Ring - L',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'right_ring',
      key_bigram: 'l',
      speed: 'accuracy',
    },
    content: generateDrill('l', 'KeyL', 'right_ring'),
  },
  {
    id: 'home-row-right-pinky-semicolon',
    title: 'Home Row Right Pinky - ;',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'right_pinky',
      key_bigram: ';',
      speed: 'accuracy',
    },
    content: generateDrill(';', 'Semicolon', 'right_pinky'),
  },
  
  // === Difficulty 2: Home Row Combinations ===
  {
    id: 'home-row-as',
    title: 'Home Row - AS Bigram',
    language: 'en',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'as',
      speed: 'accuracy',
    },
    content: generateBigramDrill('a', 'KeyA', 'left_pinky', 's', 'KeyS', 'left_ring'),
  },
  {
    id: 'home-row-fj',
    title: 'Home Row - FJ Bigram',
    language: 'en',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'fj',
      speed: 'accuracy',
    },
    content: generateBigramDrill('f', 'KeyF', 'left_index', 'j', 'KeyJ', 'right_index'),
  },
  {
    id: 'home-row-all',
    title: 'Home Row - All Keys',
    language: 'en',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'asdfjkl;',
      speed: 'accuracy',
    },
    content: [
      { char: 'a', code: 'KeyA', expectedFinger: 'left_pinky' },
      { char: 's', code: 'KeyS', expectedFinger: 'left_ring' },
      { char: 'd', code: 'KeyD', expectedFinger: 'left_middle' },
      { char: 'f', code: 'KeyF', expectedFinger: 'left_index' },
      { char: 'j', code: 'KeyJ', expectedFinger: 'right_index' },
      { char: 'k', code: 'KeyK', expectedFinger: 'right_middle' },
      { char: 'l', code: 'KeyL', expectedFinger: 'right_ring' },
      { char: ';', code: 'Semicolon', expectedFinger: 'right_pinky' },
    ],
  },
  
  // === Difficulty 3: Top Row ===
  {
    id: 'top-row-qwerty',
    title: 'Top Row - QWERTY',
    language: 'en',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'qwerty',
      speed: 'accuracy',
    },
    content: [
      { char: 'q', code: 'KeyQ', expectedFinger: 'left_pinky' },
      { char: 'w', code: 'KeyW', expectedFinger: 'left_ring' },
      { char: 'e', code: 'KeyE', expectedFinger: 'left_middle' },
      { char: 'r', code: 'KeyR', expectedFinger: 'left_index' },
      { char: 't', code: 'KeyT', expectedFinger: 'left_index' },
      { char: 'y', code: 'KeyY', expectedFinger: 'right_index' },
      { char: 'u', code: 'KeyU', expectedFinger: 'right_index' },
      { char: 'i', code: 'KeyI', expectedFinger: 'right_middle' },
      { char: 'o', code: 'KeyO', expectedFinger: 'right_ring' },
      { char: 'p', code: 'KeyP', expectedFinger: 'right_pinky' },
    ],
  },
  {
    id: 'top-row-th',
    title: 'Top Row - TH Bigram',
    language: 'en',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'th',
      speed: 'speed',
    },
    content: [
      { char: 't', code: 'KeyT', expectedFinger: 'left_index' },
      { char: 'h', code: 'KeyH', expectedFinger: 'right_index' },
      { char: 't', code: 'KeyT', expectedFinger: 'left_index' },
      { char: 'h', code: 'KeyH', expectedFinger: 'right_index' },
      { char: 't', code: 'KeyT', expectedFinger: 'left_index' },
      { char: 'h', code: 'KeyH', expectedFinger: 'right_index' },
    ],
  },
  
  // === Difficulty 4: Bottom Row ===
  {
    id: 'bottom-row-zxcv',
    title: 'Bottom Row - ZXCV',
    language: 'en',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'zxcv',
      speed: 'accuracy',
    },
    content: [
      { char: 'z', code: 'KeyZ', expectedFinger: 'left_pinky' },
      { char: 'x', code: 'KeyX', expectedFinger: 'left_ring' },
      { char: 'c', code: 'KeyC', expectedFinger: 'left_middle' },
      { char: 'v', code: 'KeyV', expectedFinger: 'left_index' },
    ],
  },
  {
    id: 'bottom-row-mnm',
    title: 'Bottom Row - MNM Pattern',
    language: 'en',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'mnm',
      speed: 'speed',
    },
    content: [
      { char: 'm', code: 'KeyM', expectedFinger: 'right_index' },
      { char: 'n', code: 'KeyN', expectedFinger: 'right_index' },
      { char: 'm', code: 'KeyM', expectedFinger: 'right_index' },
      { char: 'n', code: 'KeyN', expectedFinger: 'right_index' },
      { char: 'm', code: 'KeyM', expectedFinger: 'right_index' },
    ],
  },
  
  // === Difficulty 5: Speed & Endurance ===
  {
    id: 'speed-drill-common',
    title: 'Speed Drill - Common Words',
    language: 'en',
    script: 'latin',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'the_and',
      speed: 'speed',
    },
    content: [
      { char: 't', code: 'KeyT', expectedFinger: 'left_index' },
      { char: 'h', code: 'KeyH', expectedFinger: 'right_index' },
      { char: 'e', code: 'KeyE', expectedFinger: 'left_middle' },
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      { char: 'a', code: 'KeyA', expectedFinger: 'left_pinky' },
      { char: 'n', code: 'KeyN', expectedFinger: 'right_index' },
      { char: 'd', code: 'KeyD', expectedFinger: 'left_middle' },
    ],
  },
  {
    id: 'endurance-full-keyboard',
    title: 'Endurance - Full Keyboard',
    language: 'en',
    script: 'latin',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'all_keys',
      speed: 'endurance',
    },
    content: [
      { char: 'q', code: 'KeyQ', expectedFinger: 'left_pinky' },
      { char: 'u', code: 'KeyU', expectedFinger: 'right_index' },
      { char: 'i', code: 'KeyI', expectedFinger: 'right_middle' },
      { char: 'c', code: 'KeyC', expectedFinger: 'left_middle' },
      { char: 'k', code: 'KeyK', expectedFinger: 'right_middle' },
      { char: 'b', code: 'KeyB', expectedFinger: 'left_index' },
      { char: 'r', code: 'KeyR', expectedFinger: 'left_index' },
      { char: 'o', code: 'KeyO', expectedFinger: 'right_ring' },
      { char: 'w', code: 'KeyW', expectedFinger: 'left_ring' },
      { char: 'n', code: 'KeyN', expectedFinger: 'right_index' },
      { char: 'f', code: 'KeyF', expectedFinger: 'left_index' },
      { char: 'o', code: 'KeyO', expectedFinger: 'right_ring' },
      { char: 'x', code: 'KeyX', expectedFinger: 'left_ring' },
    ],
  },
];

/**
 * Get a lesson by its ID
 */
export function getLessonById(id: string): Lesson | undefined {
  return LESSON_CATALOG.find((lesson) => lesson.id === id);
}

/**
 * Get lessons filtered by difficulty level
 */
export function getLessonsByDifficulty(difficulty: number): Lesson[] {
  return LESSON_CATALOG.filter((lesson) => lesson.difficulty === difficulty);
}

/**
 * Get lessons filtered by hand focus
 */
export function getLessonsByHand(hand: 'left' | 'right' | 'both'): Lesson[] {
  return LESSON_CATALOG.filter((lesson) => lesson.tags.hand === hand);
}

/**
 * Get lessons filtered by finger focus
 */
export function getLessonsByFinger(finger: Finger | 'all'): Lesson[] {
  return LESSON_CATALOG.filter((lesson) => lesson.tags.finger === finger);
}

/**
 * Get lessons filtered by key/bigram focus
 */
export function getLessonsByKeyBigram(keyBigram: string): Lesson[] {
  return LESSON_CATALOG.filter((lesson) => lesson.tags.key_bigram === keyBigram);
}

/**
 * Get lessons filtered by script family
 */
export function getLessonsByScript(script: string): Lesson[] {
  return LESSON_CATALOG.filter((lesson) => lesson.script === script);
}

/**
 * Get all RTL lessons (Arabic, Hebrew)
 */
export function getRTLLessons(): Lesson[] {
  return LESSON_CATALOG.filter((lesson) =>
    ['arabic', 'hebrew', 'r-arabic', 'syriac', 'mandaic'].includes(lesson.script)
  );
}



// Append Arabic RTL lessons
LESSON_CATALOG.push(...arabicLessons);

