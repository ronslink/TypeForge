/**
 * @typeforge/assets — Static assets package
 * Sounds, keyboard images, and layout visualizations
 */

// Sounds
export * from './sounds/index.js';

// Keyboard SVGs and images
export * from './keyboards/index.js';

// General images
export * from './images/index.js';

// Asset paths for static files
export const assetPaths = {
  sounds: {
    keystroke: '/assets/sounds/keystroke',
    error: '/assets/sounds/error',
    success: '/assets/sounds/success',
    notification: '/assets/sounds/notification',
  },
  keyboards: {
    svg: '/assets/keyboards/svg',
    images: '/assets/keyboards/images',
  },
  images: {
    icons: '/assets/images/icons',
    illustrations: '/assets/images/illustrations',
    achievements: '/assets/images/achievements',
  },
} as const;
