/**
 * Russian Cyrillic Lesson Corpus
 * 15 progressive lessons for learning Russian typing with ЙЦУКЕН layout
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string | undefined, finger: Finger): LessonChar {
  return { char, code: code!, expectedFinger: finger };
}

// Russian letter to key code mapping (ЙЦУКЕН layout)
const RUSSIAN_KEY_MAP: Record<string, string> = {
  // Row 1 (top) - ё and numbers
  'ё': 'Backquote',
  '1': 'Digit1',
  '2': 'Digit2',
  '3': 'Digit3',
  '4': 'Digit4',
  '5': 'Digit5',
  '6': 'Digit6',
  '7': 'Digit7',
  '8': 'Digit8',
  '9': 'Digit9',
  '0': 'Digit0',
  '-': 'Minus',
  '=': 'Equal',

  // Row 2 (top letters)
  'й': 'KeyQ',
  'ц': 'KeyW',
  'у': 'KeyE',
  'к': 'KeyR',
  'е': 'KeyT',
  'н': 'KeyY',
  'г': 'KeyU',
  'ш': 'KeyI',
  'щ': 'KeyO',
  'з': 'KeyP',
  'х': 'BracketLeft',
  'ъ': 'BracketRight',

  // Row 3 (home row)
  'ф': 'KeyA',
  'ы': 'KeyS',
  'в': 'KeyD',
  'а': 'KeyF',
  'п': 'KeyG',
  'р': 'KeyH',
  'о': 'KeyJ',
  'л': 'KeyK',
  'д': 'KeyL',
  'ж': 'Semicolon',
  'э': 'Quote',
  '\\': 'Backslash',

  // Row 4 (bottom row)
  'я': 'KeyZ',
  'ч': 'KeyX',
  'с': 'KeyC',
  'м': 'KeyV',
  'и': 'KeyB',
  'т': 'KeyN',
  'ь': 'KeyM',
  'б': 'Comma',
  'ю': 'Period',
  '.': 'Slash',

  // Space
  ' ': 'Space',
};

/**
 * Russian Cyrillic Lessons - 15 progressive lessons
 */
export const russianLessons: Lesson[] = [
  // === Lesson 1: Home Row Left Hand (фыва) ===
  {
    id: 'ru-home-row-left',
    title: 'Home Row Left Hand - ФЫВА',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'fyva',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ф', RUSSIAN_KEY_MAP['ф'], 'left_pinky'),
      createLessonChar('ф', RUSSIAN_KEY_MAP['ф'], 'left_pinky'),
      createLessonChar('ф', RUSSIAN_KEY_MAP['ф'], 'left_pinky'),
      createLessonChar('ы', RUSSIAN_KEY_MAP['ы'], 'left_ring'),
      createLessonChar('ы', RUSSIAN_KEY_MAP['ы'], 'left_ring'),
      createLessonChar('ы', RUSSIAN_KEY_MAP['ы'], 'left_ring'),
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
    ],
  },

  // === Lesson 2: Home Row Right Hand (пролджэ) ===
  {
    id: 'ru-home-row-right',
    title: 'Home Row Right Hand - ПРОЛДЖЭ',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'proldzhe',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
    ],
  },

  // === Lesson 3: Home Row Combined ===
  {
    id: 'ru-home-row-combined',
    title: 'Home Row - Combined Practice',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'home_row',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ф', RUSSIAN_KEY_MAP['ф'], 'left_pinky'),
      createLessonChar('ы', RUSSIAN_KEY_MAP['ы'], 'left_ring'),
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
    ],
  },

  // === Lesson 4: Top Row Left Hand (йцук) ===
  {
    id: 'ru-top-row-left',
    title: 'Top Row Left Hand - ЙЦУК',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 2,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'jtsuk',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('й', RUSSIAN_KEY_MAP['й'], 'left_pinky'),
      createLessonChar('й', RUSSIAN_KEY_MAP['й'], 'left_pinky'),
      createLessonChar('й', RUSSIAN_KEY_MAP['й'], 'left_pinky'),
      createLessonChar('ц', RUSSIAN_KEY_MAP['ц'], 'left_ring'),
      createLessonChar('ц', RUSSIAN_KEY_MAP['ц'], 'left_ring'),
      createLessonChar('ц', RUSSIAN_KEY_MAP['ц'], 'left_ring'),
      createLessonChar('у', RUSSIAN_KEY_MAP['у'], 'left_middle'),
      createLessonChar('у', RUSSIAN_KEY_MAP['у'], 'left_middle'),
      createLessonChar('у', RUSSIAN_KEY_MAP['у'], 'left_middle'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
    ],
  },

  // === Lesson 5: Top Row Right Hand (нгшщзхъ) ===
  {
    id: 'ru-top-row-right',
    title: 'Top Row Right Hand - НГШЩЗХЪ',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'ngshschz',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('г', RUSSIAN_KEY_MAP['г'], 'right_index'),
      createLessonChar('г', RUSSIAN_KEY_MAP['г'], 'right_index'),
      createLessonChar('ш', RUSSIAN_KEY_MAP['ш'], 'right_middle'),
      createLessonChar('ш', RUSSIAN_KEY_MAP['ш'], 'right_middle'),
      createLessonChar('щ', RUSSIAN_KEY_MAP['щ'], 'right_ring'),
      createLessonChar('щ', RUSSIAN_KEY_MAP['щ'], 'right_ring'),
      createLessonChar('з', RUSSIAN_KEY_MAP['з'], 'right_pinky'),
      createLessonChar('з', RUSSIAN_KEY_MAP['з'], 'right_pinky'),
      createLessonChar('х', RUSSIAN_KEY_MAP['х'], 'right_pinky'),
      createLessonChar('х', RUSSIAN_KEY_MAP['х'], 'right_pinky'),
      createLessonChar('ъ', RUSSIAN_KEY_MAP['ъ'], 'right_pinky'),
      createLessonChar('ъ', RUSSIAN_KEY_MAP['ъ'], 'right_pinky'),
    ],
  },

  // === Lesson 6: Top Row Combined ===
  {
    id: 'ru-top-row-combined',
    title: 'Top Row - Combined Practice',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'top_row',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('й', RUSSIAN_KEY_MAP['й'], 'left_pinky'),
      createLessonChar('ц', RUSSIAN_KEY_MAP['ц'], 'left_ring'),
      createLessonChar('у', RUSSIAN_KEY_MAP['у'], 'left_middle'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('г', RUSSIAN_KEY_MAP['г'], 'right_index'),
      createLessonChar('ш', RUSSIAN_KEY_MAP['ш'], 'right_middle'),
      createLessonChar('щ', RUSSIAN_KEY_MAP['щ'], 'right_ring'),
      createLessonChar('з', RUSSIAN_KEY_MAP['з'], 'right_pinky'),
      createLessonChar('х', RUSSIAN_KEY_MAP['х'], 'right_pinky'),
      createLessonChar('ъ', RUSSIAN_KEY_MAP['ъ'], 'right_pinky'),
    ],
  },

  // === Lesson 7: Bottom Row Left Hand (ячсм) ===
  {
    id: 'ru-bottom-row-left',
    title: 'Bottom Row Left Hand - ЯЧСМ',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 2,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'jachsm',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('я', RUSSIAN_KEY_MAP['я'], 'left_pinky'),
      createLessonChar('я', RUSSIAN_KEY_MAP['я'], 'left_pinky'),
      createLessonChar('я', RUSSIAN_KEY_MAP['я'], 'left_pinky'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
    ],
  },

  // === Lesson 8: Bottom Row Right Hand (тьбю) ===
  {
    id: 'ru-bottom-row-right',
    title: 'Bottom Row Right Hand - ТЬБЮ',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'tmbyu',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('ь', RUSSIAN_KEY_MAP['ь'], 'right_index'),
      createLessonChar('ь', RUSSIAN_KEY_MAP['ь'], 'right_index'),
      createLessonChar('ь', RUSSIAN_KEY_MAP['ь'], 'right_index'),
      createLessonChar('б', RUSSIAN_KEY_MAP['б'], 'right_middle'),
      createLessonChar('б', RUSSIAN_KEY_MAP['б'], 'right_middle'),
      createLessonChar('б', RUSSIAN_KEY_MAP['б'], 'right_middle'),
      createLessonChar('ю', RUSSIAN_KEY_MAP['ю'], 'right_ring'),
      createLessonChar('ю', RUSSIAN_KEY_MAP['ю'], 'right_ring'),
      createLessonChar('ю', RUSSIAN_KEY_MAP['ю'], 'right_ring'),
    ],
  },

  // === Lesson 9: Bottom Row Combined ===
  {
    id: 'ru-bottom-row-combined',
    title: 'Bottom Row - Combined Practice',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'bottom_row',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('я', RUSSIAN_KEY_MAP['я'], 'left_pinky'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('ь', RUSSIAN_KEY_MAP['ь'], 'right_index'),
      createLessonChar('б', RUSSIAN_KEY_MAP['б'], 'right_middle'),
      createLessonChar('ю', RUSSIAN_KEY_MAP['ю'], 'right_ring'),
    ],
  },

  // === Lesson 10: All Rows Combined ===
  {
    id: 'ru-all-rows',
    title: 'All Rows - Full Keyboard Practice',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'all_rows',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('й', RUSSIAN_KEY_MAP['й'], 'left_pinky'),
      createLessonChar('ц', RUSSIAN_KEY_MAP['ц'], 'left_ring'),
      createLessonChar('у', RUSSIAN_KEY_MAP['у'], 'left_middle'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('г', RUSSIAN_KEY_MAP['г'], 'right_index'),
      createLessonChar('ш', RUSSIAN_KEY_MAP['ш'], 'right_middle'),
      createLessonChar('щ', RUSSIAN_KEY_MAP['щ'], 'right_ring'),
      createLessonChar('з', RUSSIAN_KEY_MAP['з'], 'right_pinky'),
      createLessonChar('ф', RUSSIAN_KEY_MAP['ф'], 'left_pinky'),
      createLessonChar('ы', RUSSIAN_KEY_MAP['ы'], 'left_ring'),
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
      createLessonChar('я', RUSSIAN_KEY_MAP['я'], 'left_pinky'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('ь', RUSSIAN_KEY_MAP['ь'], 'right_index'),
      createLessonChar('б', RUSSIAN_KEY_MAP['б'], 'right_middle'),
      createLessonChar('ю', RUSSIAN_KEY_MAP['ю'], 'right_ring'),
    ],
  },

  // === Lesson 11: Special Characters (ё, х, ъ, ж, э) ===
  {
    id: 'ru-special-chars',
    title: 'Special Characters - ЁХЪЖЭ',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'special',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ё', RUSSIAN_KEY_MAP['ё'], 'left_pinky'),
      createLessonChar('ё', RUSSIAN_KEY_MAP['ё'], 'left_pinky'),
      createLessonChar('ё', RUSSIAN_KEY_MAP['ё'], 'left_pinky'),
      createLessonChar('х', RUSSIAN_KEY_MAP['х'], 'right_pinky'),
      createLessonChar('х', RUSSIAN_KEY_MAP['х'], 'right_pinky'),
      createLessonChar('х', RUSSIAN_KEY_MAP['х'], 'right_pinky'),
      createLessonChar('ъ', RUSSIAN_KEY_MAP['ъ'], 'right_pinky'),
      createLessonChar('ъ', RUSSIAN_KEY_MAP['ъ'], 'right_pinky'),
      createLessonChar('ъ', RUSSIAN_KEY_MAP['ъ'], 'right_pinky'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('ж', RUSSIAN_KEY_MAP['ж'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
      createLessonChar('э', RUSSIAN_KEY_MAP['э'], 'right_pinky'),
    ],
  },

  // === Lesson 12: Common Russian Bigrams ===
  {
    id: 'ru-bigrams',
    title: 'Common Russian Bigrams',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'bigrams',
      speed: 'speed',
    },
    content: [
      // ст (common)
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      // на
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      // по
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      // не
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      // ра
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
    ],
  },

  // === Lesson 13: Simple Russian Words ===
  {
    id: 'ru-simple-words',
    title: 'Simple Russian Words',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'words',
      speed: 'speed',
    },
    content: [
      // дом (house)
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // кот (cat)
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // сад (garden)
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // час (hour)
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
    ],
  },

  // === Lesson 14: Common Russian Phrases ===
  {
    id: 'ru-phrases',
    title: 'Common Russian Phrases',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'phrases',
      speed: 'speed',
    },
    content: [
      // привет (hello)
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('р', RUSSIAN_KEY_MAP['р'], 'right_index'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // спасибо (thank you)
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('б', RUSSIAN_KEY_MAP['б'], 'right_middle'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
    ],
  },

  // === Lesson 15: Speed Drill ===
  {
    id: 'ru-speed-drill',
    title: 'Speed Drill - Full Keyboard',
    language: 'ru',
    script: 'cyrillic',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'speed',
      speed: 'speed',
    },
    content: [
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('д', RUSSIAN_KEY_MAP['д'], 'right_ring'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('в', RUSSIAN_KEY_MAP['в'], 'left_middle'),
      createLessonChar('ы', RUSSIAN_KEY_MAP['ы'], 'left_ring'),
      createLessonChar('с', RUSSIAN_KEY_MAP['с'], 'left_middle'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('п', RUSSIAN_KEY_MAP['п'], 'left_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('м', RUSSIAN_KEY_MAP['м'], 'left_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('л', RUSSIAN_KEY_MAP['л'], 'right_middle'),
      createLessonChar('н', RUSSIAN_KEY_MAP['н'], 'right_index'),
      createLessonChar('о', RUSSIAN_KEY_MAP['о'], 'right_index'),
      createLessonChar('к', RUSSIAN_KEY_MAP['к'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('и', RUSSIAN_KEY_MAP['и'], 'left_index'),
      createLessonChar('з', RUSSIAN_KEY_MAP['з'], 'right_pinky'),
      createLessonChar('у', RUSSIAN_KEY_MAP['у'], 'left_middle'),
      createLessonChar('ч', RUSSIAN_KEY_MAP['ч'], 'left_ring'),
      createLessonChar('а', RUSSIAN_KEY_MAP['а'], 'left_index'),
      createLessonChar('е', RUSSIAN_KEY_MAP['е'], 'left_index'),
      createLessonChar('т', RUSSIAN_KEY_MAP['т'], 'right_index'),
    ],
  },
];

// Export individual lesson categories for convenience
export const russianHomeRowLessons = russianLessons.filter((l) => l.id.includes('home-row'));

export const russianTopRowLessons = russianLessons.filter((l) => l.id.includes('top-row'));

export const russianBottomRowLessons = russianLessons.filter((l) => l.id.includes('bottom-row'));

export const russianAdvancedLessons = russianLessons.filter(
  (l) => l.id.includes('all-rows') || l.id.includes('special') || l.id.includes('bigrams')
);

export const russianPhraseLessons = russianLessons.filter(
  (l) => l.id.includes('words') || l.id.includes('phrases') || l.id.includes('speed')
);

export default russianLessons;
