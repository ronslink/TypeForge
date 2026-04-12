/*
 * Japanese Romaji Lessons - 10 progressive lessons for typing Japanese using Latin characters
 * Romaji uses standard QWERTY keys, with focus on Japanese romanization patterns
 */

import type { Lesson, LessonChar } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function char(c: string, code: string, finger: string): LessonChar {
  return { char: c, code, expectedFinger: finger as any };
}

// Space helper
function space(): LessonChar {
  return { char: ' ', code: 'Space', expectedFinger: 'left_thumb' };
}

/**
 * Japanese Romaji Lessons - 10 progressive lessons
 * Focus on romanization patterns: long vowels, doubled consonants, nasal 'n'
 */
export const japaneseLessons: Lesson[] = [
  // === Lesson 1: Basic Hiragana Romaji - Home Row Vowels (a-i-u-e-o) ===
  {
    id: 'ja-romaji-1',
    title: 'Japanese Romaji - Basic Vowels (a-i-u-e-o)',
    language: 'ja',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'hiragana_vowels',
      speed: 'accuracy',
    },
    content: [
      char('a', 'KeyA', 'left_pinky'),
      char('a', 'KeyA', 'left_pinky'),
      char('a', 'KeyA', 'left_pinky'),
      char('i', 'KeyI', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      char('u', 'KeyU', 'right_index'),
      char('u', 'KeyU', 'right_index'),
      char('u', 'KeyU', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
      char('e', 'KeyE', 'left_middle'),
      char('e', 'KeyE', 'left_middle'),
      char('o', 'KeyO', 'right_ring'),
      char('o', 'KeyO', 'right_ring'),
      char('o', 'KeyO', 'right_ring'),
      // Simple words
      char('a', 'KeyA', 'left_pinky'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      char('a', 'KeyA', 'left_pinky'),
      char('o', 'KeyO', 'right_ring'),
      space(),
      char('u', 'KeyU', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
    ],
  },

  // === Lesson 2: Basic Consonant-Vowel Combinations (ka-sa-ta-na) ===
  {
    id: 'ja-romaji-2',
    title: 'Japanese Romaji - K/S/T/N Row (ka-ki-ku-ke-ko)',
    language: 'ja',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'k_s_t_n_rows',
      speed: 'accuracy',
    },
    content: [
      // ka-ki-ku-ke-ko
      char('k', 'KeyK', 'right_middle'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      char('k', 'KeyK', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      char('k', 'KeyK', 'right_middle'),
      char('u', 'KeyU', 'right_index'),
      space(),
      char('k', 'KeyK', 'right_middle'),
      char('e', 'KeyE', 'left_middle'),
      space(),
      char('k', 'KeyK', 'right_middle'),
      char('o', 'KeyO', 'right_ring'),
      space(),
      // sa-shi-su-se-so
      char('s', 'KeyS', 'left_ring'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      char('s', 'KeyS', 'left_ring'),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      char('s', 'KeyS', 'left_ring'),
      char('u', 'KeyU', 'right_index'),
    ],
  },

  // === Lesson 3: More Consonant Rows (ha-ma-ya-ra-wa) ===
  {
    id: 'ja-romaji-3',
    title: 'Japanese Romaji - H/M/Y/R/W Rows',
    language: 'ja',
    script: 'latin',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'h_m_y_r_w_rows',
      speed: 'accuracy',
    },
    content: [
      // ha-hi-fu-he-ho
      char('h', 'KeyH', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      char('f', 'KeyF', 'left_index'),
      char('u', 'KeyU', 'right_index'),
      space(),
      // ma-mi-mu-me-mo
      char('m', 'KeyM', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      char('m', 'KeyM', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      char('m', 'KeyM', 'right_index'),
      char('u', 'KeyU', 'right_index'),
      space(),
      // ya-yu-yo
      char('y', 'KeyY', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      char('y', 'KeyY', 'right_index'),
      char('u', 'KeyU', 'right_index'),
    ],
  },

  // === Lesson 4: Simple Japanese Words ===
  {
    id: 'ja-romaji-4',
    title: 'Japanese Romaji - Simple Words',
    language: 'ja',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'simple_words',
      speed: 'accuracy',
    },
    content: [
      // neko (cat)
      char('n', 'KeyN', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
      char('k', 'KeyK', 'right_middle'),
      char('o', 'KeyO', 'right_ring'),
      space(),
      // inu (dog)
      char('i', 'KeyI', 'right_middle'),
      char('n', 'KeyN', 'right_index'),
      char('u', 'KeyU', 'right_index'),
      space(),
      // sakura (cherry blossom)
      char('s', 'KeyS', 'left_ring'),
      char('a', 'KeyA', 'left_pinky'),
      char('k', 'KeyK', 'right_middle'),
      char('u', 'KeyU', 'right_index'),
      char('r', 'KeyR', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      // sushi
      char('s', 'KeyS', 'left_ring'),
      char('u', 'KeyU', 'right_index'),
      char('s', 'KeyS', 'left_ring'),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
    ],
  },

  // === Lesson 5: Long Vowels (double vowels: aa, ii, uu, ee, oo) ===
  {
    id: 'ja-romaji-5',
    title: 'Japanese Romaji - Long Vowels (aa, ii, uu, ee, oo)',
    language: 'ja',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'long_vowels',
      speed: 'accuracy',
    },
    content: [
      // Practice long vowel patterns
      char('o', 'KeyO', 'right_ring'),
      char('o', 'KeyO', 'right_ring'),
      space(),
      char('k', 'KeyK', 'right_middle'),
      char('o', 'KeyO', 'right_ring'),
      char('o', 'KeyO', 'right_ring'),
      space(),
      char('s', 'KeyS', 'left_ring'),
      char('a', 'KeyA', 'left_pinky'),
      char('n', 'KeyN', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      // koohii (coffee)
      char('k', 'KeyK', 'right_middle'),
      char('o', 'KeyO', 'right_ring'),
      char('o', 'KeyO', 'right_ring'),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      // raamen (ramen)
      char('r', 'KeyR', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('a', 'KeyA', 'left_pinky'),
      char('m', 'KeyM', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
      char('n', 'KeyN', 'right_index'),
    ],
  },

  // === Lesson 6: Doubled Consonants (small tsu: kk, ss, tt, pp) ===
  {
    id: 'ja-romaji-6',
    title: 'Japanese Romaji - Doubled Consonants (kk, ss, tt, pp)',
    language: 'ja',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'doubled_consonants',
      speed: 'accuracy',
    },
    content: [
      // kitte (stamp)
      char('k', 'KeyK', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      char('t', 'KeyT', 'left_index'),
      char('t', 'KeyT', 'left_index'),
      char('e', 'KeyE', 'left_middle'),
      space(),
      // gakkou (school)
      char('g', 'KeyG', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('k', 'KeyK', 'right_middle'),
      char('k', 'KeyK', 'right_middle'),
      char('o', 'KeyO', 'right_ring'),
      char('u', 'KeyU', 'right_index'),
      space(),
      // zasshi (magazine)
      char('z', 'KeyZ', 'left_pinky'),
      char('a', 'KeyA', 'left_pinky'),
      char('s', 'KeyS', 'left_ring'),
      char('s', 'KeyS', 'left_ring'),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      // ippai (full/a lot)
      char('i', 'KeyI', 'right_middle'),
      char('p', 'KeyP', 'right_pinky'),
      char('p', 'KeyP', 'right_pinky'),
      char('a', 'KeyA', 'left_pinky'),
      char('i', 'KeyI', 'right_middle'),
    ],
  },

  // === Lesson 7: Nasal 'n' (n before consonants) ===
  {
    id: 'ja-romaji-7',
    title: 'Japanese Romaji - Nasal "n" (n before consonants)',
    language: 'ja',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'nasal_n',
      speed: 'accuracy',
    },
    content: [
      // hon (book)
      char('h', 'KeyH', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // nihon (Japan)
      char('n', 'KeyN', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('h', 'KeyH', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // hantai (opposite)
      char('h', 'KeyH', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('n', 'KeyN', 'right_index'),
      char('t', 'KeyT', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('i', 'KeyI', 'right_middle'),
      space(),
      // densha (train)
      char('d', 'KeyD', 'left_middle'),
      char('e', 'KeyE', 'left_middle'),
      char('n', 'KeyN', 'right_index'),
      char('s', 'KeyS', 'left_ring'),
      char('h', 'KeyH', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
    ],
  },

  // === Lesson 8: Common Phrases Part 1 ===
  {
    id: 'ja-romaji-8',
    title: 'Japanese Romaji - Common Phrases (Part 1)',
    language: 'ja',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_phrases',
      speed: 'accuracy',
    },
    content: [
      // konnichiwa (hello)
      char('k', 'KeyK', 'right_middle'),
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      char('n', 'KeyN', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('c', 'KeyC', 'left_middle'),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('w', 'KeyW', 'left_ring'),
      char('a', 'KeyA', 'left_pinky'),
      space(),
      // arigatou (thank you)
      char('a', 'KeyA', 'left_pinky'),
      char('r', 'KeyR', 'left_index'),
      char('i', 'KeyI', 'right_middle'),
      char('g', 'KeyG', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('t', 'KeyT', 'left_index'),
      char('o', 'KeyO', 'right_ring'),
      char('u', 'KeyU', 'right_index'),
      space(),
      // sayounara (goodbye)
      char('s', 'KeyS', 'left_ring'),
      char('a', 'KeyA', 'left_pinky'),
      char('y', 'KeyY', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('u', 'KeyU', 'right_index'),
      char('n', 'KeyN', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('r', 'KeyR', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
    ],
  },

  // === Lesson 9: Common Phrases Part 2 (Polite Forms) ===
  {
    id: 'ja-romaji-9',
    title: 'Japanese Romaji - Polite Phrases & Expressions',
    language: 'ja',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'polite_phrases',
      speed: 'accuracy',
    },
    content: [
      // onegaishimasu (please)
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
      char('g', 'KeyG', 'left_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('i', 'KeyI', 'right_middle'),
      char('s', 'KeyS', 'left_ring'),
      char('h', 'KeyH', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('m', 'KeyM', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('s', 'KeyS', 'left_ring'),
      char('u', 'KeyU', 'right_index'),
      space(),
      // sumimasen (excuse me/sorry)
      char('s', 'KeyS', 'left_ring'),
      char('u', 'KeyU', 'right_index'),
      char('m', 'KeyM', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('m', 'KeyM', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('s', 'KeyS', 'left_ring'),
      char('e', 'KeyE', 'left_middle'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // ohayou gozaimasu (good morning)
      char('o', 'KeyO', 'right_ring'),
      char('h', 'KeyH', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('y', 'KeyY', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('u', 'KeyU', 'right_index'),
      space(),
      char('g', 'KeyG', 'left_index'),
      char('o', 'KeyO', 'right_ring'),
      char('z', 'KeyZ', 'left_pinky'),
      char('a', 'KeyA', 'left_pinky'),
      char('i', 'KeyI', 'right_middle'),
      char('m', 'KeyM', 'right_index'),
      char('a', 'KeyA', 'left_pinky'),
      char('s', 'KeyS', 'left_ring'),
      char('u', 'KeyU', 'right_index'),
    ],
  },

  // === Lesson 10: Advanced Romaji - Mixed Patterns ===
  {
    id: 'ja-romaji-10',
    title: 'Japanese Romaji - Advanced Mixed Patterns',
    language: 'ja',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'advanced_mixed',
      speed: 'speed',
    },
    content: [
      // ryokan (traditional inn)
      char('r', 'KeyR', 'left_index'),
      char('y', 'KeyY', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('k', 'KeyK', 'right_middle'),
      char('a', 'KeyA', 'left_pinky'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // kissaten (coffee shop)
      char('k', 'KeyK', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      char('s', 'KeyS', 'left_ring'),
      char('s', 'KeyS', 'left_ring'),
      char('a', 'KeyA', 'left_pinky'),
      char('t', 'KeyT', 'left_index'),
      char('e', 'KeyE', 'left_middle'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // kyonen (last year)
      char('k', 'KeyK', 'right_middle'),
      char('y', 'KeyY', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // kinen (anniversary)
      char('k', 'KeyK', 'right_middle'),
      char('i', 'KeyI', 'right_middle'),
      char('n', 'KeyN', 'right_index'),
      char('e', 'KeyE', 'left_middle'),
      char('n', 'KeyN', 'right_index'),
      space(),
      // nihongo (Japanese language)
      char('n', 'KeyN', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
      char('h', 'KeyH', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      char('g', 'KeyG', 'left_index'),
      char('o', 'KeyO', 'right_ring'),
      space(),
      // isshoni (together)
      char('i', 'KeyI', 'right_middle'),
      char('s', 'KeyS', 'left_ring'),
      char('s', 'KeyS', 'left_ring'),
      char('h', 'KeyH', 'right_index'),
      char('o', 'KeyO', 'right_ring'),
      char('n', 'KeyN', 'right_index'),
      char('i', 'KeyI', 'right_middle'),
    ],
  },
];

// Export lesson categories
export const japaneseVowelLessons = japaneseLessons.filter((l) =>
  l.id.includes('romaji-1')
);

export const japaneseConsonantLessons = japaneseLessons.filter(
  (l) => l.id.includes('romaji-2') || l.id.includes('romaji-3')
);

export const japaneseWordLessons = japaneseLessons.filter((l) =>
  l.id.includes('romaji-4')
);

export const japanesePatternLessons = japaneseLessons.filter(
  (l) => l.id.includes('romaji-5') || l.id.includes('romaji-6') || l.id.includes('romaji-7')
);

export const japanesePhraseLessons = japaneseLessons.filter(
  (l) => l.id.includes('romaji-8') || l.id.includes('romaji-9') || l.id.includes('romaji-10')
);

export default japaneseLessons;
