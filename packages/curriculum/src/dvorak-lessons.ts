/**
 * Dvorak Simplified Keyboard Lessons
 * 10 progressive lessons focusing on the Dvorak home row (AOEUI DHTNS)
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string | undefined, finger: Finger): LessonChar {
  return { char, code: code!, expectedFinger: finger };
}

// Dvorak key code mapping (physical QWERTY keys produce Dvorak chars)
const DVORAK_KEY_MAP: Record<string, string> = {
  // Row 2 (QWERTY row -> Dvorak top row)
  "'": 'KeyQ',
  ',': 'KeyW',
  '.': 'KeyE',
  'p': 'KeyR',
  'y': 'KeyT',
  'f': 'KeyY',
  'g': 'KeyU',
  'c': 'KeyI',
  'r': 'KeyO',
  'l': 'KeyP',
  '/': 'BracketLeft',
  '=': 'BracketRight',

  // Row 3 (home row) - The Dvorak home row: AOEUI DHTNS
  'a': 'KeyA',
  'o': 'KeyS',
  'e': 'KeyD',
  'u': 'KeyF',
  'i': 'KeyG',
  'd': 'KeyH',
  'h': 'KeyJ',
  't': 'KeyK',
  'n': 'KeyL',
  's': 'Semicolon',
  '-': 'Quote',

  // Row 4 (bottom row)
  ';': 'KeyZ',
  'q': 'KeyX',
  'j': 'KeyC',
  'k': 'KeyV',
  'x': 'KeyB',
  'b': 'KeyN',
  'm': 'KeyM',
  'w': 'Comma',
  'v': 'Period',
  'z': 'Slash',

  // Space
  ' ': 'Space',
};

/**
 * Dvorak Lessons - 10 progressive lessons
 * Heavy focus on the home row: AOEUI DHTNS (all vowels on left hand)
 */
export const dvorakLessons: Lesson[] = [
  // === Lesson 1: Dvorak Home Row - Left Hand Vowels (A, O, E, U, I) ===
  {
    id: 'dv-home-row-left',
    title: 'Dvorak Home Row - Left Hand Vowels (A, O, E, U, I)',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'aoeui',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
    ],
  },

  // === Lesson 2: Dvorak Home Row - Right Hand (D, H, T, N, S) ===
  {
    id: 'dv-home-row-right',
    title: 'Dvorak Home Row - Right Hand (D, H, T, N, S)',
    language: 'en',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'dhtns',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('d', DVORAK_KEY_MAP['d'], 'right_index'),
      createLessonChar('d', DVORAK_KEY_MAP['d'], 'right_index'),
      createLessonChar('d', DVORAK_KEY_MAP['d'], 'right_index'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
    ],
  },

  // === Lesson 3: Dvorak Home Row Complete (AOEUI DHTNS) ===
  {
    id: 'dv-home-row-complete',
    title: 'Dvorak Home Row - Complete (AOEUI DHTNS)',
    language: 'en',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'aoeuidhtns',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('d', DVORAK_KEY_MAP['d'], 'right_index'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('d', DVORAK_KEY_MAP['d'], 'right_index'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
    ],
  },

  // === Lesson 4: Dvorak Common Words - Home Row Only ===
  {
    id: 'dv-home-row-words',
    title: 'Dvorak Words - Home Row Only',
    language: 'en',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'home_row_words',
      speed: 'accuracy',
    },
    content: [
      // ease
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // oath
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // tune
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // shine
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // neat
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
    ],
  },

  // === Lesson 5: Dvorak Top Row - Left Hand (, . P Y) ===
  {
    id: 'dv-top-row-left',
    title: 'Dvorak Top Row - Left Hand (, . P Y)',
    language: 'en',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: ',.py',
      speed: 'accuracy',
    },
    content: [
      createLessonChar(',', DVORAK_KEY_MAP[','], 'left_ring'),
      createLessonChar(',', DVORAK_KEY_MAP[','], 'left_ring'),
      createLessonChar(',', DVORAK_KEY_MAP[','], 'left_ring'),
      createLessonChar('.', DVORAK_KEY_MAP['.'], 'left_middle'),
      createLessonChar('.', DVORAK_KEY_MAP['.'], 'left_middle'),
      createLessonChar('.', DVORAK_KEY_MAP['.'], 'left_middle'),
      createLessonChar('p', DVORAK_KEY_MAP['p'], 'left_index'),
      createLessonChar('p', DVORAK_KEY_MAP['p'], 'left_index'),
      createLessonChar('p', DVORAK_KEY_MAP['p'], 'left_index'),
      createLessonChar('y', DVORAK_KEY_MAP['y'], 'left_index'),
      createLessonChar('y', DVORAK_KEY_MAP['y'], 'left_index'),
      createLessonChar('y', DVORAK_KEY_MAP['y'], 'left_index'),
    ],
  },

  // === Lesson 6: Dvorak Top Row - Right Hand (F G C R L) ===
  {
    id: 'dv-top-row-right',
    title: 'Dvorak Top Row - Right Hand (F, G, C, R, L)',
    language: 'en',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'fgrcl',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('f', DVORAK_KEY_MAP['f'], 'right_index'),
      createLessonChar('f', DVORAK_KEY_MAP['f'], 'right_index'),
      createLessonChar('f', DVORAK_KEY_MAP['f'], 'right_index'),
      createLessonChar('g', DVORAK_KEY_MAP['g'], 'right_index'),
      createLessonChar('g', DVORAK_KEY_MAP['g'], 'right_index'),
      createLessonChar('g', DVORAK_KEY_MAP['g'], 'right_index'),
      createLessonChar('c', DVORAK_KEY_MAP['c'], 'right_middle'),
      createLessonChar('c', DVORAK_KEY_MAP['c'], 'right_middle'),
      createLessonChar('c', DVORAK_KEY_MAP['c'], 'right_middle'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      createLessonChar('l', DVORAK_KEY_MAP['l'], 'right_pinky'),
      createLessonChar('l', DVORAK_KEY_MAP['l'], 'right_pinky'),
      createLessonChar('l', DVORAK_KEY_MAP['l'], 'right_pinky'),
    ],
  },

  // === Lesson 7: Dvorak Bottom Row (Q J K X B M W V Z) ===
  {
    id: 'dv-bottom-row',
    title: 'Dvorak Bottom Row (Q, J, K, X, B, M, W, V, Z)',
    language: 'en',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'qjkxbmwvz',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('q', DVORAK_KEY_MAP['q'], 'left_ring'),
      createLessonChar('q', DVORAK_KEY_MAP['q'], 'left_ring'),
      createLessonChar('j', DVORAK_KEY_MAP['j'], 'left_middle'),
      createLessonChar('j', DVORAK_KEY_MAP['j'], 'left_middle'),
      createLessonChar('k', DVORAK_KEY_MAP['k'], 'left_index'),
      createLessonChar('k', DVORAK_KEY_MAP['k'], 'left_index'),
      createLessonChar('x', DVORAK_KEY_MAP['x'], 'left_index'),
      createLessonChar('x', DVORAK_KEY_MAP['x'], 'left_index'),
      createLessonChar('b', DVORAK_KEY_MAP['b'], 'right_index'),
      createLessonChar('b', DVORAK_KEY_MAP['b'], 'right_index'),
      createLessonChar('m', DVORAK_KEY_MAP['m'], 'right_index'),
      createLessonChar('m', DVORAK_KEY_MAP['m'], 'right_index'),
      createLessonChar('w', DVORAK_KEY_MAP['w'], 'right_middle'),
      createLessonChar('w', DVORAK_KEY_MAP['w'], 'right_middle'),
      createLessonChar('v', DVORAK_KEY_MAP['v'], 'right_ring'),
      createLessonChar('v', DVORAK_KEY_MAP['v'], 'right_ring'),
      createLessonChar('z', DVORAK_KEY_MAP['z'], 'right_pinky'),
      createLessonChar('z', DVORAK_KEY_MAP['z'], 'right_pinky'),
    ],
  },

  // === Lesson 8: Dvorak Common Bigrams ===
  {
    id: 'dv-common-bigrams',
    title: 'Dvorak Common Bigrams (th, in, er, an)',
    language: 'en',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'th_in_er_an',
      speed: 'speed',
    },
    content: [
      // th bigram
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // in bigram
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // er bigram
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // an bigram
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
    ],
  },

  // === Lesson 9: Dvorak Common Words ===
  {
    id: 'dv-common-words',
    title: 'Dvorak Common Words',
    language: 'en',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_words',
      speed: 'speed',
    },
    content: [
      // the
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // and
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('d', DVORAK_KEY_MAP['d'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // for
      createLessonChar('f', DVORAK_KEY_MAP['f'], 'right_index'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // you
      createLessonChar('y', DVORAK_KEY_MAP['y'], 'left_index'),
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // with
      createLessonChar('w', DVORAK_KEY_MAP['w'], 'right_middle'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
    ],
  },

  // === Lesson 10: Dvorak Speed & Endurance ===
  {
    id: 'dv-speed-drill',
    title: 'Dvorak Speed & Endurance Drill',
    language: 'en',
    script: 'latin',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'mixed',
      speed: 'endurance',
    },
    content: [
      // that
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('t', DVORAK_KEY_MAP['t'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // has
      createLessonChar('h', DVORAK_KEY_MAP['h'], 'right_index'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // been
      createLessonChar('b', DVORAK_KEY_MAP['b'], 'right_index'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // one
      createLessonChar('o', DVORAK_KEY_MAP['o'], 'left_ring'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // year
      createLessonChar('y', DVORAK_KEY_MAP['y'], 'left_index'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      createLessonChar('a', DVORAK_KEY_MAP['a'], 'left_pinky'),
      createLessonChar('r', DVORAK_KEY_MAP['r'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // since
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('c', DVORAK_KEY_MAP['c'], 'right_middle'),
      createLessonChar('e', DVORAK_KEY_MAP['e'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // using
      createLessonChar('u', DVORAK_KEY_MAP['u'], 'left_index'),
      createLessonChar('s', DVORAK_KEY_MAP['s'], 'right_pinky'),
      createLessonChar('i', DVORAK_KEY_MAP['i'], 'left_index'),
      createLessonChar('n', DVORAK_KEY_MAP['n'], 'right_ring'),
      createLessonChar('g', DVORAK_KEY_MAP['g'], 'right_index'),
    ],
  },
];

export default dvorakLessons;
