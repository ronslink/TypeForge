/**
 * German QWERTZ Lesson Corpus
 * 15 progressive lessons for learning German QWERTZ typing
 * Including: Home row, QWERTZ top row, bottom row, and Umlaut keys
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters
function c(char: string, code: string, finger: Finger): LessonChar {
  return { char, code, expectedFinger: finger };
}

/**
 * German QWERTZ Lessons - 15 progressive lessons
 */
export const germanLessons: Lesson[] = [
  // === LESSONS 1-4: Home Row (ASDFGHJKL) ===

  // Lesson 1: Home Row Left Hand
  {
    id: 'de-home-left',
    title: 'Deutsche Grundreihe — linke Hand (A S D F G)',
    language: 'de',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'asdfg',
      speed: 'accuracy',
    },
    content: [
      c('a', 'KeyA', 'left_pinky'),
      c('a', 'KeyA', 'left_pinky'),
      c('a', 'KeyA', 'left_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('s', 'KeyS', 'left_ring'),
      c('s', 'KeyS', 'left_ring'),
      c('d', 'KeyD', 'left_middle'),
      c('d', 'KeyD', 'left_middle'),
      c('d', 'KeyD', 'left_middle'),
      c('f', 'KeyF', 'left_index'),
      c('f', 'KeyF', 'left_index'),
      c('f', 'KeyF', 'left_index'),
      c('g', 'KeyG', 'left_index'),
      c('g', 'KeyG', 'left_index'),
      c('g', 'KeyG', 'left_index'),
    ],
  },

  // Lesson 2: Home Row Right Hand
  {
    id: 'de-home-right',
    title: 'Deutsche Grundreihe — rechte Hand (H J K L)',
    language: 'de',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'hjkl',
      speed: 'accuracy',
    },
    content: [
      c('h', 'KeyH', 'right_index'),
      c('h', 'KeyH', 'right_index'),
      c('h', 'KeyH', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('k', 'KeyK', 'right_middle'),
      c('k', 'KeyK', 'right_middle'),
      c('k', 'KeyK', 'right_middle'),
      c('l', 'KeyL', 'right_ring'),
      c('l', 'KeyL', 'right_ring'),
      c('l', 'KeyL', 'right_ring'),
    ],
  },

  // Lesson 3: Home Row Combined
  {
    id: 'de-home-combined',
    title: 'Deutsche Grundreihe — kombiniert',
    language: 'de',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'asdfghjkl',
      speed: 'accuracy',
    },
    content: [
      c('a', 'KeyA', 'left_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('d', 'KeyD', 'left_middle'),
      c('f', 'KeyF', 'left_index'),
      c('g', 'KeyG', 'left_index'),
      c('h', 'KeyH', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('k', 'KeyK', 'right_middle'),
      c('l', 'KeyL', 'right_ring'),
      c('l', 'KeyL', 'right_ring'),
      c('k', 'KeyK', 'right_middle'),
      c('j', 'KeyJ', 'right_index'),
      c('h', 'KeyH', 'right_index'),
      c('g', 'KeyG', 'left_index'),
      c('f', 'KeyF', 'left_index'),
      c('d', 'KeyD', 'left_middle'),
      c('s', 'KeyS', 'left_ring'),
      c('a', 'KeyA', 'left_pinky'),
    ],
  },

  // Lesson 4: German Eszett (ß)
  {
    id: 'de-eszett',
    title: 'Deutsches Eszett (ß)',
    language: 'de',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'right_pinky',
      key_bigram: 'sz',
      speed: 'accuracy',
    },
    content: [
      c('ß', 'Minus', 'right_pinky'),
      c('ß', 'Minus', 'right_pinky'),
      c('ß', 'Minus', 'right_pinky'),
      c('ß', 'Minus', 'right_pinky'),
      c('ß', 'Minus', 'right_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('ß', 'Minus', 'right_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('ß', 'Minus', 'right_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('ß', 'Minus', 'right_pinky'),
    ],
  },

  // === LESSONS 5-9: Row 2 (QWERTZ Top Row) ===

  // Lesson 5: Top Row Left Hand (Q W E R T)
  {
    id: 'de-top-left',
    title: 'Deutsche obere Reihe — linke Hand (Q W E R T)',
    language: 'de',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'qwert',
      speed: 'accuracy',
    },
    content: [
      c('q', 'KeyQ', 'left_pinky'),
      c('q', 'KeyQ', 'left_pinky'),
      c('q', 'KeyQ', 'left_pinky'),
      c('w', 'KeyW', 'left_ring'),
      c('w', 'KeyW', 'left_ring'),
      c('w', 'KeyW', 'left_ring'),
      c('e', 'KeyE', 'left_middle'),
      c('e', 'KeyE', 'left_middle'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('r', 'KeyR', 'left_index'),
      c('r', 'KeyR', 'left_index'),
      c('t', 'KeyT', 'left_index'),
      c('t', 'KeyT', 'left_index'),
      c('t', 'KeyT', 'left_index'),
    ],
  },

  // Lesson 6: Top Row Right Hand (Z U I O P)
  {
    id: 'de-top-right',
    title: 'Deutsche obere Reihe — rechte Hand (Z U I O P)',
    language: 'de',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'zuiop',
      speed: 'accuracy',
    },
    content: [
      c('z', 'KeyY', 'right_index'),
      c('z', 'KeyY', 'right_index'),
      c('z', 'KeyY', 'right_index'),
      c('u', 'KeyU', 'right_index'),
      c('u', 'KeyU', 'right_index'),
      c('u', 'KeyU', 'right_index'),
      c('i', 'KeyI', 'right_middle'),
      c('i', 'KeyI', 'right_middle'),
      c('i', 'KeyI', 'right_middle'),
      c('o', 'KeyO', 'right_ring'),
      c('o', 'KeyO', 'right_ring'),
      c('o', 'KeyO', 'right_ring'),
      c('p', 'KeyP', 'right_pinky'),
      c('p', 'KeyP', 'right_pinky'),
      c('p', 'KeyP', 'right_pinky'),
    ],
  },

  // Lesson 7: Full Top Row (QWERTZ)
  {
    id: 'de-top-full',
    title: 'Deutsche obere Reihe — vollständiges QWERTZ',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'qwertzuiop',
      speed: 'accuracy',
    },
    content: [
      c('q', 'KeyQ', 'left_pinky'),
      c('w', 'KeyW', 'left_ring'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('t', 'KeyT', 'left_index'),
      c('z', 'KeyY', 'right_index'),
      c('u', 'KeyU', 'right_index'),
      c('i', 'KeyI', 'right_middle'),
      c('o', 'KeyO', 'right_ring'),
      c('p', 'KeyP', 'right_pinky'),
      c('p', 'KeyP', 'right_pinky'),
      c('o', 'KeyO', 'right_ring'),
      c('i', 'KeyI', 'right_middle'),
      c('u', 'KeyU', 'right_index'),
      c('z', 'KeyY', 'right_index'),
      c('t', 'KeyT', 'left_index'),
      c('r', 'KeyR', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
      c('w', 'KeyW', 'left_ring'),
      c('q', 'KeyQ', 'left_pinky'),
    ],
  },

  // Lesson 8: Common German Bigrams
  {
    id: 'de-bigrams',
    title: 'Häufige deutsche Bigramme (ER, EN, CH)',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'er_en_ch',
      speed: 'speed',
    },
    content: [
      // er
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      // en
      c('e', 'KeyE', 'left_middle'),
      c('n', 'KeyN', 'right_index'),
      c('e', 'KeyE', 'left_middle'),
      c('n', 'KeyN', 'right_index'),
      // ch
      c('c', 'KeyC', 'left_middle'),
      c('h', 'KeyH', 'right_index'),
      c('c', 'KeyC', 'left_middle'),
      c('h', 'KeyH', 'right_index'),
      // te
      c('t', 'KeyT', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
      c('t', 'KeyT', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
    ],
  },

  // Lesson 9: German Words Practice
  {
    id: 'de-words-basic',
    title: 'Deutsche Grundwörter',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'basic_words',
      speed: 'accuracy',
    },
    content: [
      // "der" (the)
      c('d', 'KeyD', 'left_middle'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c(' ', 'Space', 'left_thumb'),
      // "die" (the)
      c('d', 'KeyD', 'left_middle'),
      c('i', 'KeyI', 'right_middle'),
      c('e', 'KeyE', 'left_middle'),
      c(' ', 'Space', 'left_thumb'),
      // "und" (and)
      c('u', 'KeyU', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('d', 'KeyD', 'left_middle'),
      c(' ', 'Space', 'left_thumb'),
      // "ist" (is)
      c('i', 'KeyI', 'right_middle'),
      c('s', 'KeyS', 'left_ring'),
      c('t', 'KeyT', 'left_index'),
    ],
  },

  // === LESSONS 10-12: Row 4 (Bottom Row Y X C V B N M) ===

  // Lesson 10: Bottom Row Left Hand (Y X C V B)
  {
    id: 'de-bottom-left',
    title: 'Deutsche untere Reihe — linke Hand (Y X C V B)',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'yxcvb',
      speed: 'accuracy',
    },
    content: [
      c('y', 'KeyZ', 'left_pinky'),
      c('y', 'KeyZ', 'left_pinky'),
      c('y', 'KeyZ', 'left_pinky'),
      c('x', 'KeyX', 'left_ring'),
      c('x', 'KeyX', 'left_ring'),
      c('x', 'KeyX', 'left_ring'),
      c('c', 'KeyC', 'left_middle'),
      c('c', 'KeyC', 'left_middle'),
      c('c', 'KeyC', 'left_middle'),
      c('v', 'KeyV', 'left_index'),
      c('v', 'KeyV', 'left_index'),
      c('v', 'KeyV', 'left_index'),
      c('b', 'KeyB', 'left_index'),
      c('b', 'KeyB', 'left_index'),
      c('b', 'KeyB', 'left_index'),
    ],
  },

  // Lesson 11: Bottom Row Right Hand (N M)
  {
    id: 'de-bottom-right',
    title: 'Deutsche untere Reihe — rechte Hand (N M)',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'nm',
      speed: 'accuracy',
    },
    content: [
      c('n', 'KeyN', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('n', 'KeyN', 'right_index'),
    ],
  },

  // Lesson 12: Full Bottom Row
  {
    id: 'de-bottom-full',
    title: 'Deutsche untere Reihe — vollständig (Y X C V B N M)',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'yxcvbnm',
      speed: 'accuracy',
    },
    content: [
      c('y', 'KeyZ', 'left_pinky'),
      c('x', 'KeyX', 'left_ring'),
      c('c', 'KeyC', 'left_middle'),
      c('v', 'KeyV', 'left_index'),
      c('b', 'KeyB', 'left_index'),
      c('n', 'KeyN', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('m', 'KeyM', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('b', 'KeyB', 'left_index'),
      c('v', 'KeyV', 'left_index'),
      c('c', 'KeyC', 'left_middle'),
      c('x', 'KeyX', 'left_ring'),
      c('y', 'KeyZ', 'left_pinky'),
    ],
  },

  // === LESSONS 13-14: Umlaut Keys (Ä Ö Ü) ===

  // Lesson 13: German Umlauts (Ä Ö Ü)
  {
    id: 'de-umlauts',
    title: 'Deutsche Umlaute (Ä Ö Ü)',
    language: 'de',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'right',
      finger: 'right_pinky',
      key_bigram: 'ae_oe_ue',
      speed: 'accuracy',
    },
    content: [
      c('ä', 'Quote', 'right_pinky'),
      c('ä', 'Quote', 'right_pinky'),
      c('ä', 'Quote', 'right_pinky'),
      c('ä', 'Quote', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
      // Sequence
      c('ä', 'Quote', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ä', 'Quote', 'right_pinky'),
    ],
  },

  // Lesson 14: German Words with Umlauts
  {
    id: 'de-words-umlauts',
    title: 'Deutsche Wörter mit Umlauten',
    language: 'de',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'umlaut_words',
      speed: 'accuracy',
    },
    content: [
      // "für" (for)
      c('f', 'KeyF', 'left_index'),
      c('ü', 'BracketLeft', 'right_pinky'),
      c('r', 'KeyR', 'left_index'),
      c(' ', 'Space', 'left_thumb'),
      // "schön" (beautiful)
      c('s', 'KeyS', 'left_ring'),
      c('c', 'KeyC', 'left_middle'),
      c('h', 'KeyH', 'right_index'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('n', 'KeyN', 'right_index'),
      c(' ', 'Space', 'left_thumb'),
      // "ähnlich" (similar)
      c('ä', 'Quote', 'right_pinky'),
      c('h', 'KeyH', 'right_index'),
      c('n', 'KeyN', 'right_index'),
      c('l', 'KeyL', 'right_ring'),
      c('i', 'KeyI', 'right_middle'),
      c('c', 'KeyC', 'left_middle'),
      c('h', 'KeyH', 'right_index'),
    ],
  },

  // === LESSON 15: Endurance ===

  // Lesson 15: German Endurance - Full Keyboard
  {
    id: 'de-endurance',
    title: 'Deutsche Ausdauerübung — komplette Tastatur',
    language: 'de',
    script: 'latin',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'endurance',
      speed: 'endurance',
    },
    content: [
      c('d', 'KeyD', 'left_middle'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c(' ', 'Space', 'left_thumb'),
      c('q', 'KeyQ', 'left_pinky'),
      c('w', 'KeyW', 'left_ring'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('t', 'KeyT', 'left_index'),
      c('z', 'KeyY', 'right_index'),
      c(' ', 'Space', 'left_thumb'),
      c('a', 'KeyA', 'left_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('d', 'KeyD', 'left_middle'),
      c('f', 'KeyF', 'left_index'),
      c('g', 'KeyG', 'left_index'),
      c('h', 'KeyH', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('k', 'KeyK', 'right_middle'),
      c('l', 'KeyL', 'right_ring'),
      c('ä', 'Quote', 'right_pinky'),
      c('ö', 'Semicolon', 'right_pinky'),
      c('ü', 'BracketLeft', 'right_pinky'),
    ],
  },
];

