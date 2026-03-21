/**
 * Lesson Generator
 * Generates lessons based on focus keys and difficulty
 */

import type { Lesson, Exercise, DifficultyLevel } from './types.js';

export class LessonGenerator {
  /**
   * Generate a lesson for specific keys
   */
  generateForKey(
    keys: string[],
    languageCode: string,
    layoutId: string,
    difficulty: DifficultyLevel = 'beginner'
  ): Lesson {
    const exercises = this.generateExercises(keys, difficulty);

    return {
      id: `generated-${keys.join('-')}-${Date.now()}`,
      languageCode,
      layoutId,
      title: `Focus: ${keys.join(', ')}`,
      description: `Practice lesson for keys: ${keys.join(', ')}`,
      difficulty,
      focusKeys: keys,
      prerequisites: [],
      estimatedMinutes: this.estimateDuration(exercises),
      exercises,
    };
  }

  /**
   * Generate exercises based on keys and difficulty
   */
  private generateExercises(keys: string[], difficulty: DifficultyLevel): Exercise[] {
    const exercises: Exercise[] = [];

    switch (difficulty) {
      case 'beginner':
        // Single key drills
        exercises.push(this.generateKeyDrill(keys, 20));
        // Simple combinations
        exercises.push(this.generateCombinations(keys, 2, 15));
        break;

      case 'intermediate':
        // Word patterns
        exercises.push(this.generateWordPatterns(keys, 20));
        // Longer combinations
        exercises.push(this.generateCombinations(keys, 3, 15));
        break;

      case 'advanced':
        // Complex patterns
        exercises.push(this.generateComplexPatterns(keys, 25));
        // Sentences
        exercises.push(this.generateSentences(keys, 10));
        break;

      case 'expert':
        // Full sentences with all keys
        exercises.push(this.generateSentences(keys, 20));
        // Paragraphs
        exercises.push(this.generateParagraphs(keys, 3));
        break;
    }

    return exercises;
  }

  /**
   * Generate single key drill
   */
  private generateKeyDrill(keys: string[], count: number): Exercise {
    const content: string[] = [];
    for (let i = 0; i < count; i++) {
      const key = keys[i % keys.length];
      content.push(key.repeat(5 + Math.floor(Math.random() * 5)));
    }
    return {
      id: `drill-${Date.now()}`,
      type: 'words',
      content,
      focusKeys: keys,
    };
  }

  /**
   * Generate key combinations
   */
  private generateCombinations(keys: string[], length: number, count: number): Exercise {
    const content: string[] = [];
    for (let i = 0; i < count; i++) {
      let combination = '';
      for (let j = 0; j < length; j++) {
        combination += keys[Math.floor(Math.random() * keys.length)];
      }
      content.push(combination);
    }
    return {
      id: `combo-${Date.now()}`,
      type: 'words',
      content,
      focusKeys: keys,
    };
  }

  /**
   * Generate word patterns (placeholder - would use dictionary)
   */
  private generateWordPatterns(keys: string[], count: number): Exercise {
    // In production, this would use a dictionary filtered by keys
    const content: string[] = [];
    for (let i = 0; i < count; i++) {
      let word = '';
      const wordLength = 3 + Math.floor(Math.random() * 5);
      for (let j = 0; j < wordLength; j++) {
        word += keys[Math.floor(Math.random() * keys.length)];
      }
      content.push(word);
    }
    return {
      id: `words-${Date.now()}`,
      type: 'words',
      content,
      focusKeys: keys,
    };
  }

  /**
   * Generate complex patterns
   */
  private generateComplexPatterns(keys: string[], count: number): Exercise {
    const content: string[] = [];
    for (let i = 0; i < count; i++) {
      const length = 10 + Math.floor(Math.random() * 20);
      let pattern = '';
      for (let j = 0; j < length; j++) {
        pattern += keys[Math.floor(Math.random() * keys.length)];
        if (Math.random() < 0.15) pattern += ' ';
      }
      content.push(pattern.trim());
    }
    return {
      id: `complex-${Date.now()}`,
      type: 'sentences',
      content,
      focusKeys: keys,
    };
  }

  /**
   * Generate sentences (placeholder)
   */
  private generateSentences(keys: string[], count: number): Exercise {
    // In production, this would use a sentence database
    const content: string[] = [];
    for (let i = 0; i < count; i++) {
      const words = 5 + Math.floor(Math.random() * 10);
      let sentence = '';
      for (let j = 0; j < words; j++) {
        const wordLength = 3 + Math.floor(Math.random() * 6);
        for (let k = 0; k < wordLength; k++) {
          sentence += keys[Math.floor(Math.random() * keys.length)];
        }
        sentence += ' ';
      }
      content.push(sentence.trim());
    }
    return {
      id: `sentences-${Date.now()}`,
      type: 'sentences',
      content,
    };
  }

  /**
   * Generate paragraphs (placeholder)
   */
  private generateParagraphs(keys: string[], count: number): Exercise {
    const content: string[] = [];
    for (let i = 0; i < count; i++) {
      const sentences = 3 + Math.floor(Math.random() * 3);
      let paragraph = '';
      for (let j = 0; j < sentences; j++) {
        const words = 8 + Math.floor(Math.random() * 12);
        for (let k = 0; k < words; k++) {
          const wordLength = 3 + Math.floor(Math.random() * 6);
          for (let l = 0; l < wordLength; l++) {
            paragraph += keys[Math.floor(Math.random() * keys.length)];
          }
          paragraph += ' ';
        }
        paragraph = paragraph.trim() + '. ';
      }
      content.push(paragraph.trim());
    }
    return {
      id: `paragraphs-${Date.now()}`,
      type: 'paragraphs',
      content,
    };
  }

  /**
   * Estimate lesson duration in minutes
   */
  private estimateDuration(exercises: Exercise[]): number {
    let totalChars = 0;
    for (const exercise of exercises) {
      for (const content of exercise.content) {
        totalChars += content.length;
      }
    }
    // Assume 150 chars per minute for beginners
    return Math.max(3, Math.ceil(totalChars / 150));
  }
}
