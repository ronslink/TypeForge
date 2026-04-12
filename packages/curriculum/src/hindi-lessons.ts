/**
 * Hindi Devanagari Lessons
 * 10 lessons for learning Hindi typing with proper finger assignments
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string | undefined, finger: Finger): LessonChar {
  return { char, code: code!, expectedFinger: finger };
}

// Hindi Devanagari letter to key code mapping (phonetic layout)
const HINDI_KEY_MAP: Record<string, string> = {
  // Row 2 (top letter row) - vowels and consonants
  'ौ': 'KeyQ',
  'औ': 'KeyQ',
  'ॆ': 'KeyW',
  'ऎ': 'KeyW',
  'े': 'KeyE',
  'ए': 'KeyE',
  'र': 'KeyR',
  'त': 'KeyT',
  'थ': 'KeyT',
  'य': 'KeyY',
  'उ': 'KeyU',
  'ऊ': 'KeyU',
  'ी': 'KeyI',
  'ई': 'KeyI',
  'ॊ': 'KeyO',
  'ऒ': 'KeyO',
  'ॅ': 'KeyP',
  'ऍ': 'KeyP',

  // Row 3 (home row) - main consonants and vowels
  'अ': 'KeyA',
  'आ': 'KeyA',
  'स': 'KeyS',
  'द': 'KeyD',
  'ध': 'KeyD',
  'फ': 'KeyF',
  'ग': 'KeyG',
  'घ': 'KeyG',
  'ह': 'KeyH',
  'ज': 'KeyJ',
  'झ': 'KeyJ',
  'क': 'KeyK',
  'ख': 'KeyK',
  'ल': 'KeyL',
  'ळ': 'KeyL',

  // Row 4 (bottom row) - additional consonants
  '़': 'KeyZ',  // nukta
  'क्ष': 'KeyX',
  'छ': 'KeyC',
  'व': 'KeyV',
  'ब': 'KeyB',
  'भ': 'KeyB',
  'न': 'KeyN',
  'ण': 'KeyN',
  'म': 'KeyM',

  // Special characters
  ' ': 'Space',
};

/**
 * Hindi Devanagari Lessons - 10 progressive lessons
 */
export const hindiLessons: Lesson[] = [
  // === Lesson 1: Home Row Left Hand (अ-स-द-फ-ग) ===
  {
    id: 'hi-alphabet-1',
    title: 'Devanagari Home Row - Left Hand (अ-स-द-फ-ग)',
    language: 'hi',
    script: 'devanagari',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'a_s_d_f_g',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('अ', HINDI_KEY_MAP['अ'], 'left_pinky'),
      createLessonChar('अ', HINDI_KEY_MAP['अ'], 'left_pinky'),
      createLessonChar('अ', HINDI_KEY_MAP['अ'], 'left_pinky'),
      createLessonChar('स', HINDI_KEY_MAP['स'], 'left_ring'),
      createLessonChar('स', HINDI_KEY_MAP['स'], 'left_ring'),
      createLessonChar('स', HINDI_KEY_MAP['स'], 'left_ring'),
      createLessonChar('द', HINDI_KEY_MAP['द'], 'left_middle'),
      createLessonChar('द', HINDI_KEY_MAP['द'], 'left_middle'),
      createLessonChar('द', HINDI_KEY_MAP['द'], 'left_middle'),
      createLessonChar('फ', HINDI_KEY_MAP['फ'], 'left_index'),
      createLessonChar('फ', HINDI_KEY_MAP['फ'], 'left_index'),
      createLessonChar('फ', HINDI_KEY_MAP['फ'], 'left_index'),
      createLessonChar('ग', HINDI_KEY_MAP['ग'], 'left_index'),
      createLessonChar('ग', HINDI_KEY_MAP['ग'], 'left_index'),
      createLessonChar('ग', HINDI_KEY_MAP['ग'], 'left_index'),
    ],
  },

  // === Lesson 2: Home Row Right Hand (ह-ज-क-ल) ===
  {
    id: 'hi-alphabet-2',
    title: 'Devanagari Home Row - Right Hand (ह-ज-क-ल)',
    language: 'hi',
    script: 'devanagari',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'h_j_k_l',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ज', HINDI_KEY_MAP['ज'], 'right_index'),
      createLessonChar('ज', HINDI_KEY_MAP['ज'], 'right_index'),
      createLessonChar('ज', HINDI_KEY_MAP['ज'], 'right_index'),
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('ल', HINDI_KEY_MAP['ल'], 'right_ring'),
      createLessonChar('ल', HINDI_KEY_MAP['ल'], 'right_ring'),
      createLessonChar('ल', HINDI_KEY_MAP['ल'], 'right_ring'),
    ],
  },

  // === Lesson 3: Top Row Vowels (ए-र-त-य-उ-ई) ===
  {
    id: 'hi-alphabet-3',
    title: 'Devanagari Vowels - Top Row (ए-र-त-य-उ-ई)',
    language: 'hi',
    script: 'devanagari',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'e_r_t_y_u_i',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ए', HINDI_KEY_MAP['ए'], 'left_middle'),
      createLessonChar('ए', HINDI_KEY_MAP['ए'], 'left_middle'),
      createLessonChar('र', HINDI_KEY_MAP['र'], 'left_index'),
      createLessonChar('र', HINDI_KEY_MAP['र'], 'left_index'),
      createLessonChar('त', HINDI_KEY_MAP['त'], 'left_index'),
      createLessonChar('त', HINDI_KEY_MAP['त'], 'left_index'),
      createLessonChar('य', HINDI_KEY_MAP['य'], 'right_index'),
      createLessonChar('य', HINDI_KEY_MAP['य'], 'right_index'),
      createLessonChar('उ', HINDI_KEY_MAP['उ'], 'right_index'),
      createLessonChar('उ', HINDI_KEY_MAP['उ'], 'right_index'),
      createLessonChar('ई', HINDI_KEY_MAP['ई'], 'right_middle'),
      createLessonChar('ई', HINDI_KEY_MAP['ई'], 'right_middle'),
    ],
  },

  // === Lesson 4: Bottom Row Consonants (व-ब-न-म) ===
  {
    id: 'hi-alphabet-4',
    title: 'Devanagari Bottom Row (व-ब-न-म)',
    language: 'hi',
    script: 'devanagari',
    difficulty: 1,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'v_b_n_m',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('व', HINDI_KEY_MAP['व'], 'left_index'),
      createLessonChar('व', HINDI_KEY_MAP['व'], 'left_index'),
      createLessonChar('व', HINDI_KEY_MAP['व'], 'left_index'),
      createLessonChar('ब', HINDI_KEY_MAP['ब'], 'left_index'),
      createLessonChar('ब', HINDI_KEY_MAP['ब'], 'left_index'),
      createLessonChar('ब', HINDI_KEY_MAP['ब'], 'left_index'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
    ],
  },

  // === Lesson 5: Special Consonants (क्ष-छ-ध-घ-ख-झ) ===
  {
    id: 'hi-alphabet-5',
    title: 'Devanagari Special Consonants',
    language: 'hi',
    script: 'devanagari',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ksha_chha_dha_gha_kha_jha',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('क्ष', HINDI_KEY_MAP['क्ष'], 'left_ring'),
      createLessonChar('क्ष', HINDI_KEY_MAP['क्ष'], 'left_ring'),
      createLessonChar('छ', HINDI_KEY_MAP['छ'], 'left_middle'),
      createLessonChar('छ', HINDI_KEY_MAP['छ'], 'left_middle'),
      createLessonChar('ध', HINDI_KEY_MAP['ध'], 'left_middle'),
      createLessonChar('ध', HINDI_KEY_MAP['ध'], 'left_middle'),
      createLessonChar('घ', HINDI_KEY_MAP['घ'], 'left_index'),
      createLessonChar('घ', HINDI_KEY_MAP['घ'], 'left_index'),
      createLessonChar('ख', HINDI_KEY_MAP['ख'], 'right_middle'),
      createLessonChar('ख', HINDI_KEY_MAP['ख'], 'right_middle'),
      createLessonChar('झ', HINDI_KEY_MAP['झ'], 'right_index'),
      createLessonChar('झ', HINDI_KEY_MAP['झ'], 'right_index'),
    ],
  },

  // === Lesson 6: Common Two-Letter Words ===
  {
    id: 'hi-simple-words',
    title: 'Simple Hindi Words',
    language: 'hi',
    script: 'devanagari',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'simple_words',
      speed: 'accuracy',
    },
    content: [
      // यह (this)
      createLessonChar('य', HINDI_KEY_MAP['य'], 'right_index'),
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // वह (that)
      createLessonChar('व', HINDI_KEY_MAP['व'], 'left_index'),
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // हाँ (yes)
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('ं', HINDI_KEY_MAP['ं'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // नहीं (no/not)
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ी', HINDI_KEY_MAP['ी'], 'right_middle'),
      createLessonChar('ं', HINDI_KEY_MAP['ं'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // एक (one)
      createLessonChar('ए', HINDI_KEY_MAP['ए'], 'left_middle'),
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
    ],
  },

  // === Lesson 7: Greetings and Common Words ===
  {
    id: 'hi-greetings',
    title: 'Hindi Greetings',
    language: 'hi',
    script: 'devanagari',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'greetings',
      speed: 'accuracy',
    },
    content: [
      // नमस्ते (hello/namaste)
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      createLessonChar('स', HINDI_KEY_MAP['स'], 'left_ring'),
      createLessonChar('्', HINDI_KEY_MAP['्'], 'left_ring'),
      createLessonChar('त', HINDI_KEY_MAP['त'], 'left_index'),
      createLessonChar('े', HINDI_KEY_MAP['े'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // धन्यवाद (thank you)
      createLessonChar('ध', HINDI_KEY_MAP['ध'], 'left_middle'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('्', HINDI_KEY_MAP['्'], 'left_ring'),
      createLessonChar('य', HINDI_KEY_MAP['य'], 'right_index'),
      createLessonChar('व', HINDI_KEY_MAP['व'], 'left_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('द', HINDI_KEY_MAP['द'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // माफ़ (sorry)
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('फ', HINDI_KEY_MAP['फ'], 'left_index'),
      createLessonChar('़', HINDI_KEY_MAP['़'], 'left_pinky'),
    ],
  },

  // === Lesson 8: Common Pronouns ===
  {
    id: 'hi-pronouns',
    title: 'Hindi Pronouns',
    language: 'hi',
    script: 'devanagari',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'pronouns',
      speed: 'accuracy',
    },
    content: [
      // मैं (I)
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      createLessonChar('ै', HINDI_KEY_MAP['ै'], 'left_pinky'),
      createLessonChar('ं', HINDI_KEY_MAP['ं'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // तू (you - informal)
      createLessonChar('त', HINDI_KEY_MAP['त'], 'left_index'),
      createLessonChar('ू', HINDI_KEY_MAP['ु'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // हम (we)
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // आप (you - formal)
      createLessonChar('आ', HINDI_KEY_MAP['आ'], 'left_pinky'),
      createLessonChar('प', HINDI_KEY_MAP['प'], 'right_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // कौन (who)
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('ौ', HINDI_KEY_MAP['ौ'], 'left_pinky'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
    ],
  },

  // === Lesson 9: Common Verbs and Questions ===
  {
    id: 'hi-verbs-questions',
    title: 'Common Verbs and Questions',
    language: 'hi',
    script: 'devanagari',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'verbs_questions',
      speed: 'speed',
    },
    content: [
      // क्या (what)
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('्', HINDI_KEY_MAP['्'], 'left_ring'),
      createLessonChar('य', HINDI_KEY_MAP['य'], 'right_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // कहाँ (where)
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('ं', HINDI_KEY_MAP['ं'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // कैसे (how)
      createLessonChar('क', HINDI_KEY_MAP['क'], 'right_middle'),
      createLessonChar('ै', HINDI_KEY_MAP['ै'], 'left_pinky'),
      createLessonChar('स', HINDI_KEY_MAP['स'], 'left_ring'),
      createLessonChar('े', HINDI_KEY_MAP['े'], 'left_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // है (is)
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ै', HINDI_KEY_MAP['ै'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // हैं (are)
      createLessonChar('ह', HINDI_KEY_MAP['ह'], 'right_index'),
      createLessonChar('ै', HINDI_KEY_MAP['ै'], 'left_pinky'),
      createLessonChar('ं', HINDI_KEY_MAP['ं'], 'left_pinky'),
    ],
  },

  // === Lesson 10: Family and Common Nouns ===
  {
    id: 'hi-family-nouns',
    title: 'Family and Common Nouns',
    language: 'hi',
    script: 'devanagari',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'family_nouns',
      speed: 'speed',
    },
    content: [
      // माँ (mother)
      createLessonChar('म', HINDI_KEY_MAP['म'], 'right_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('ं', HINDI_KEY_MAP['ं'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // पिता (father)
      createLessonChar('प', HINDI_KEY_MAP['प'], 'right_pinky'),
      createLessonChar('ि', HINDI_KEY_MAP['ि'], 'right_middle'),
      createLessonChar('त', HINDI_KEY_MAP['त'], 'left_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // घर (home)
      createLessonChar('घ', HINDI_KEY_MAP['घ'], 'left_index'),
      createLessonChar('र', HINDI_KEY_MAP['र'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // पानी (water)
      createLessonChar('प', HINDI_KEY_MAP['प'], 'right_pinky'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('ी', HINDI_KEY_MAP['ी'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // खाना (food)
      createLessonChar('ख', HINDI_KEY_MAP['ख'], 'right_middle'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
      createLessonChar('न', HINDI_KEY_MAP['न'], 'right_index'),
      createLessonChar('ा', HINDI_KEY_MAP['ा'], 'left_pinky'),
    ],
  },
];

// Export individual lesson categories for convenience
export const hindiAlphabetLessons = hindiLessons.filter((l) =>
  l.id.startsWith('hi-alphabet')
);

export const hindiWordLessons = hindiLessons.filter(
  (l) => l.id.includes('simple-words') || l.id.includes('greetings')
);

export const hindiGrammarLessons = hindiLessons.filter(
  (l) => l.id.includes('pronouns') || l.id.includes('verbs')
);

export const hindiPhraseLessons = hindiLessons.filter((l) => l.id.includes('family'));

export default hindiLessons;
