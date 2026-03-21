/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo-2 algorithm for calculating optimal review intervals
 */

export interface SM2Result {
  /** The new interval in days until the next review */
  interval: number;
  /** The updated ease factor (typically 1.3-2.5) */
  easeFactor: number;
  /** The updated repetition count */
  repetitions: number;
  /** The calculated next review date */
  nextReviewDate: Date;
}

/**
 * Calculate the next review using the SM-2 algorithm
 * 
 * @param quality - Response quality (0-5):
 *   0 = Complete blackout
 *   1 = Incorrect response, correct one remembered
 *   2 = Incorrect response, easy to recall correct one
 *   3 = Correct response, recalled with serious difficulty
 *   4 = Correct response, after hesitation
 *   5 = Correct response, perfect
 * @param easeFactor - Current ease factor (default: 2.5)
 * @param interval - Current interval in days (default: 0)
 * @param repetitions - Number of successful repetitions so far (default: 0)
 * @returns SM2Result with updated values
 */
export function calculateNextReview(
  quality: number,
  easeFactor: number = 2.5,
  interval: number = 0,
  repetitions: number = 0
): SM2Result {
  // Clamp quality to valid range
  const q = Math.max(0, Math.min(5, quality));
  
  // Clamp ease factor to minimum of 1.3
  let newEaseFactor = easeFactor;
  
  // Calculate new ease factor
  newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEaseFactor < 1.3) {
    newEaseFactor = 1.3;
  }
  
  let newInterval: number;
  let newRepetitions: number;
  
  if (q < 3) {
    // If response quality is less than 3, start repetitions from beginning
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    
    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }
  
  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
  return {
    interval: newInterval,
    easeFactor: newEaseFactor,
    repetitions: newRepetitions,
    nextReviewDate,
  };
}

/**
 * Convert accuracy percentage to SM-2 quality rating
 * 
 * @param accuracy - Accuracy percentage (0-100)
 * @returns Quality rating (0-5)
 */
export function accuracyToQuality(accuracy: number): number {
  if (accuracy >= 95) return 5;
  if (accuracy >= 90) return 4;
  if (accuracy >= 85) return 3;
  if (accuracy >= 70) return 2;
  if (accuracy >= 50) return 1;
  return 0;
}
