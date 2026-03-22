/**
 * Arabic RTL (Right-to-Left) Lesson Corpus
 * 10+ lessons for learning Arabic typing with proper finger assignments
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string, finger: Finger): LessonChar {
  return { char, code, expectedFinger: finger };
}

// Arabic letter to key code mapping (simplified for Arabic keyboard layout)
const ARABIC_KEY_MAP: Record<string, string> = {
  // Row 1 (top) - numbers and special chars
  '١': 'Digit1', '٢': 'Digit2', '٣': 'Digit3', '٤': 'Digit4', '٥': 'Digit5',
  '٦': 'Digit6', '٧': 'Digit7', '٨': 'Digit8', '٩': 'Digit9', '٠': 'Digit0',
  'ذ': 'Minus', 'ّ': 'Equal',
  
  // Row 2 (QWERTY row)
  'ض': 'KeyQ', 'ص': 'KeyW', 'ث': 'KeyE', 'ق': 'KeyR', 'ف': 'KeyT',
  'غ': 'KeyY', 'ع': 'KeyU', 'ه': 'KeyI', 'خ': 'KeyO', 'ح': 'KeyP',
  'ج': 'BracketLeft', 'د': 'BracketRight',
  
  // Row 3 (home row)
  'ش': 'KeyA', 'س': 'KeyS', 'ي': 'KeyD', 'ب': 'KeyF', 'ل': 'KeyG',
  'ا': 'KeyH', 'ت': 'KeyJ', 'ن': 'KeyK', 'م': 'KeyL', 'ك': 'Semicolon',
  'ط': 'Quote',
  
  // Row 4 (bottom row)
  'ئ': 'Backslash', 'ء': 'KeyZ', 'ؤ': 'KeyX', 'ر': 'KeyC', 'ى': 'KeyV',
  'ة': 'KeyB', 'و': 'KeyN', 'ز': 'KeyM', 'ظ': 'Comma', ' ': 'Space',
};

// Harakat (diacritics/vowel marks)
const HARAKAT_MAP: Record<string, string> = {
  'َ': 'Fatha',      // fatha
  'ُ': 'Damma',      // damma
  'ِ': 'Kasra',      // kasra
  'ْ': 'Sukun',      // sukun
  'ّ': 'Shadda',     // shadda
  'ً': 'Fathatan',   // fathatan
  'ٌ': 'Dammatan',   // dammatan
  'ٍ': 'Kasratan',   // kasratan
};

/**
 * Arabic RTL Lessons - 10+ progressive lessons
 */
export const arabicLessons: Lesson[] = [
  // === Lesson 1: Arabic Alphabet - Isolated Letters (Part 1) ===
  {
    id: 'ar-alphabet-1',
    title: 'Arabic Alphabet - Part 1 (ا-ب-ت-ث)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'alif_ba_ta_tha',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ت', ARABIC_KEY_MAP['ت'], 'right_index'),
      createLessonChar('ت', ARABIC_KEY_MAP['ت'], 'right_index'),
      createLessonChar('ت', ARABIC_KEY_MAP['ت'], 'right_index'),
      createLessonChar('ث', ARABIC_KEY_MAP['ث'], 'left_ring'),
      createLessonChar('ث', ARABIC_KEY_MAP['ث'], 'left_ring'),
      createLessonChar('ث', ARABIC_KEY_MAP['ث'], 'left_ring'),
    ],
  },

  // === Lesson 2: Arabic Alphabet - Isolated Letters (Part 2) ===
  {
    id: 'ar-alphabet-2',
    title: 'Arabic Alphabet - Part 2 (ج-ح-خ-د)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'jim_ha_kha_dal',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ج', ARABIC_KEY_MAP['ج'], 'right_pinky'),
      createLessonChar('ج', ARABIC_KEY_MAP['ج'], 'right_pinky'),
      createLessonChar('ج', ARABIC_KEY_MAP['ج'], 'right_pinky'),
      createLessonChar('ح', ARABIC_KEY_MAP['ح'], 'right_pinky'),
      createLessonChar('ح', ARABIC_KEY_MAP['ح'], 'right_pinky'),
      createLessonChar('ح', ARABIC_KEY_MAP['ح'], 'right_pinky'),
      createLessonChar('خ', ARABIC_KEY_MAP['خ'], 'right_pinky'),
      createLessonChar('خ', ARABIC_KEY_MAP['خ'], 'right_pinky'),
      createLessonChar('خ', ARABIC_KEY_MAP['خ'], 'right_pinky'),
      createLessonChar('د', ARABIC_KEY_MAP['د'], 'right_pinky'),
      createLessonChar('د', ARABIC_KEY_MAP['د'], 'right_pinky'),
      createLessonChar('د', ARABIC_KEY_MAP['د'], 'right_pinky'),
    ],
  },

  // === Lesson 3: Arabic Alphabet - Isolated Letters (Part 3) ===
  {
    id: 'ar-alphabet-3',
    title: 'Arabic Alphabet - Part 3 (ر-ز-س-ش)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ra_zay_sin_shin',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ر', ARABIC_KEY_MAP['ر'], 'left_middle'),
      createLessonChar('ر', ARABIC_KEY_MAP['ر'], 'left_middle'),
      createLessonChar('ر', ARABIC_KEY_MAP['ر'], 'left_middle'),
      createLessonChar('ز', ARABIC_KEY_MAP['ز'], 'right_index'),
      createLessonChar('ز', ARABIC_KEY_MAP['ز'], 'right_index'),
      createLessonChar('ز', ARABIC_KEY_MAP['ز'], 'right_index'),
      createLessonChar('س', ARABIC_KEY_MAP['س'], 'left_ring'),
      createLessonChar('س', ARABIC_KEY_MAP['س'], 'left_ring'),
      createLessonChar('س', ARABIC_KEY_MAP['س'], 'left_ring'),
      createLessonChar('ش', ARABIC_KEY_MAP['ش'], 'left_pinky'),
      createLessonChar('ش', ARABIC_KEY_MAP['ش'], 'left_pinky'),
      createLessonChar('ش', ARABIC_KEY_MAP['ش'], 'left_pinky'),
    ],
  },

  // === Lesson 4: Arabic Alphabet - Isolated Letters (Part 4) ===
  {
    id: 'ar-alphabet-4',
    title: 'Arabic Alphabet - Part 4 (ص-ض-ط-ظ)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'sad_dad_ta_zah',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ص', ARABIC_KEY_MAP['ص'], 'left_ring'),
      createLessonChar('ص', ARABIC_KEY_MAP['ص'], 'left_ring'),
      createLessonChar('ص', ARABIC_KEY_MAP['ص'], 'left_ring'),
      createLessonChar('ض', ARABIC_KEY_MAP['ض'], 'left_pinky'),
      createLessonChar('ض', ARABIC_KEY_MAP['ض'], 'left_pinky'),
      createLessonChar('ض', ARABIC_KEY_MAP['ض'], 'left_pinky'),
      createLessonChar('ط', ARABIC_KEY_MAP['ط'], 'right_pinky'),
      createLessonChar('ط', ARABIC_KEY_MAP['ط'], 'right_pinky'),
      createLessonChar('ط', ARABIC_KEY_MAP['ط'], 'right_pinky'),
      createLessonChar('ظ', ARABIC_KEY_MAP['ظ'], 'right_middle'),
      createLessonChar('ظ', ARABIC_KEY_MAP['ظ'], 'right_middle'),
      createLessonChar('ظ', ARABIC_KEY_MAP['ظ'], 'right_middle'),
    ],
  },

  // === Lesson 5: Arabic Alphabet - Isolated Letters (Part 5) ===
  {
    id: 'ar-alphabet-5',
    title: 'Arabic Alphabet - Part 5 (ع-غ-ف-ق)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ain_ghain_fa_qaf',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ع', ARABIC_KEY_MAP['ع'], 'right_index'),
      createLessonChar('ع', ARABIC_KEY_MAP['ع'], 'right_index'),
      createLessonChar('ع', ARABIC_KEY_MAP['ع'], 'right_index'),
      createLessonChar('غ', ARABIC_KEY_MAP['غ'], 'right_index'),
      createLessonChar('غ', ARABIC_KEY_MAP['غ'], 'right_index'),
      createLessonChar('غ', ARABIC_KEY_MAP['غ'], 'right_index'),
      createLessonChar('ف', ARABIC_KEY_MAP['ف'], 'left_index'),
      createLessonChar('ف', ARABIC_KEY_MAP['ف'], 'left_index'),
      createLessonChar('ف', ARABIC_KEY_MAP['ف'], 'left_index'),
      createLessonChar('ق', ARABIC_KEY_MAP['ق'], 'left_ring'),
      createLessonChar('ق', ARABIC_KEY_MAP['ق'], 'left_ring'),
      createLessonChar('ق', ARABIC_KEY_MAP['ق'], 'left_ring'),
    ],
  },

  // === Lesson 6: Arabic Alphabet - Isolated Letters (Part 6) ===
  {
    id: 'ar-alphabet-6',
    title: 'Arabic Alphabet - Part 6 (ك-ل-م-ن)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'kaf_lam_mim_nun',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ك', ARABIC_KEY_MAP['ك'], 'right_pinky'),
      createLessonChar('ك', ARABIC_KEY_MAP['ك'], 'right_pinky'),
      createLessonChar('ك', ARABIC_KEY_MAP['ك'], 'right_pinky'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
      createLessonChar('ن', ARABIC_KEY_MAP['ن'], 'right_middle'),
      createLessonChar('ن', ARABIC_KEY_MAP['ن'], 'right_middle'),
      createLessonChar('ن', ARABIC_KEY_MAP['ن'], 'right_middle'),
    ],
  },

  // === Lesson 7: Arabic Alphabet - Isolated Letters (Part 7) ===
  {
    id: 'ar-alphabet-7',
    title: 'Arabic Alphabet - Part 7 (ه-و-ي-ء)',
    language: 'ar',
    script: 'arabic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ha_waw_ya_hamza',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ه', ARABIC_KEY_MAP['ه'], 'right_index'),
      createLessonChar('ه', ARABIC_KEY_MAP['ه'], 'right_index'),
      createLessonChar('ه', ARABIC_KEY_MAP['ه'], 'right_index'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ء', ARABIC_KEY_MAP['ء'], 'left_ring'),
      createLessonChar('ء', ARABIC_KEY_MAP['ء'], 'left_ring'),
      createLessonChar('ء', ARABIC_KEY_MAP['ء'], 'left_ring'),
    ],
  },

  // === Lesson 8: Arabic Alphabet - Special Letters ===
  {
    id: 'ar-alphabet-special',
    title: 'Arabic Alphabet - Special Letters (ة-ى-ئ-ؤ)',
    language: 'ar',
    script: 'arabic',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ta_marbuta_alif_maksura',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ة', ARABIC_KEY_MAP['ة'], 'left_index'),
      createLessonChar('ة', ARABIC_KEY_MAP['ة'], 'left_index'),
      createLessonChar('ة', ARABIC_KEY_MAP['ة'], 'left_index'),
      createLessonChar('ى', ARABIC_KEY_MAP['ى'], 'left_index'),
      createLessonChar('ى', ARABIC_KEY_MAP['ى'], 'left_index'),
      createLessonChar('ى', ARABIC_KEY_MAP['ى'], 'left_index'),
      createLessonChar('ئ', ARABIC_KEY_MAP['ئ'], 'left_pinky'),
      createLessonChar('ئ', ARABIC_KEY_MAP['ئ'], 'left_pinky'),
      createLessonChar('ئ', ARABIC_KEY_MAP['ئ'], 'left_pinky'),
      createLessonChar('ؤ', ARABIC_KEY_MAP['ؤ'], 'left_ring'),
      createLessonChar('ؤ', ARABIC_KEY_MAP['ؤ'], 'left_ring'),
      createLessonChar('ؤ', ARABIC_KEY_MAP['ؤ'], 'left_ring'),
    ],
  },

  // === Lesson 9: Harakat (Short Vowels) ===
  {
    id: 'ar-harakat',
    title: 'Harakat - Short Vowel Marks',
    language: 'ar',
    script: 'arabic',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'fatha_damma_kasra',
      speed: 'accuracy',
    },
    content: [
      // Fatha (َ)
      { char: 'َ', code: 'Fatha', expectedFinger: 'right_index' },
      { char: 'َ', code: 'Fatha', expectedFinger: 'right_index' },
      { char: 'َ', code: 'Fatha', expectedFinger: 'right_index' },
      // Damma (ُ)
      { char: 'ُ', code: 'Damma', expectedFinger: 'right_index' },
      { char: 'ُ', code: 'Damma', expectedFinger: 'right_index' },
      { char: 'ُ', code: 'Damma', expectedFinger: 'right_index' },
      // Kasra (ِ)
      { char: 'ِ', code: 'Kasra', expectedFinger: 'right_index' },
      { char: 'ِ', code: 'Kasra', expectedFinger: 'right_index' },
      { char: 'ِ', code: 'Kasra', expectedFinger: 'right_index' },
      // Sukun (ْ)
      { char: 'ْ', code: 'Sukun', expectedFinger: 'right_index' },
      { char: 'ْ', code: 'Sukun', expectedFinger: 'right_index' },
      { char: 'ْ', code: 'Sukun', expectedFinger: 'right_index' },
    ],
  },

  // === Lesson 10: Simple Arabic Words ===
  {
    id: 'ar-simple-words',
    title: 'Simple Arabic Words',
    language: 'ar',
    script: 'arabic',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'simple_words',
      speed: 'accuracy',
    },
    content: [
      // باب (door)
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // كتاب (book)
      createLessonChar('ك', ARABIC_KEY_MAP['ك'], 'right_pinky'),
      createLessonChar('ت', ARABIC_KEY_MAP['ت'], 'right_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // بيت (house)
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ت', ARABIC_KEY_MAP['ت'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ماء (water)
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ء', ARABIC_KEY_MAP['ء'], 'left_ring'),
    ],
  },

  // === Lesson 11: Weak Letters (Alif, Waw, Ya) ===
  {
    id: 'ar-weak-letters',
    title: 'Weak Letters - Alif, Waw, Ya',
    language: 'ar',
    script: 'arabic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'weak_letters',
      speed: 'accuracy',
    },
    content: [
      // Long vowel patterns
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      // Combined patterns
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('ن', ARABIC_KEY_MAP['ن'], 'right_middle'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('ن', ARABIC_KEY_MAP['ن'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('ف', ARABIC_KEY_MAP['ف'], 'left_index'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ف', ARABIC_KEY_MAP['ف'], 'left_index'),
    ],
  },

  // === Lesson 12: Sun Letters (الحروف الشمسية) ===
  {
    id: 'ar-sun-letters',
    title: 'Sun Letters - Al-Shamsiyyah',
    language: 'ar',
    script: 'arabic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'sun_letters',
      speed: 'accuracy',
    },
    content: [
      // Sun letters: ت ث د ذ ر ز س ش ص ض ط ظ ل ن
      createLessonChar('ت', ARABIC_KEY_MAP['ت'], 'right_index'),
      createLessonChar('ث', ARABIC_KEY_MAP['ث'], 'left_ring'),
      createLessonChar('د', ARABIC_KEY_MAP['د'], 'right_pinky'),
      createLessonChar('ذ', ARABIC_KEY_MAP['ذ'], 'right_pinky'),
      createLessonChar('ر', ARABIC_KEY_MAP['ر'], 'left_middle'),
      createLessonChar('ز', ARABIC_KEY_MAP['ز'], 'right_index'),
      createLessonChar('س', ARABIC_KEY_MAP['س'], 'left_ring'),
      createLessonChar('ش', ARABIC_KEY_MAP['ش'], 'left_pinky'),
      createLessonChar('ص', ARABIC_KEY_MAP['ص'], 'left_ring'),
      createLessonChar('ض', ARABIC_KEY_MAP['ض'], 'left_pinky'),
      createLessonChar('ط', ARABIC_KEY_MAP['ط'], 'right_pinky'),
      createLessonChar('ظ', ARABIC_KEY_MAP['ظ'], 'right_middle'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('ن', ARABIC_KEY_MAP['ن'], 'right_middle'),
    ],
  },

  // === Lesson 13: Moon Letters (الحروف القمرية) ===
  {
    id: 'ar-moon-letters',
    title: 'Moon Letters - Al-Qamariyyah',
    language: 'ar',
    script: 'arabic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'moon_letters',
      speed: 'accuracy',
    },
    content: [
      // Moon letters: أ ب ج ح خ ع غ ف ق ك م هـ و ي
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ب', ARABIC_KEY_MAP['ب'], 'left_index'),
      createLessonChar('ج', ARABIC_KEY_MAP['ج'], 'right_pinky'),
      createLessonChar('ح', ARABIC_KEY_MAP['ح'], 'right_pinky'),
      createLessonChar('خ', ARABIC_KEY_MAP['خ'], 'right_pinky'),
      createLessonChar('ع', ARABIC_KEY_MAP['ع'], 'right_index'),
      createLessonChar('غ', ARABIC_KEY_MAP['غ'], 'right_index'),
      createLessonChar('ف', ARABIC_KEY_MAP['ف'], 'left_index'),
      createLessonChar('ق', ARABIC_KEY_MAP['ق'], 'left_ring'),
      createLessonChar('ك', ARABIC_KEY_MAP['ك'], 'right_pinky'),
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
      createLessonChar('ه', ARABIC_KEY_MAP['ه'], 'right_index'),
      createLessonChar('و', ARABIC_KEY_MAP['و'], 'right_index'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
    ],
  },

  // === Lesson 14: Arabic Numbers ===
  {
    id: 'ar-numbers',
    title: 'Arabic-Indic Numerals',
    language: 'ar',
    script: 'arabic',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'arabic_numbers',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('١', ARABIC_KEY_MAP['١'], 'left_pinky'),
      createLessonChar('٢', ARABIC_KEY_MAP['٢'], 'left_ring'),
      createLessonChar('٣', ARABIC_KEY_MAP['٣'], 'left_middle'),
      createLessonChar('٤', ARABIC_KEY_MAP['٤'], 'left_index'),
      createLessonChar('٥', ARABIC_KEY_MAP['٥'], 'left_index'),
      createLessonChar('٦', ARABIC_KEY_MAP['٦'], 'right_index'),
      createLessonChar('٧', ARABIC_KEY_MAP['٧'], 'right_index'),
      createLessonChar('٨', ARABIC_KEY_MAP['٨'], 'right_middle'),
      createLessonChar('٩', ARABIC_KEY_MAP['٩'], 'right_ring'),
      createLessonChar('٠', ARABIC_KEY_MAP['٠'], 'right_pinky'),
    ],
  },

  // === Lesson 15: Common Phrases ===
  {
    id: 'ar-common-phrases',
    title: 'Common Arabic Phrases',
    language: 'ar',
    script: 'arabic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_phrases',
      speed: 'speed',
    },
    content: [
      // السلام عليكم
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('س', ARABIC_KEY_MAP['س'], 'left_ring'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('ا', ARABIC_KEY_MAP['ا'], 'right_index'),
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('ع', ARABIC_KEY_MAP['ع'], 'right_index'),
      createLessonChar('ل', ARABIC_KEY_MAP['ل'], 'left_index'),
      createLessonChar('ي', ARABIC_KEY_MAP['ي'], 'left_middle'),
      createLessonChar('ك', ARABIC_KEY_MAP['ك'], 'right_pinky'),
      createLessonChar('م', ARABIC_KEY_MAP['م'], 'right_ring'),
    ],
  },
];

// Export individual lesson categories for convenience
export const arabicAlphabetLessons = arabicLessons.filter((l) =>
  l.id.startsWith('ar-alphabet')
);

export const arabicHarakatLessons = arabicLessons.filter((l) =>
  l.id.includes('harakat')
);

export const arabicGrammarLessons = arabicLessons.filter((l) =>
  l.id.includes('sun-letters') || l.id.includes('moon-letters') || l.id.includes('weak-letters')
);

export const arabicPhraseLessons = arabicLessons.filter((l) =>
  l.id.includes('simple-words') || l.id.includes('phrases')
);

export default arabicLessons;
