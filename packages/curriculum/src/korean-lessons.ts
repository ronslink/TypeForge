/**
 * Korean Hangul Lesson Corpus
 * 10 progressive lessons for learning Korean typing with Dubeolsik (2-set) layout
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string | undefined, finger: Finger): LessonChar {
  return { char, code: code!, expectedFinger: finger };
}

// Korean Hangul key mappings (Dubeolsik 2-set layout)
const KOREAN_KEY_MAP: Record<string, string> = {
  // Row 2 - First consonant row (top)
  'ㅂ': 'KeyQ',
  'ㅃ': 'KeyQ',
  'ㅈ': 'KeyW',
  'ㅉ': 'KeyW',
  'ㄷ': 'KeyE',
  'ㄸ': 'KeyE',
  'ㄱ': 'KeyR',
  'ㄲ': 'KeyR',
  'ㅅ': 'KeyT',
  'ㅆ': 'KeyT',
  'ㅛ': 'KeyY',
  'ㅕ': 'KeyU',
  'ㅑ': 'KeyI',
  'ㅐ': 'KeyO',
  'ㅔ': 'KeyP',
  '[': 'BracketLeft',
  ']': 'BracketRight',
  '\\': 'Backslash',

  // Row 3 - Vowel row (home)
  'ㅁ': 'KeyA',
  'ㄴ': 'KeyS',
  'ㅇ': 'KeyD',
  'ㄹ': 'KeyF',
  'ㅎ': 'KeyG',
  'ㅗ': 'KeyH',
  'ㅓ': 'KeyJ',
  'ㅏ': 'KeyK',
  'ㅣ': 'KeyL',
  ';': 'Semicolon',
  "'": 'Quote',

  // Row 4 - Final consonant row (bottom)
  'ㅋ': 'KeyZ',
  'ㅌ': 'KeyX',
  'ㅊ': 'KeyC',
  'ㅍ': 'KeyV',
  'ㅠ': 'KeyB',
  'ㅜ': 'KeyN',
  'ㅡ': 'KeyM',
  ',': 'Comma',
  '.': 'Period',
  '/': 'Slash',

  // Space
  ' ': 'Space',
};

/**
 * Korean Hangul Lessons - 10 progressive lessons
 */
export const koreanLessons: Lesson[] = [
  // === Lesson 1: Right Hand Vowels (ㅏ, ㅑ, ㅓ, ㅕ, ㅛ) ===
  {
    id: 'ko-hangul-1',
    title: 'Korean Vowels - Right Hand (ㅏ, ㅑ, ㅓ, ㅕ, ㅛ)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'vowels_right_hand',
      speed: 'accuracy',
    },
    content: [
      // ㅏ (a) - right index
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      // ㅑ (ya) - right index
      createLessonChar('ㅑ', KOREAN_KEY_MAP['ㅑ']!, 'right_middle'),
      createLessonChar('ㅑ', KOREAN_KEY_MAP['ㅑ']!, 'right_middle'),
      createLessonChar('ㅑ', KOREAN_KEY_MAP['ㅑ']!, 'right_middle'),
      // ㅓ (eo) - right index
      createLessonChar('ㅓ', KOREAN_KEY_MAP['ㅓ']!, 'right_index'),
      createLessonChar('ㅓ', KOREAN_KEY_MAP['ㅓ']!, 'right_index'),
      createLessonChar('ㅓ', KOREAN_KEY_MAP['ㅓ']!, 'right_index'),
      // ㅕ (yeo) - right index
      createLessonChar('ㅕ', KOREAN_KEY_MAP['ㅕ']!, 'right_index'),
      createLessonChar('ㅕ', KOREAN_KEY_MAP['ㅕ']!, 'right_index'),
      createLessonChar('ㅕ', KOREAN_KEY_MAP['ㅕ']!, 'right_index'),
      // ㅛ (yo) - right index
      createLessonChar('ㅛ', KOREAN_KEY_MAP['ㅛ']!, 'right_index'),
      createLessonChar('ㅛ', KOREAN_KEY_MAP['ㅛ']!, 'right_index'),
      createLessonChar('ㅛ', KOREAN_KEY_MAP['ㅛ']!, 'right_index'),
    ]!,
  },

  // === Lesson 2: Left Hand Consonants - First Group (ㄱ, ㄴ, ㄷ, ㄹ, ㅁ) ===
  {
    id: 'ko-hangul-2',
    title: 'Korean Consonants - Left Hand Part 1 (ㄱ, ㄴ, ㄷ, ㄹ, ㅁ)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'consonants_left_hand_1',
      speed: 'accuracy',
    },
    content: [
      // ㄱ (giyeok) - left index
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      // ㄴ (nieun) - left ring
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      // ㄷ (digeut) - left middle
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      // ㄹ (rieul) - left index
      createLessonChar('ㄹ', KOREAN_KEY_MAP['ㄹ']!, 'left_index'),
      createLessonChar('ㄹ', KOREAN_KEY_MAP['ㄹ']!, 'left_index'),
      createLessonChar('ㄹ', KOREAN_KEY_MAP['ㄹ']!, 'left_index'),
      // ㅁ (mieum) - left pinky
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
    ]!,
  },

  // === Lesson 3: Right Hand Vowels Part 2 (ㅜ, ㅠ, ㅡ, ㅣ) ===
  {
    id: 'ko-hangul-3',
    title: 'Korean Vowels - Right Hand Part 2 (ㅜ, ㅠ, ㅡ, ㅣ)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'vowels_right_hand_2',
      speed: 'accuracy',
    },
    content: [
      // ㅜ (u) - right index
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      // ㅠ (yu) - left index
      createLessonChar('ㅠ', KOREAN_KEY_MAP['ㅠ']!, 'left_index'),
      createLessonChar('ㅠ', KOREAN_KEY_MAP['ㅠ']!, 'left_index'),
      createLessonChar('ㅠ', KOREAN_KEY_MAP['ㅠ']!, 'left_index'),
      // ㅡ (eu) - right index
      createLessonChar('ㅡ', KOREAN_KEY_MAP['ㅡ']!, 'right_index'),
      createLessonChar('ㅡ', KOREAN_KEY_MAP['ㅡ']!, 'right_index'),
      createLessonChar('ㅡ', KOREAN_KEY_MAP['ㅡ']!, 'right_index'),
      // ㅣ (i) - right ring
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
    ]!,
  },

  // === Lesson 4: Left Hand Consonants Part 2 (ㅂ, ㅅ, ㅇ, ㅈ, ㅊ) ===
  {
    id: 'ko-hangul-4',
    title: 'Korean Consonants - Left Hand Part 2 (ㅂ, ㅅ, ㅇ, ㅈ, ㅊ)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'consonants_left_hand_2',
      speed: 'accuracy',
    },
    content: [
      // ㅂ (bieup) - left pinky
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      // ㅅ (siot) - left index
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      // ㅇ (ieung) - left middle
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      // ㅈ (jieut) - left ring
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      // ㅊ (chieut) - left middle
      createLessonChar('ㅊ', KOREAN_KEY_MAP['ㅊ']!, 'left_middle'),
      createLessonChar('ㅊ', KOREAN_KEY_MAP['ㅊ']!, 'left_middle'),
      createLessonChar('ㅊ', KOREAN_KEY_MAP['ㅊ']!, 'left_middle'),
    ]!,
  },

  // === Lesson 5: Bottom Row Consonants (ㅋ, ㅌ, ㅍ, ㅎ) ===
  {
    id: 'ko-hangul-5',
    title: 'Korean Consonants - Bottom Row (ㅋ, ㅌ, ㅍ, ㅎ)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'consonants_bottom_row',
      speed: 'accuracy',
    },
    content: [
      // ㅋ (kieuk) - left pinky
      createLessonChar('ㅋ', KOREAN_KEY_MAP['ㅋ']!, 'left_pinky'),
      createLessonChar('ㅋ', KOREAN_KEY_MAP['ㅋ']!, 'left_pinky'),
      createLessonChar('ㅋ', KOREAN_KEY_MAP['ㅋ']!, 'left_pinky'),
      // ㅌ (tieut) - left ring
      createLessonChar('ㅌ', KOREAN_KEY_MAP['ㅌ']!, 'left_ring'),
      createLessonChar('ㅌ', KOREAN_KEY_MAP['ㅌ']!, 'left_ring'),
      createLessonChar('ㅌ', KOREAN_KEY_MAP['ㅌ']!, 'left_ring'),
      // ㅍ (pieup) - left index
      createLessonChar('ㅍ', KOREAN_KEY_MAP['ㅍ']!, 'left_index'),
      createLessonChar('ㅍ', KOREAN_KEY_MAP['ㅍ']!, 'left_index'),
      createLessonChar('ㅍ', KOREAN_KEY_MAP['ㅍ']!, 'left_index'),
      // ㅎ (hieut) - left index
      createLessonChar('ㅎ', KOREAN_KEY_MAP['ㅎ']!, 'left_index'),
      createLessonChar('ㅎ', KOREAN_KEY_MAP['ㅎ']!, 'left_index'),
      createLessonChar('ㅎ', KOREAN_KEY_MAP['ㅎ']!, 'left_index'),
    ]!,
  },

  // === Lesson 6: Simple Korean Syllables (가, 나, 다, 라, 마) ===
  {
    id: 'ko-hangul-6',
    title: 'Korean Syllables - Part 1 (가, 나, 다, 라, 마)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'syllables_part_1',
      speed: 'accuracy',
    },
    content: [
      // 가 (ga) - ㄱ + ㅏ
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 나 (na) - ㄴ + ㅏ
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 다 (da) - ㄷ + ㅏ
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 라 (ra) - ㄹ + ㅏ
      createLessonChar('ㄹ', KOREAN_KEY_MAP['ㄹ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄹ', KOREAN_KEY_MAP['ㄹ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 마 (ma) - ㅁ + ㅏ
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
    ]!,
  },

  // === Lesson 7: Simple Korean Syllables Part 2 (바, 사, 아, 자, 차) ===
  {
    id: 'ko-hangul-7',
    title: 'Korean Syllables - Part 2 (바, 사, 아, 자, 차)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'syllables_part_2',
      speed: 'accuracy',
    },
    content: [
      // 바 (ba) - ㅂ + ㅏ
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 사 (sa) - ㅅ + ㅏ
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 아 (a) - ㅇ + ㅏ
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 자 (ja) - ㅈ + ㅏ
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 차 (cha) - ㅊ + ㅏ
      createLessonChar('ㅊ', KOREAN_KEY_MAP['ㅊ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅊ', KOREAN_KEY_MAP['ㅊ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
    ]!,
  },

  // === Lesson 8: Compound Vowels (ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, ㅢ) ===
  {
    id: 'ko-hangul-8',
    title: 'Korean Compound Vowels (ㅘ, ㅙ, ㅚ, ㅝ, ㅞ, ㅟ, ㅢ)',
    language: 'ko',
    script: 'Hangul',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'compound_vowels',
      speed: 'accuracy',
    },
    content: [
      // ㅘ (wa) - ㅗ + ㅏ
      createLessonChar('ㅗ', KOREAN_KEY_MAP['ㅗ']!, 'right_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅗ', KOREAN_KEY_MAP['ㅗ']!, 'right_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ㅙ (wae) - ㅗ + ㅐ
      createLessonChar('ㅗ', KOREAN_KEY_MAP['ㅗ']!, 'right_index'),
      createLessonChar('ㅐ', KOREAN_KEY_MAP['ㅐ']!, 'right_ring'),
      createLessonChar('ㅗ', KOREAN_KEY_MAP['ㅗ']!, 'right_index'),
      createLessonChar('ㅐ', KOREAN_KEY_MAP['ㅐ']!, 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ㅚ (oe) - ㅗ + ㅣ
      createLessonChar('ㅗ', KOREAN_KEY_MAP['ㅗ']!, 'right_index'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      createLessonChar('ㅗ', KOREAN_KEY_MAP['ㅗ']!, 'right_index'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ㅝ (wo) - ㅜ + ㅓ
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅓ', KOREAN_KEY_MAP['ㅓ']!, 'right_index'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅓ', KOREAN_KEY_MAP['ㅓ']!, 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ㅞ (we) - ㅜ + ㅔ
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅔ', KOREAN_KEY_MAP['ㅔ']!, 'right_pinky'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅔ', KOREAN_KEY_MAP['ㅔ']!, 'right_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ㅟ (wi) - ㅜ + ㅣ
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ㅢ (ui) - ㅡ + ㅣ
      createLessonChar('ㅡ', KOREAN_KEY_MAP['ㅡ']!, 'right_index'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      createLessonChar('ㅡ', KOREAN_KEY_MAP['ㅡ']!, 'right_index'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
    ]!,
  },

  // === Lesson 9: Common Korean Words (가수, 가족, 강아지, 나무, 바다) ===
  {
    id: 'ko-hangul-9',
    title: 'Common Korean Words - Nature & Animals',
    language: 'ko',
    script: 'Hangul',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_words_nature',
      speed: 'accuracy',
    },
    content: [
      // 가수 (singer)
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 가족 (family)
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 강아지 (puppy)
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅈ', KOREAN_KEY_MAP['ㅈ']!, 'left_ring'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 나무 (tree)
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
      createLessonChar('ㅜ', KOREAN_KEY_MAP['ㅜ']!, 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 바다 (sea)
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
    ]!,
  },

  // === Lesson 10: Common Korean Phrases (안녕하세요, 감사합니다, 처음 뵙겠습니다) ===
  {
    id: 'ko-hangul-10',
    title: 'Common Korean Phrases - Greetings',
    language: 'ko',
    script: 'Hangul',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_phrases_greetings',
      speed: 'speed',
    },
    content: [
      // 안녕하세요 (hello)
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㅕ', KOREAN_KEY_MAP['ㅕ']!, 'right_index'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅛ', KOREAN_KEY_MAP['ㅛ']!, 'right_index'),
      createLessonChar('ㅆ', KOREAN_KEY_MAP['ㅆ']!, 'left_index'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅔ', KOREAN_KEY_MAP['ㅔ']!, 'right_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 감사합니다 (thank you)
      createLessonChar('ㄱ', KOREAN_KEY_MAP['ㄱ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅁ', KOREAN_KEY_MAP['ㅁ']!, 'left_pinky'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      createLessonChar('ㄷ', KOREAN_KEY_MAP['ㄷ']!, 'left_middle'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅂ', KOREAN_KEY_MAP['ㅂ']!, 'left_pinky'),
      createLessonChar('ㄴ', KOREAN_KEY_MAP['ㄴ']!, 'left_ring'),
      createLessonChar('ㅣ', KOREAN_KEY_MAP['ㅣ']!, 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // 사랑해요 (I love you)
      createLessonChar('ㅅ', KOREAN_KEY_MAP['ㅅ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㄹ', KOREAN_KEY_MAP['ㄹ']!, 'left_index'),
      createLessonChar('ㅏ', KOREAN_KEY_MAP['ㅏ']!, 'right_middle'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅎ', KOREAN_KEY_MAP['ㅎ']!, 'left_index'),
      createLessonChar('ㅐ', KOREAN_KEY_MAP['ㅐ']!, 'right_ring'),
      createLessonChar('ㅇ', KOREAN_KEY_MAP['ㅇ']!, 'left_middle'),
      createLessonChar('ㅛ', KOREAN_KEY_MAP['ㅛ']!, 'right_index'),
    ]!,
  },
];

// Export individual lesson categories for convenience
export const koreanConsonantLessons = koreanLessons.filter((l) =>
  l.id.match(/ko-hangul-[1-5]/)
);

export const koreanVowelLessons = koreanLessons.filter((l) =>
  l.id.match(/ko-hangul-(1|3)/)
);

export const koreanSyllableLessons = koreanLessons.filter((l) =>
  l.id.match(/ko-hangul-[6-8]/)
);

export const koreanWordLessons = koreanLessons.filter((l) =>
  l.id.match(/ko-hangul-(9|10)/)
);

export default koreanLessons;
