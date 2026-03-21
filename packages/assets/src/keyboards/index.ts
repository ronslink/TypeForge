/**
 * Keyboard SVG assets and rendering utilities
 * Dynamic keyboard visualizations for different layouts
 */

import type { KeyboardLayout } from '@typeforge/layouts';

export type KeyboardView = 'full' | 'hands' | 'fingers' | 'heatmap';
export type KeyboardTheme = 'dark' | 'light' | 'high-contrast';

export interface KeyboardSVGConfig {
  view: KeyboardView;
  theme: KeyboardTheme;
  highlightKeys?: Set<string>;
  pressedKey?: string;
  showFingers?: boolean;
  showHeatmap?: boolean;
}

// SVG file paths for each layout
export const keyboardSVGs: Record<string, string> = {
  'qwerty-us': '/assets/keyboards/svg/qwerty-us.svg',
  'azerty-fr': '/assets/keyboards/svg/azerty-fr.svg',
  'qwertz-de': '/assets/keyboards/svg/qwertz-de.svg',
  'dvorak-us': '/assets/keyboards/svg/dvorak-us.svg',
  'colemak': '/assets/keyboards/svg/colemak.svg',
};

// Hand position images
export const handPositionImages = {
  left: '/assets/keyboards/images/hand-left.svg',
  right: '/assets/keyboards/images/hand-right.svg',
  both: '/assets/keyboards/images/hands-both.svg',
};

// Finger color mapping for visualization
export const fingerColors: Record<string, { normal: string; highlight: string }> = {
  'left-pinky': { normal: '#ff6b6b', highlight: '#ff8787' },
  'left-ring': { normal: '#ffa94d', highlight: '#ffc078' },
  'left-middle': { normal: '#ffd43b', highlight: '#ffe066' },
  'left-index': { normal: '#69db7c', highlight: '#8ce99a' },
  'right-index': { normal: '#4dabf7', highlight: '#74c0fc' },
  'right-middle': { normal: '#748ffc', highlight: '#91a7ff' },
  'right-ring': { normal: '#da77f2', highlight: '#e599f7' },
  'right-pinky': { normal: '#f783ac', highlight: '#faa2c1' },
  'thumb': { normal: '#868e96', highlight: '#adb5bd' },
};

/**
 * Generate SVG for a keyboard layout
 */
export function generateKeyboardSVG(
  layout: KeyboardLayout,
  config: KeyboardSVGConfig
): string {
  const { view, theme, highlightKeys = new Set(), pressedKey, showFingers = true } = config;

  const themeColors = getThemeColors(theme);
  const keyWidth = 50;
  const keyHeight = 50;
  const keySpacing = 4;
  const rowOffsets = [0, 10, 20, 15, 0]; // Stagger for each row

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 280" class="keyboard-svg">`;
  svg += `<style>${getKeyboardStyles(themeColors)}</style>`;

  // Group keys by row
  const rows = groupKeysByRow(layout.keys);

  rows.forEach((rowKeys, rowIndex) => {
    const yOffset = rowIndex * (keyHeight + keySpacing) + 20;
    let xOffset = rowOffsets[rowIndex] + 20;

    rowKeys.forEach((key) => {
      const isHighlighted = highlightKeys.has(key.char);
      const isPressed = pressedKey === key.char;
      const keyClass = getKeyClasses(key, isHighlighted, isPressed, showFingers);

      svg += `<g class="key ${keyClass}" data-code="${key.code}" data-char="${key.char}">`;
      svg += `<rect x="${xOffset}" y="${yOffset}" width="${keyWidth}" height="${keyHeight}" rx="2"/>`;

      // Main character
      svg += `<text x="${xOffset + keyWidth / 2}" y="${yOffset + keyHeight / 2 + 5}" 
               class="key-char" text-anchor="middle">${key.char}</text>`;

      // Shift character (if different)
      if (key.shift && key.shift !== key.char) {
        svg += `<text x="${xOffset + keyWidth / 2}" y="${yOffset + 12}" 
                 class="key-shift" text-anchor="middle">${key.shift}</text>`;
      }

      svg += `</g>`;

      xOffset += keyWidth + keySpacing;
    });
  });

  svg += `</svg>`;
  return svg;
}

/**
 * Get theme-specific colors
 */
function getThemeColors(theme: KeyboardTheme) {
  switch (theme) {
    case 'light':
      return {
        background: '#ffffff',
        key: '#f8f9fa',
        keyBorder: '#dee2e6',
        keyText: '#212529',
        highlight: '#ffc56c',
        pressed: '#f0a500',
      };
    case 'high-contrast':
      return {
        background: '#000000',
        key: '#1a1a1a',
        keyBorder: '#ffffff',
        keyText: '#ffffff',
        highlight: '#ffff00',
        pressed: '#00ff00',
      };
    case 'dark':
    default:
      return {
        background: '#111319',
        key: '#1d2025',
        keyBorder: '#32353b',
        keyText: '#e1e2ea',
        highlight: '#ffc56c',
        pressed: '#f0a500',
      };
  }
}

/**
 * Get CSS styles for keyboard SVG
 */
function getKeyboardStyles(colors: ReturnType<typeof getThemeColors>): string {
  return `
    .key rect {
      fill: ${colors.key};
      stroke: ${colors.keyBorder};
      stroke-width: 1;
      transition: fill 0.1s ease;
    }
    .key-char {
      fill: ${colors.keyText};
      font-family: 'Space Grotesk', monospace;
      font-size: 14px;
    }
    .key-shift {
      fill: ${colors.keyText};
      opacity: 0.6;
      font-family: 'Space Grotesk', monospace;
      font-size: 10px;
    }
    .key.highlighted rect {
      fill: ${colors.highlight};
      filter: drop-shadow(0 0 8px ${colors.highlight});
    }
    .key.pressed rect {
      fill: ${colors.pressed};
      transform: scale(0.95);
    }
  `;
}

/**
 * Get CSS classes for a key
 */
function getKeyClasses(
  key: { finger: string },
  isHighlighted: boolean,
  isPressed: boolean,
  showFingers: boolean
): string {
  const classes: string[] = [];

  if (isHighlighted) classes.push('highlighted');
  if (isPressed) classes.push('pressed');
  if (showFingers) classes.push(`finger-${key.finger}`);

  return classes.join(' ');
}

/**
 * Group keys by row
 */
function groupKeysByRow(keys: KeyboardLayout['keys']): Map<number, typeof keys> {
  const rows = new Map<number, typeof keys>();

  for (const key of keys) {
    const row = rows.get(key.row) || [];
    row.push(key);
    rows.set(key.row, row);
  }

  // Sort each row by column
  for (const [_, rowKeys] of rows) {
    rowKeys.sort((a, b) => a.column - b.column);
  }

  return rows;
}

/**
 * Generate heatmap overlay for keyboard
 */
export function generateHeatmapOverlay(
  layout: KeyboardLayout,
  keyStats: Map<string, { correct: number; total: number }>
): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 280" class="heatmap-overlay">`;

  for (const key of layout.keys) {
    const stats = keyStats.get(key.char);
    if (!stats) continue;

    const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
    const color = getHeatmapColor(accuracy);

    // Add heatmap indicator
    svg += `<circle cx="${key.column * 54 + 45}" cy="${key.row * 54 + 45}" 
             r="20" fill="${color}" opacity="0.6"/>`;
  }

  svg += `</svg>`;
  return svg;
}

/**
 * Get heatmap color based on accuracy
 */
function getHeatmapColor(accuracy: number): string {
  if (accuracy >= 0.95) return '#41e4c0'; // Teal - excellent
  if (accuracy >= 0.85) return '#ffc56c'; // Amber - good
  if (accuracy >= 0.70) return '#ffa94d'; // Orange - needs work
  return '#ff6b6b'; // Red - needs attention
}
