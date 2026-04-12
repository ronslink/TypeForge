/**
 * French AZERTY Lesson Corpus
 * 10 progressive lessons for learning French AZERTY typing
 * Home row: A S D F G H J K L M
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters
function c(char: string, code: string, finger: Finger): LessonChar {
  return { char, code, expectedFinger: finger };
}

/**
 * French AZERTY Lessons - 10 progressive lessons
 */
export const azertyLessons: Lesson[] = [
  // === Lesson 1: AZERTY Home Row Left Hand (Q S D F G) ===
  {
    id: 'azerty-home-left',
    title: 'AZERTY Home Row - Left Hand (Q S D F G)',
    language: 'fr',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'qsdfg',
      speed: 'accuracy',
    },
    content: [
      c('q', 'KeyA', 'left_pinky'),
      c('q', 'KeyA', 'left_pinky'),
      c('q', 'KeyA', 'left_pinky'),
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

  // === Lesson 2: AZERTY Home Row Right Hand (H J K L M) ===
  {
    id: 'azerty-home-right',
    title: 'AZERTY Home Row - Right Hand (H J K L M)',
    language: 'fr',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'hjklm',
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
      c('m', 'Semicolon', 'right_pinky'),
      c('m', 'Semicolon', 'right_pinky'),
      c('m', 'Semicolon', 'right_pinky'),
    ],
  },

  // === Lesson 3: AZERTY Home Row Combined ===
  {
    id: 'azerty-home-combined',
    title: 'AZERTY Home Row - Combined',
    language: 'fr',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'qsdfghjklm',
      speed: 'accuracy',
    },
    content: [
      c('q', 'KeyA', 'left_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('d', 'KeyD', 'left_middle'),
      c('f', 'KeyF', 'left_index'),
      c('g', 'KeyG', 'left_index'),
      c('h', 'KeyH', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('k', 'KeyK', 'right_middle'),
      c('l', 'KeyL', 'right_ring'),
      c('m', 'Semicolon', 'right_pinky'),
      c('m', 'Semicolon', 'right_pinky'),
      c('l', 'KeyL', 'right_ring'),
      c('k', 'KeyK', 'right_middle'),
      c('j', 'KeyJ', 'right_index'),
      c('h', 'KeyH', 'right_index'),
      c('g', 'KeyG', 'left_index'),
      c('f', 'KeyF', 'left_index'),
      c('d', 'KeyD', 'left_middle'),
      c('s', 'KeyS', 'left_ring'),
      c('q', 'KeyA', 'left_pinky'),
    ],
  },

  // === Lesson 4: AZERTY Top Row Left Hand (A Z E R T) ===
  {
    id: 'azerty-top-left',
    title: 'AZERTY Top Row - Left Hand (A Z E R T)',
    language: 'fr',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'azert',
      speed: 'accuracy',
    },
    content: [
      c('a', 'KeyQ', 'left_pinky'),
      c('a', 'KeyQ', 'left_pinky'),
      c('a', 'KeyQ', 'left_pinky'),
      c('z', 'KeyW', 'left_ring'),
      c('z', 'KeyW', 'left_ring'),
      c('z', 'KeyW', 'left_ring'),
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

  // === Lesson 5: AZERTY Top Row Right Hand (Y U I O P) ===
  {
    id: 'azerty-top-right',
    title: 'AZERTY Top Row - Right Hand (Y U I O P)',
    language: 'fr',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'yuiop',
      speed: 'accuracy',
    },
    content: [
      c('y', 'KeyY', 'right_index'),
      c('y', 'KeyY', 'right_index'),
      c('y', 'KeyY', 'right_index'),
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

  // === Lesson 6: AZERTY Bottom Row (W X C V B N) ===
  {
    id: 'azerty-bottom-row',
    title: 'AZERTY Bottom Row (W X C V B N)',
    language: 'fr',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'wxcvbn',
      speed: 'accuracy',
    },
    content: [
      c('w', 'KeyZ', 'left_pinky'),
      c('w', 'KeyZ', 'left_pinky'),
      c('x', 'KeyX', 'left_ring'),
      c('x', 'KeyX', 'left_ring'),
      c('c', 'KeyC', 'left_middle'),
      c('c', 'KeyC', 'left_middle'),
      c('v', 'KeyV', 'left_index'),
      c('v', 'KeyV', 'left_index'),
      c('b', 'KeyB', 'left_index'),
      c('b', 'KeyB', 'left_index'),
      c('n', 'KeyN', 'right_index'),
      c('n', 'KeyN', 'right_index'),
    ],
  },

  // === Lesson 7: Common French Bigrams (ER, RE, EN, NE) ===
  {
    id: 'azerty-bigrams-common',
    title: 'French Common Bigrams',
    language: 'fr',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'er_re_en_ne',
      speed: 'speed',
    },
    content: [
      // er
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      // re
      c('r', 'KeyR', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('e', 'KeyE', 'left_middle'),
      // en
      c('e', 'KeyE', 'left_middle'),
      c('n', 'KeyN', 'right_index'),
      c('e', 'KeyE', 'left_middle'),
      c('n', 'KeyN', 'right_index'),
      // ne
      c('n', 'KeyN', 'right_index'),
      c('e', 'KeyE', 'left_middle'),
      c('n', 'KeyN', 'right_index'),
      c('e', 'KeyE', 'left_middle'),
    ],
  },

  // === Lesson 8: Common French Words ===
  {
    id: 'azerty-words-common',
    title: 'Common French Words',
    language: 'fr',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_words',
      speed: 'accuracy',
    },
    content: [
      // "le" (the)
      c('l', 'KeyL', 'right_ring'),
      c('e', 'KeyE', 'left_middle'),
      c(' ', 'Space', 'left_thumb'),
      // "la" (the)
      c('l', 'KeyL', 'right_ring'),
      c('a', 'KeyQ', 'left_pinky'),
      c(' ', 'Space', 'left_thumb'),
      // "de" (of)
      c('d', 'KeyD', 'left_middle'),
      c('e', 'KeyE', 'left_middle'),
      c(' ', 'Space', 'left_thumb'),
      // "et" (and)
      c('e', 'KeyE', 'left_middle'),
      c('t', 'KeyT', 'left_index'),
      c(' ', 'Space', 'left_thumb'),
      // "un" (a/one)
      c('u', 'KeyU', 'right_index'),
      c('n', 'KeyN', 'right_index'),
    ],
  },

  // === Lesson 9: AZERTY Speed Drill ===
  {
    id: 'azerty-speed-drill',
    title: 'AZERTY Speed Drill',
    language: 'fr',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'speed_drill',
      speed: 'speed',
    },
    content: [
      c('a', 'KeyQ', 'left_pinky'),
      c('z', 'KeyW', 'left_ring'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('t', 'KeyT', 'left_index'),
      c('y', 'KeyY', 'right_index'),
      c('u', 'KeyU', 'right_index'),
      c('i', 'KeyI', 'right_middle'),
      c('o', 'KeyO', 'right_ring'),
      c('p', 'KeyP', 'right_pinky'),
      c('q', 'KeyA', 'left_pinky'),
      c('s', 'KeyS', 'left_ring'),
      c('d', 'KeyD', 'left_middle'),
      c('f', 'KeyF', 'left_index'),
      c('g', 'KeyG', 'left_index'),
      c('h', 'KeyH', 'right_index'),
      c('j', 'KeyJ', 'right_index'),
      c('k', 'KeyK', 'right_middle'),
      c('l', 'KeyL', 'right_ring'),
      c('m', 'Semicolon', 'right_pinky'),
    ],
  },

  // === Lesson 10: AZERTY Endurance - Full Keyboard ===
  {
    id: 'azerty-endurance',
    title: 'AZERTY Endurance - Full Keyboard',
    language: 'fr',
    script: 'latin',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'endurance',
      speed: 'endurance',
    },
    content: [
      c('l', 'KeyL', 'right_ring'),
      c('e', 'KeyE', 'left_middle'),
      c(' ', 'Space', 'left_thumb'),
      c('f', 'KeyF', 'left_index'),
      c('r', 'KeyR', 'left_index'),
      c('a', 'KeyQ', 'left_pinky'),
      c('n', 'KeyN', 'right_index'),
      c('c', 'KeyC', 'left_middle'),
      c('a', 'KeyQ', 'left_pinky'),
      c('i', 'KeyI', 'right_middle'),
      c('s', 'KeyS', 'left_ring'),
      c(' ', 'Space', 'left_thumb'),
      c('a', 'KeyQ', 'left_pinky'),
      c('z', 'KeyW', 'left_ring'),
      c('e', 'KeyE', 'left_middle'),
      c('r', 'KeyR', 'left_index'),
      c('t', 'KeyT', 'left_index'),
      c('y', 'KeyY', 'right_index'),
      c('u', 'KeyU', 'right_index'),
      c('i', 'KeyI', 'right_middle'),
      c('o', 'KeyO', 'right_ring'),
      c('p', 'KeyP', 'right_pinky'),
    ],
  },
];

export default azertyLessons;
