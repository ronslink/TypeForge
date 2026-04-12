/**
 * Greek Lessons (Ελληνικά)
 * 10 progressive lessons for learning Greek typing with proper finger assignments
 */

import type { Lesson, LessonChar, Finger } from './lesson-registry.js';

// Helper to create lesson characters with consistent structure
function createLessonChar(char: string, code: string | undefined, finger: Finger): LessonChar {
  return { char, code: code!, expectedFinger: finger };
}

// Greek letter to key code mapping (Greek keyboard layout on QWERTY physical keys)
const GREEK_KEY_MAP: Record<string, string> = {
  // Row 2 (QWERTY row)
  ';': 'KeyQ',
  'ς': 'KeyW',
  'ε': 'KeyE',
  'ρ': 'KeyR',
  'τ': 'KeyT',
  'υ': 'KeyY',
  'θ': 'KeyU',
  'ι': 'KeyI',
  'ο': 'KeyO',
  'π': 'KeyP',

  // Row 3 (home row)
  'α': 'KeyA',
  'σ': 'KeyS',
  'δ': 'KeyD',
  'φ': 'KeyF',
  'γ': 'KeyG',
  'η': 'KeyH',
  'ξ': 'KeyJ',
  'κ': 'KeyK',
  'λ': 'KeyL',
  'ά': 'Semicolon',

  // Row 4 (bottom row)
  'ζ': 'KeyZ',
  'χ': 'KeyX',
  'ψ': 'KeyC',
  'ω': 'KeyV',
  'β': 'KeyB',
  'ν': 'KeyN',
  'μ': 'KeyM',

  // Space
  ' ': 'Space',
};

/**
 * Greek Lessons - 10 progressive lessons
 */
export const greekLessons: Lesson[] = [
  // === Lesson 1: Greek Alphabet - Home Row Left (Α, Σ, Δ, Φ) ===
  {
    id: 'el-home-row-left',
    title: 'Greek Home Row - Left Hand (Α, Σ, Δ, Φ)',
    language: 'el',
    script: 'greek',
    difficulty: 1,
    tags: {
      hand: 'left',
      finger: 'all',
      key_bigram: 'ασδφ',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('δ', GREEK_KEY_MAP['δ'], 'left_middle'),
      createLessonChar('δ', GREEK_KEY_MAP['δ'], 'left_middle'),
      createLessonChar('δ', GREEK_KEY_MAP['δ'], 'left_middle'),
      createLessonChar('φ', GREEK_KEY_MAP['φ'], 'left_index'),
      createLessonChar('φ', GREEK_KEY_MAP['φ'], 'left_index'),
      createLessonChar('φ', GREEK_KEY_MAP['φ'], 'left_index'),
    ],
  },

  // === Lesson 2: Greek Alphabet - Home Row Right (Η, Ξ, Κ, Λ) ===
  {
    id: 'el-home-row-right',
    title: 'Greek Home Row - Right Hand (Η, Ξ, Κ, Λ)',
    language: 'el',
    script: 'greek',
    difficulty: 1,
    tags: {
      hand: 'right',
      finger: 'all',
      key_bigram: 'ηξκλ',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('ξ', GREEK_KEY_MAP['ξ'], 'right_index'),
      createLessonChar('ξ', GREEK_KEY_MAP['ξ'], 'right_index'),
      createLessonChar('ξ', GREEK_KEY_MAP['ξ'], 'right_index'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
    ],
  },

  // === Lesson 3: Greek Alphabet - Top Row Vowels (Ε, Υ, Θ, Ι, Ο) ===
  {
    id: 'el-top-row-vowels',
    title: 'Greek Top Row - Vowels (Ε, Υ, Θ, Ι, Ο)',
    language: 'el',
    script: 'greek',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ευθιο',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('υ', GREEK_KEY_MAP['υ'], 'right_index'),
      createLessonChar('υ', GREEK_KEY_MAP['υ'], 'right_index'),
      createLessonChar('υ', GREEK_KEY_MAP['υ'], 'right_index'),
      createLessonChar('θ', GREEK_KEY_MAP['θ'], 'right_index'),
      createLessonChar('θ', GREEK_KEY_MAP['θ'], 'right_index'),
      createLessonChar('θ', GREEK_KEY_MAP['θ'], 'right_index'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
    ],
  },

  // === Lesson 4: Greek Alphabet - Top Row Consonants (Ρ, Τ, Π) ===
  {
    id: 'el-top-row-consonants',
    title: 'Greek Top Row - Consonants (Ρ, Τ, Π)',
    language: 'el',
    script: 'greek',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ρτπ',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('π', GREEK_KEY_MAP['π'], 'right_pinky'),
      createLessonChar('π', GREEK_KEY_MAP['π'], 'right_pinky'),
      createLessonChar('π', GREEK_KEY_MAP['π'], 'right_pinky'),
    ],
  },

  // === Lesson 5: Greek Alphabet - Bottom Row (Ζ, Χ, Ψ, Ω, Β, Ν, Μ) ===
  {
    id: 'el-bottom-row',
    title: 'Greek Bottom Row (Ζ, Χ, Ψ, Ω, Β, Ν, Μ)',
    language: 'el',
    script: 'greek',
    difficulty: 2,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ζχψωβνμ',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('ζ', GREEK_KEY_MAP['ζ'], 'left_pinky'),
      createLessonChar('ζ', GREEK_KEY_MAP['ζ'], 'left_pinky'),
      createLessonChar('χ', GREEK_KEY_MAP['χ'], 'left_ring'),
      createLessonChar('χ', GREEK_KEY_MAP['χ'], 'left_ring'),
      createLessonChar('ψ', GREEK_KEY_MAP['ψ'], 'left_middle'),
      createLessonChar('ψ', GREEK_KEY_MAP['ψ'], 'left_middle'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
      createLessonChar('β', GREEK_KEY_MAP['β'], 'left_index'),
      createLessonChar('β', GREEK_KEY_MAP['β'], 'left_index'),
      createLessonChar('ν', GREEK_KEY_MAP['ν'], 'right_index'),
      createLessonChar('ν', GREEK_KEY_MAP['ν'], 'right_index'),
      createLessonChar('μ', GREEK_KEY_MAP['μ'], 'right_index'),
      createLessonChar('μ', GREEK_KEY_MAP['μ'], 'right_index'),
    ],
  },

  // === Lesson 6: Greek Home Row Complete ===
  {
    id: 'el-home-row-complete',
    title: 'Greek Home Row - Complete (ΑΣΔΦΗΞΚΛ)',
    language: 'el',
    script: 'greek',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'ασδφηξκλ',
      speed: 'accuracy',
    },
    content: [
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('δ', GREEK_KEY_MAP['δ'], 'left_middle'),
      createLessonChar('φ', GREEK_KEY_MAP['φ'], 'left_index'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('ξ', GREEK_KEY_MAP['ξ'], 'right_index'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('δ', GREEK_KEY_MAP['δ'], 'left_middle'),
      createLessonChar('φ', GREEK_KEY_MAP['φ'], 'left_index'),
    ],
  },

  // === Lesson 7: Common Greek Words - Part 1 ===
  {
    id: 'el-common-words-1',
    title: 'Common Greek Words - Basics',
    language: 'el',
    script: 'greek',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'common_words',
      speed: 'accuracy',
    },
    content: [
      // και (and)
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // για (for)
      createLessonChar('γ', GREEK_KEY_MAP['γ'], 'left_index'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // του (of)
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('υ', GREEK_KEY_MAP['υ'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // την (the)
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('ν', GREEK_KEY_MAP['ν'], 'right_index'),
    ],
  },

  // === Lesson 8: Common Greek Words - Part 2 ===
  {
    id: 'el-common-words-2',
    title: 'Common Greek Words - Pronouns & Verbs',
    language: 'el',
    script: 'greek',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'pronouns_verbs',
      speed: 'accuracy',
    },
    content: [
      // είναι (is)
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('ν', GREEK_KEY_MAP['ν'], 'right_index'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // έχω (I have)
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('χ', GREEK_KEY_MAP['χ'], 'left_ring'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // μπορώ (can)
      createLessonChar('μ', GREEK_KEY_MAP['μ'], 'right_index'),
      createLessonChar('π', GREEK_KEY_MAP['π'], 'right_pinky'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // θέλω (I want)
      createLessonChar('θ', GREEK_KEY_MAP['θ'], 'right_index'),
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
    ],
  },

  // === Lesson 9: Greek Greetings ===
  {
    id: 'el-greetings',
    title: 'Greek Greetings & Polite Expressions',
    language: 'el',
    script: 'greek',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'greetings',
      speed: 'speed',
    },
    content: [
      // γεια (hi)
      createLessonChar('γ', GREEK_KEY_MAP['γ'], 'left_index'),
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // σου (you)
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('υ', GREEK_KEY_MAP['υ'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // ευχαριστώ (thank you)
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('υ', GREEK_KEY_MAP['υ'], 'right_index'),
      createLessonChar('χ', GREEK_KEY_MAP['χ'], 'left_ring'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('σ', GREEK_KEY_MAP['σ'], 'left_ring'),
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      // παρακαλώ (please)
      createLessonChar('π', GREEK_KEY_MAP['π'], 'right_pinky'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('ω', GREEK_KEY_MAP['ω'], 'left_index'),
    ],
  },

  // === Lesson 10: Greek Speed Drill ===
  {
    id: 'el-speed-drill',
    title: 'Greek Speed & Endurance Drill',
    language: 'el',
    script: 'greek',
    difficulty: 5,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'mixed',
      speed: 'speed',
    },
    content: [
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('ν', GREEK_KEY_MAP['ν'], 'right_index'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('μ', GREEK_KEY_MAP['μ'], 'right_index'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('ε', GREEK_KEY_MAP['ε'], 'left_middle'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('ν', GREEK_KEY_MAP['ν'], 'right_index'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('π', GREEK_KEY_MAP['π'], 'right_pinky'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('λ', GREEK_KEY_MAP['λ'], 'right_ring'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      { char: ' ', code: 'Space', expectedFinger: 'left_thumb' },
      createLessonChar('δ', GREEK_KEY_MAP['δ'], 'left_middle'),
      createLessonChar('η', GREEK_KEY_MAP['η'], 'right_index'),
      createLessonChar('μ', GREEK_KEY_MAP['μ'], 'right_index'),
      createLessonChar('ο', GREEK_KEY_MAP['ο'], 'right_ring'),
      createLessonChar('κ', GREEK_KEY_MAP['κ'], 'right_middle'),
      createLessonChar('ρ', GREEK_KEY_MAP['ρ'], 'left_index'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
      createLessonChar('τ', GREEK_KEY_MAP['τ'], 'left_index'),
      createLessonChar('ι', GREEK_KEY_MAP['ι'], 'right_middle'),
      createLessonChar('α', GREEK_KEY_MAP['α'], 'left_pinky'),
    ],
  },
];

export default greekLessons;
