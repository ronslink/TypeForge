/**
 * Celebration utilities for TypeForge
 * Manages milestone triggers and toast notifications
 */

import type { MilestoneType } from '../components/MilestoneToast.svelte';

export interface ToastOptions {
  message: string;
  type: MilestoneType;
  duration?: number;
}

export type ToastCallback = (options: ToastOptions) => void;

interface MilestoneConfig {
  threshold: number;
  message: string;
  type: MilestoneType;
}

/**
 * MilestoneManager - Tracks user progress and fires celebration events
 * at appropriate milestone moments
 */
export class MilestoneManager {
  private toastCallback: ToastCallback | null = null;
  private firedMilestones = new Set<string>();

  // Keystroke milestones
  private readonly keystrokeMilestones: MilestoneConfig[] = [
    { threshold: 100, message: '🎉 100 keystrokes! You\'re getting started!', type: 'info' },
    { threshold: 500, message: '🔥 500 keystrokes! Keep the momentum going!', type: 'info' },
    { threshold: 1000, message: '⭐ 1,000 keystrokes! You\'re building speed!', type: 'achievement' },
    { threshold: 5000, message: '🏆 5,000 keystrokes! Incredible dedication!', type: 'achievement' },
  ];

  // Streak milestones (days)
  private readonly streakMilestones: MilestoneConfig[] = [
    { threshold: 3, message: '🔥 3-day streak! You\'re on fire!', type: 'streak' },
    { threshold: 7, message: '🌟 7-day streak! A full week of practice!', type: 'streak' },
    { threshold: 14, message: '⚡ 14-day streak! Two weeks strong!', type: 'streak' },
    { threshold: 30, message: '🏅 30-day streak! A month of mastery!', type: 'streak' },
    { threshold: 60, message: '💎 60-day streak! Unstoppable!', type: 'streak' },
    { threshold: 100, message: '👑 100-day streak! Legendary dedication!', type: 'streak' },
  ];

  // Speed milestones (WPM)
  private readonly speedMilestones: MilestoneConfig[] = [
    { threshold: 50, message: '🚀 50 WPM! You\'re typing faster than average!', type: 'achievement' },
    { threshold: 75, message: '⚡ 75 WPM! Speed demon!', type: 'achievement' },
    { threshold: 100, message: '🔥 100 WPM! Professional speed!', type: 'achievement' },
    { threshold: 125, message: '🌟 125 WPM! Elite typist!', type: 'achievement' },
    { threshold: 150, message: '👑 150 WPM! You\'re in the top 1%!', type: 'achievement' },
  ];

  constructor(toastCallback?: ToastCallback) {
    if (toastCallback) {
      this.toastCallback = toastCallback;
    }
  }

  /**
   * Set the callback function for displaying toasts
   */
  setToastCallback(callback: ToastCallback): void {
    this.toastCallback = callback;
  }

  /**
   * Fire a toast notification
   */
  private fireToast(options: ToastOptions): void {
    if (this.toastCallback) {
      this.toastCallback(options);
    }
  }

  /**
   * Check and fire milestone if not already fired
   */
  private checkMilestone(
    key: string,
    value: number,
    milestones: MilestoneConfig[]
  ): void {
    for (const milestone of milestones) {
      if (value >= milestone.threshold && !this.firedMilestones.has(`${key}_${milestone.threshold}`)) {
        this.firedMilestones.add(`${key}_${milestone.threshold}`);
        this.fireToast({
          message: milestone.message,
          type: milestone.type,
          duration: 4000,
        });
      }
    }
  }

  /**
   * Called on each keystroke to track progress
   * Fires milestone toasts at 100, 500, 1000, 5000 keystrokes
   */
  onKeystroke(count: number): void {
    this.checkMilestone('keystroke', count, this.keystrokeMilestones);
  }

  /**
   * Called when a lesson is completed
   * Fires appropriate toast based on performance (WPM and accuracy)
   */
  onLessonComplete(wpm: number, accuracy: number): void {
    // Check for perfect accuracy first
    if (accuracy === 100) {
      this.onPerfect(accuracy);
    }

    // Check speed milestones
    this.onSpeedMilestone(wpm);

    // Performance-based messages
    if (accuracy >= 98 && wpm >= 80) {
      this.fireToast({
        message: '🏆 Outstanding! Near-perfect accuracy at high speed!',
        type: 'achievement',
        duration: 4500,
      });
    } else if (accuracy >= 95 && wpm >= 60) {
      this.fireToast({
        message: '⭐ Excellent work! Great balance of speed and accuracy!',
        type: 'achievement',
        duration: 4000,
      });
    } else if (accuracy >= 90) {
      this.fireToast({
        message: '👍 Good job! Solid accuracy, keep practicing for speed!',
        type: 'info',
        duration: 3500,
      });
    } else if (accuracy < 85) {
      this.fireToast({
        message: '💪 Keep practicing! Focus on accuracy first, speed will follow.',
        type: 'info',
        duration: 3500,
      });
    }
  }

  /**
   * Called when streak count changes
   * Fires streak toast at day milestones (3, 7, 14, 30, 60, 100)
   */
  onStreak(days: number): void {
    this.checkMilestone('streak', days, this.streakMilestones);
  }

  /**
   * Called to check for perfect accuracy
   * Fires "Perfect!" toast when accuracy = 100%
   */
  onPerfect(accuracy: number): void {
    if (accuracy === 100 && !this.firedMilestones.has('perfect_session')) {
      this.firedMilestones.add('perfect_session');
      this.fireToast({
        message: '✨ Perfect! 100% accuracy - flawless typing!',
        type: 'perfect',
        duration: 5000,
      });
    }
  }

  /**
   * Called to check speed milestones
   * Fires toast at 50, 75, 100, 125, 150 WPM
   */
  onSpeedMilestone(wpm: number): void {
    this.checkMilestone('speed', wpm, this.speedMilestones);
  }

  /**
   * Reset all fired milestones (e.g., for a new session)
   */
  reset(): void {
    this.firedMilestones.clear();
  }

  /**
   * Reset specific milestone type
   */
  resetMilestone(type: 'keystroke' | 'streak' | 'speed' | 'perfect'): void {
    const prefix = type === 'perfect' ? 'perfect_session' : type;
    for (const key of this.firedMilestones) {
      if (key.startsWith(prefix)) {
        this.firedMilestones.delete(key);
      }
    }
  }

  /**
   * Get all fired milestones (for persistence)
   */
  getFiredMilestones(): string[] {
    return Array.from(this.firedMilestones);
  }

  /**
   * Restore fired milestones from persistence
   */
  restoreFiredMilestones(milestones: string[]): void {
    this.firedMilestones = new Set(milestones);
  }
}

/**
 * Create a singleton instance for app-wide use
 */
let globalMilestoneManager: MilestoneManager | null = null;

export function getMilestoneManager(toastCallback?: ToastCallback): MilestoneManager {
  if (!globalMilestoneManager) {
    globalMilestoneManager = new MilestoneManager(toastCallback);
  } else if (toastCallback) {
    globalMilestoneManager.setToastCallback(toastCallback);
  }
  return globalMilestoneManager;
}

/**
 * Reset the global milestone manager (useful for testing)
 */
export function resetMilestoneManager(): void {
  globalMilestoneManager = null;
}

/**
 * Predefined achievement definitions for use with AchievementBadge component
 */
export const ACHIEVEMENTS = {
  // Speed achievements
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Type at 80+ WPM',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
  },
  
  // Accuracy achievements
  PERFECTIONIST: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete a lesson with 100% accuracy',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  },
  
  // Streak achievements
  WEEK_WARRIOR: {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Maintain a 7-day practice streak',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-2.072-2.143-1.072 2.143-.928 4.286-.928 4.286C6.5 12.5 6 14 6 15.5c0 2.5 2.5 4 5 4s5-1.5 5-4c0-1.5-.5-3-1.5-4.214 0 0 .144-2.143-.928-4.286 0 0-1 0-2.072 2.143-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5"/></svg>',
  },
  
  // Progress achievements
  FIRST_STEPS: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
  },
  
  MASTER_TYPIST: {
    id: 'master_typist',
    name: 'Master Typist',
    description: 'Complete all lessons in a course',
    icon: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  },
} as const;

export type AchievementKey = keyof typeof ACHIEVEMENTS;
