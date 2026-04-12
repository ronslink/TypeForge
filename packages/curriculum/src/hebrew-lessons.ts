/**
 * Hebrew RTL (Right-to-Left) Lesson Corpus
 * 12 lessons for learning Hebrew typing with proper finger assignments
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string | undefined, finger: Finger): LessonChar {
  return { char, code: code!, expectedFinger: finger };
}

// Hebrew letter to key code mapping (standard Hebrew keyboard layout)
const HEBREW_KEY_MAP: Record<string, string> = {
  // Row 2 (top letter row)
  '/': 'KeyQ',
  "'": 'KeyW',
  ק: 'KeyE',
  ר: 'KeyR',
  א: 'KeyT',
  ט: 'KeyY',
  ו: 'KeyU',
  ן: 'KeyI',
  ם: 'KeyO',
  פ: 'KeyP',

  // Row 3 (home row)
  ש: 'KeyA',
  ד: 'KeyS',
  ג: 'KeyD',
  כ: 'KeyF',
  ע: 'KeyG',
  י: 'KeyH',
  ח: 'KeyJ',
  ל: 'KeyK',
  ך: 'KeyL',
  ף: 'Semicolon',

  // Row 4 (bottom row)
  ז: 'KeyZ',
  ס: 'KeyX',
  ב: 'KeyC',
  ה: 'KeyV',
  נ: 'KeyB',
  מ: 'KeyN',
  צ: 'KeyM',
  ת: 'Comma',
  ץ: 'Period',

  // Special characters
  ' ': 'Space',
};

// Hebrew final letter forms (sofit)

/**
 * Hebrew RTL Lessons - 12 progressive lessons
 */
export const hebrewLessons: Lesson[] = [
  // === Lesson 1: Hebrew Alphabet - Home Row Right Hand (י-ח-ל-ך-ף) ===
  {
    id: 'he-alphabet-1',
    title: 'Hebrew Alphabet - Part 1 (י-ח-ל-ך-ף)',
    language: 'he',
    script: 'hebrew',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'yod_het_lamed_kaf_sofit_pe_sofit',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('ח', HEBREW_KEY_MAP['ח'], 'right_index'),
      createLessonChar('ח', HEBREW_KEY_MAP['ח'], 'right_index'),
      createLessonChar('ח', HEBREW_KEY_MAP['ח'], 'right_index'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      createLessonChar('ף', HEBREW_KEY_MAP['ף'], 'right_pinky'),
      createLessonChar('ף', HEBREW_KEY_MAP['ף'], 'right_pinky'),
      createLessonChar('ף', HEBREW_KEY_MAP['ף'], 'right_pinky'),
    ],
  },

  // === Lesson 2: Hebrew Alphabet - Home Row Left Hand (ש-ד-ג-כ-ע) ===
  {
    id: 'he-alphabet-2',
    title: 'Hebrew Alphabet - Part 2 (ש-ד-ג-כ-ע)',
    language: 'he',
    script: 'hebrew',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'shin_dalet_gimel_kaf_ayin',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ד', HEBREW_KEY_MAP['ד'], 'left_ring'),
      createLessonChar('ד', HEBREW_KEY_MAP['ד'], 'left_ring'),
      createLessonChar('ד', HEBREW_KEY_MAP['ד'], 'left_ring'),
      createLessonChar('ג', HEBREW_KEY_MAP['ג'], 'left_middle'),
      createLessonChar('ג', HEBREW_KEY_MAP['ג'], 'left_middle'),
      createLessonChar('ג', HEBREW_KEY_MAP['ג'], 'left_middle'),
      createLessonChar('כ', HEBREW_KEY_MAP['כ'], 'left_index'),
      createLessonChar('כ', HEBREW_KEY_MAP['כ'], 'left_index'),
      createLessonChar('כ', HEBREW_KEY_MAP['כ'], 'left_index'),
      createLessonChar('ע', HEBREW_KEY_MAP['ע'], 'left_index'),
      createLessonChar('ע', HEBREW_KEY_MAP['ע'], 'left_index'),
      createLessonChar('ע', HEBREW_KEY_MAP['ע'], 'left_index'),
    ],
  },

  // === Lesson 3: Hebrew Alphabet - Top Row (א-ר-ק-ט-ו) ===
  {
    id: 'he-alphabet-3',
    title: 'Hebrew Alphabet - Part 3 (א-ר-ק-ט-ו)',
    language: 'he',
    script: 'hebrew',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'alef_resh_qof_tet_vav',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('ר', HEBREW_KEY_MAP['ר'], 'left_index'),
      createLessonChar('ר', HEBREW_KEY_MAP['ר'], 'left_index'),
      createLessonChar('ר', HEBREW_KEY_MAP['ר'], 'left_index'),
      createLessonChar('ק', HEBREW_KEY_MAP['ק'], 'left_middle'),
      createLessonChar('ק', HEBREW_KEY_MAP['ק'], 'left_middle'),
      createLessonChar('ק', HEBREW_KEY_MAP['ק'], 'left_middle'),
      createLessonChar('ט', HEBREW_KEY_MAP['ט'], 'right_index'),
      createLessonChar('ט', HEBREW_KEY_MAP['ט'], 'right_index'),
      createLessonChar('ט', HEBREW_KEY_MAP['ט'], 'right_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
    ],
  },

  // === Lesson 4: Hebrew Alphabet - Final Letters (ן-ם-ך-ף-ץ) ===
  {
    id: 'he-alphabet-4',
    title: 'Hebrew Alphabet - Final Letters (Sofit)',
    language: 'he',
    script: 'hebrew',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'final_letters_sofit',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ן', HEBREW_KEY_MAP['ן'], 'right_middle'),
      createLessonChar('ן', HEBREW_KEY_MAP['ן'], 'right_middle'),
      createLessonChar('ן', HEBREW_KEY_MAP['ן'], 'right_middle'),
      createLessonChar('ם', HEBREW_KEY_MAP['ם'], 'right_ring'),
      createLessonChar('ם', HEBREW_KEY_MAP['ם'], 'right_ring'),
      createLessonChar('ם', HEBREW_KEY_MAP['ם'], 'right_ring'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      createLessonChar('ף', HEBREW_KEY_MAP['ף'], 'right_pinky'),
      createLessonChar('ף', HEBREW_KEY_MAP['ף'], 'right_pinky'),
      createLessonChar('ף', HEBREW_KEY_MAP['ף'], 'right_pinky'),
      createLessonChar('ץ', HEBREW_KEY_MAP['ץ'], 'right_ring'),
      createLessonChar('ץ', HEBREW_KEY_MAP['ץ'], 'right_ring'),
      createLessonChar('ץ', HEBREW_KEY_MAP['ץ'], 'right_ring'),
    ],
  },

  // === Lesson 5: Hebrew Alphabet - Bottom Row (ז-ס-ב-ה-נ) ===
  {
    id: 'he-alphabet-5',
    title: 'Hebrew Alphabet - Part 4 (ז-ס-ב-ה-נ)',
    language: 'he',
    script: 'hebrew',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'zayin_samekh_bet_het_nun',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ז', HEBREW_KEY_MAP['ז'], 'left_pinky'),
      createLessonChar('ז', HEBREW_KEY_MAP['ז'], 'left_pinky'),
      createLessonChar('ז', HEBREW_KEY_MAP['ז'], 'left_pinky'),
      createLessonChar('ס', HEBREW_KEY_MAP['ס'], 'left_ring'),
      createLessonChar('ס', HEBREW_KEY_MAP['ס'], 'left_ring'),
      createLessonChar('ס', HEBREW_KEY_MAP['ס'], 'left_ring'),
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      createLessonChar('ה', HEBREW_KEY_MAP['ה'], 'left_index'),
      createLessonChar('ה', HEBREW_KEY_MAP['ה'], 'left_index'),
      createLessonChar('ה', HEBREW_KEY_MAP['ה'], 'left_index'),
      createLessonChar('נ', HEBREW_KEY_MAP['נ'], 'left_index'),
      createLessonChar('נ', HEBREW_KEY_MAP['נ'], 'left_index'),
      createLessonChar('נ', HEBREW_KEY_MAP['נ'], 'left_index'),
    ],
  },

  // === Lesson 6: Hebrew Alphabet - Bottom Row Right (מ-צ-ת-ץ) ===
  {
    id: 'he-alphabet-6',
    title: 'Hebrew Alphabet - Part 5 (מ-צ-ת-ץ)',
    language: 'he',
    script: 'hebrew',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'mem_tsadi_tav_final_tsadi',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('מ', HEBREW_KEY_MAP['מ'], 'right_index'),
      createLessonChar('מ', HEBREW_KEY_MAP['מ'], 'right_index'),
      createLessonChar('מ', HEBREW_KEY_MAP['מ'], 'right_index'),
      createLessonChar('צ', HEBREW_KEY_MAP['צ'], 'right_index'),
      createLessonChar('צ', HEBREW_KEY_MAP['צ'], 'right_index'),
      createLessonChar('צ', HEBREW_KEY_MAP['צ'], 'right_index'),
      createLessonChar('ת', HEBREW_KEY_MAP['ת'], 'right_middle'),
      createLessonChar('ת', HEBREW_KEY_MAP['ת'], 'right_middle'),
      createLessonChar('ת', HEBREW_KEY_MAP['ת'], 'right_middle'),
      createLessonChar('ץ', HEBREW_KEY_MAP['ץ'], 'right_ring'),
      createLessonChar('ץ', HEBREW_KEY_MAP['ץ'], 'right_ring'),
      createLessonChar('ץ', HEBREW_KEY_MAP['ץ'], 'right_ring'),
    ],
  },

  // === Lesson 7: Hebrew Alphabet - Special Characters (/ ') ===
  {
    id: 'he-alphabet-special',
    title: 'Hebrew Alphabet - Special Characters',
    language: 'he',
    script: 'hebrew',
    difficulty: 2,
    tags: {
      hand: 'left',
      finger: 'left_pinky',
      key_bigram: 'special_chars',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('/', HEBREW_KEY_MAP['/'], 'left_pinky'),
      createLessonChar('/', HEBREW_KEY_MAP['/'], 'left_pinky'),
      createLessonChar('/', HEBREW_KEY_MAP['/'], 'left_pinky'),
      createLessonChar("'", HEBREW_KEY_MAP["'"], 'left_ring'),
      createLessonChar("'", HEBREW_KEY_MAP["'"], 'left_ring'),
      createLessonChar("'", HEBREW_KEY_MAP["'"], 'left_ring'),
      // Practice alternating
      createLessonChar('/', HEBREW_KEY_MAP['/'], 'left_pinky'),
      createLessonChar("'", HEBREW_KEY_MAP["'"], 'left_ring'),
      createLessonChar('/', HEBREW_KEY_MAP['/'], 'left_pinky'),
      createLessonChar("'", HEBREW_KEY_MAP["'"], 'left_ring'),
    ],
  },

  // === Lesson 8: Simple Hebrew Words ===
  {
    id: 'he-simple-words',
    title: 'Simple Hebrew Words',
    language: 'he',
    script: 'hebrew',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'simple_words',
      speed: 'accuracy',
    },
    content: [
      // אבא (father)
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // אמא (mother)
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('מ', HEBREW_KEY_MAP['מ'], 'right_index'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // כלב (dog)
      createLessonChar('כ', HEBREW_KEY_MAP['כ'], 'left_index'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // בית (house)
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('ת', HEBREW_KEY_MAP['ת'], 'right_middle'),
    ],
  },

  // === Lesson 9: Words with Final Letters ===
  {
    id: 'he-final-words',
    title: 'Words with Final Letters',
    language: 'he',
    script: 'hebrew',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'final_letter_words',
      speed: 'accuracy',
    },
    content: [
      // ספר (book)
      createLessonChar('ס', HEBREW_KEY_MAP['ס'], 'left_ring'),
      createLessonChar('פ', HEBREW_KEY_MAP['פ'], 'right_pinky'),
      createLessonChar('ר', HEBREW_KEY_MAP['ר'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // מלך (king)
      createLessonChar('מ', HEBREW_KEY_MAP['מ'], 'right_index'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ך', HEBREW_KEY_MAP['ך'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ליל (night)
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // דג (fish)
      createLessonChar('ד', HEBREW_KEY_MAP['ד'], 'left_ring'),
      createLessonChar('ג', HEBREW_KEY_MAP['ג'], 'left_middle'),
    ],
  },

  // === Lesson 10: The Letter Shin (ש) Variants ===
  {
    id: 'he-shin-variants',
    title: 'The Letter Shin and Its Variants',
    language: 'he',
    script: 'hebrew',
    difficulty: 3,
    tags: {
      hand: 'left',
      finger: 'left_pinky',
      key_bigram: 'shin_variants',
      speed: 'accuracy',
    },
    content: [
      // Shin (ש) - note: sin and shin are the same letter with different dots
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      // שם (name)
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ם', HEBREW_KEY_MAP['ם'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // של (of)
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // שלש (three)
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
    ],
  },

  // === Lesson 11: Hebrew Vowels (Niqqud) - Conceptual ===
  {
    id: 'he-vowels',
    title: 'Hebrew Vowels - Introduction',
    language: 'he',
    script: 'hebrew',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'vowels_niqqud',
      speed: 'accuracy',
    },
    content: [
      // Practice vowel letters (א-ה-ו-י) that double as vowels
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('ה', HEBREW_KEY_MAP['ה'], 'left_index'),
      createLessonChar('ה', HEBREW_KEY_MAP['ה'], 'left_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      // Vowel patterns
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('א', HEBREW_KEY_MAP['א'], 'left_index'),
      createLessonChar('ר', HEBREW_KEY_MAP['ר'], 'left_index'),
    ],
  },

  // === Lesson 12: Common Hebrew Phrases ===
  {
    id: 'he-common-phrases',
    title: 'Common Hebrew Phrases',
    language: 'he',
    script: 'hebrew',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_phrases',
      speed: 'speed',
    },
    content: [
      // שלום (shalom - peace/hello)
      createLessonChar('ש', HEBREW_KEY_MAP['ש'], 'left_pinky'),
      createLessonChar('ל', HEBREW_KEY_MAP['ל'], 'right_middle'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ם', HEBREW_KEY_MAP['ם'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // תודה (toda - thank you)
      createLessonChar('ת', HEBREW_KEY_MAP['ת'], 'right_middle'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ד', HEBREW_KEY_MAP['ד'], 'left_ring'),
      createLessonChar('ה', HEBREW_KEY_MAP['ה'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // בוקר (boker - morning)
      createLessonChar('ב', HEBREW_KEY_MAP['ב'], 'left_middle'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ק', HEBREW_KEY_MAP['ק'], 'left_middle'),
      createLessonChar('ר', HEBREW_KEY_MAP['ר'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // יום (yom - day)
      createLessonChar('י', HEBREW_KEY_MAP['י'], 'right_index'),
      createLessonChar('ו', HEBREW_KEY_MAP['ו'], 'right_index'),
      createLessonChar('ם', HEBREW_KEY_MAP['ם'], 'right_ring'),
    ],
  },
];

// Export individual lesson categories for convenience
export const hebrewAlphabetLessons = hebrewLessons.filter((l) =>
  l.id.startsWith('he-alphabet')
);

export const hebrewWordLessons = hebrewLessons.filter(
  (l) => l.id.includes('simple-words') || l.id.includes('final-words')
);

export const hebrewGrammarLessons = hebrewLessons.filter(
  (l) => l.id.includes('shin-variants') || l.id.includes('vowels')
);

export const hebrewPhraseLessons = hebrewLessons.filter((l) => l.id.includes('phrases'));

export default hebrewLessons;
