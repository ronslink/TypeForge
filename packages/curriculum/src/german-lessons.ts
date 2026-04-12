import type { Lesson, Finger, LessonChar } from './lesson-registry.js';

function generateDrill(char: string, code: string, finger: Finger, length: number = 60): LessonChar[] {
  return Array(length).fill(null).map((_, i) => {
    if (i > 0 && (i + 1) % 6 === 0) {
      return { char: ' ', code: 'Space', expectedFinger: 'left_thumb' };
    }
    return { char, code, expectedFinger: finger };
  });
}

function generateSequence(text: string): LessonChar[] {
  // Simple mapping for common characters (not perfectly accurate for mapping fingers, 
  // but sufficient for basic content rendering)
  const charMap: Record<string, { code: string, finger: Finger }> = {
    'a': { code: 'KeyA', finger: 'left_pinky' },
    'b': { code: 'KeyB', finger: 'left_index' },
    'c': { code: 'KeyC', finger: 'left_middle' },
    'd': { code: 'KeyD', finger: 'left_middle' },
    'e': { code: 'KeyE', finger: 'left_middle' },
    'f': { code: 'KeyF', finger: 'left_index' },
    'g': { code: 'KeyG', finger: 'left_index' },
    'h': { code: 'KeyH', finger: 'right_index' },
    'i': { code: 'KeyI', finger: 'right_middle' },
    'j': { code: 'KeyJ', finger: 'right_index' },
    'k': { code: 'KeyK', finger: 'right_middle' },
    'l': { code: 'KeyL', finger: 'right_ring' },
    'm': { code: 'KeyM', finger: 'right_index' },
    'n': { code: 'KeyN', finger: 'right_index' },
    'o': { code: 'KeyO', finger: 'right_ring' },
    'p': { code: 'KeyP', finger: 'right_pinky' },
    'q': { code: 'KeyQ', finger: 'left_pinky' },
    'r': { code: 'KeyR', finger: 'left_index' },
    's': { code: 'KeyS', finger: 'left_ring' },
    't': { code: 'KeyT', finger: 'left_index' },
    'u': { code: 'KeyU', finger: 'right_index' },
    'v': { code: 'KeyV', finger: 'left_index' },
    'w': { code: 'KeyW', finger: 'left_ring' },
    'x': { code: 'KeyX', finger: 'left_ring' },
    'y': { code: 'KeyY', finger: 'right_index' }, // On QWERTZ this is left bottom, but keeping semantic for now
    'z': { code: 'KeyZ', finger: 'left_pinky' }, // On QWERTZ this is top middle
    'ä': { code: 'Quote', finger: 'right_pinky' },
    'ö': { code: 'Semicolon', finger: 'right_pinky' },
    'ü': { code: 'BracketLeft', finger: 'right_pinky' },
    'ß': { code: 'Minus', finger: 'right_pinky' },
    ' ': { code: 'Space', finger: 'left_thumb' },
  };

  return text.split('').map(char => {
    const defaultFinger: Finger = 'right_index';
    const lower = char.toLowerCase();
    const mapped = charMap[lower] || { code: 'Unknown', finger: defaultFinger };
    return {
      char,
      code: mapped.code,
      expectedFinger: mapped.finger
    };
  });
}

export const germanLessons: Lesson[] = [
  {
    id: 'de-umlauts-1',
    title: 'Deutsche Umlaute (Ä, Ö, Ü)',
    language: 'de',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'right_pinky',
      key_bigram: 'äöü',
      speed: 'accuracy',
    },
    content: generateSequence('äääää ööööö üüüüü äääää ööööö üüüüü äääää ööööö üüüüü'),
  },
  {
    id: 'de-eszett-1',
    title: 'Das Eszett (ß)',
    language: 'de',
    script: 'latin',
    difficulty: 2,
    tags: {
      hand: 'right',
      finger: 'right_pinky',
      key_bigram: 'ß',
      speed: 'accuracy',
    },
    content: generateSequence('ßßßßß ßßßßß ßßßßß ßßßßß ßßßßß ßßßßß'),
  },
  {
    id: 'de-common-words-1',
    title: 'Häufige deutsche Wörter',
    language: 'de',
    script: 'latin',
    difficulty: 3,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'der_die_das',
      speed: 'speed',
    },
    content: generateSequence('der die das und in den von zu das mit sich des auf für ist im dem nicht ein eine als auch es an werden aus er hat dass sie nach wird bei'),
  },
  {
    id: 'de-verbs-1',
    title: 'Deutsche Verben',
    language: 'de',
    script: 'latin',
    difficulty: 4,
    tags: {
      hand: 'both',
      finger: 'all',
      key_bigram: 'en',
      speed: 'accuracy',
    },
    content: generateSequence('haben sein werden können müssen sollen wollen dürfen machen lassen gehen sehen stehen bleiben finden liegen heißen denken wissen tun'),
  }
];
