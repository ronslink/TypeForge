/**
 * Image assets and icons
 * Achievement badges, illustrations, and UI icons
 */

// Achievement badge images
export const achievementBadges = {
  speedDemon: '/assets/images/achievements/speed-demon.svg',
  accuracyKing: '/assets/images/achievements/accuracy-king.svg',
  streakMaster: '/assets/images/achievements/streak-master.svg',
  polyglot: '/assets/images/achievements/polyglot.svg',
  nightOwl: '/assets/images/achievements/night-owl.svg',
  earlyBird: '/assets/images/achievements/early-bird.svg',
  perfectionist: '/assets/images/achievements/perfectionist.svg',
  marathoner: '/assets/images/achievements/marathoner.svg',
} as const;

// UI Icons (using Material Symbols or custom SVGs)
export const icons = {
  // Navigation
  home: '/assets/images/icons/home.svg',
  learn: '/assets/images/icons/learn.svg',
  profile: '/assets/images/icons/profile.svg',
  settings: '/assets/images/icons/settings.svg',
  leaderboard: '/assets/images/icons/leaderboard.svg',

  // Actions
  play: '/assets/images/icons/play.svg',
  pause: '/assets/images/icons/pause.svg',
  restart: '/assets/images/icons/restart.svg',
  skip: '/assets/images/icons/skip.svg',

  // Status
  check: '/assets/images/icons/check.svg',
  error: '/assets/images/icons/error.svg',
  warning: '/assets/images/icons/warning.svg',
  info: '/assets/images/icons/info.svg',

  // Social
  share: '/assets/images/icons/share.svg',
  follow: '/assets/images/icons/follow.svg',
  trophy: '/assets/images/icons/trophy.svg',

  // Typing specific
  keyboard: '/assets/images/icons/keyboard.svg',
  finger: '/assets/images/icons/finger.svg',
  wpm: '/assets/images/icons/wpm.svg',
  accuracy: '/assets/images/icons/accuracy.svg',
  streak: '/assets/images/icons/streak.svg',
} as const;

// Illustrations
export const illustrations = {
  hero: '/assets/images/illustrations/hero.svg',
  emptyState: '/assets/images/illustrations/empty-state.svg',
  errorState: '/assets/images/illustrations/error-state.svg',
  onboarding1: '/assets/images/illustrations/onboarding-1.svg',
  onboarding2: '/assets/images/illustrations/onboarding-2.svg',
  onboarding3: '/assets/images/illustrations/onboarding-3.svg',
} as const;

// Language flags
export const languageFlags: Record<string, string> = {
  en: '/assets/images/flags/en.svg',
  de: '/assets/images/flags/de.svg',
  fr: '/assets/images/flags/fr.svg',
  es: '/assets/images/flags/es.svg',
  it: '/assets/images/flags/it.svg',
  pt: '/assets/images/flags/pt.svg',
  ru: '/assets/images/flags/ru.svg',
  zh: '/assets/images/flags/zh.svg',
  ja: '/assets/images/flags/ja.svg',
  ko: '/assets/images/flags/ko.svg',
  ar: '/assets/images/flags/ar.svg',
  he: '/assets/images/flags/he.svg',
} as const;

/**
 * Get achievement badge URL by slug
 */
export function getAchievementBadge(slug: string): string | undefined {
  return Object.entries(achievementBadges).find(([key]) => key === slug)?.[1];
}

/**
 * Get icon URL by name
 */
export function getIcon(name: keyof typeof icons): string {
  return icons[name];
}

/**
 * Get language flag URL
 */
export function getLanguageFlag(code: string): string | undefined {
  return languageFlags[code];
}
