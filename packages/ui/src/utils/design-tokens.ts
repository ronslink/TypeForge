/**
 * Design Tokens — Kinetic Foundry Theme
 * CSS custom properties and design system values
 */

export const colors = {
  // Primary — Amber (The Heat)
  primary: '#ffc56c',
  primaryContainer: '#f0a500',
  primaryFixed: '#ffddaf',
  primaryFixedDim: '#ffba44',
  onPrimary: '#442c00',
  onPrimaryContainer: '#5f3f00',
  onPrimaryFixed: '#281800',
  onPrimaryFixedVariant: '#614000',
  inversePrimary: '#805600',

  // Secondary — Teal (Precision)
  secondary: '#41e4c0',
  secondaryContainer: '#00c7a5',
  secondaryFixed: '#5ffbd6',
  secondaryFixedDim: '#38debb',
  onSecondary: '#00382d',
  onSecondaryContainer: '#004d3f',
  onSecondaryFixed: '#002019',
  onSecondaryFixedVariant: '#005142',

  // Tertiary — Soft Red (Errors)
  tertiary: '#ffc0bd',
  tertiaryContainer: '#ff9795',
  tertiaryFixed: '#ffdad8',
  tertiaryFixedDim: '#ffb3b0',
  onTertiary: '#680010',
  onTertiaryContainer: '#91001b',
  onTertiaryFixed: '#410007',
  onTertiaryFixedVariant: '#92001b',

  // Error
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  // Surface Architecture
  background: '#111319',
  onBackground: '#e1e2ea',
  surface: '#111319',
  onSurface: '#e1e2ea',
  surfaceDim: '#111319',
  surfaceBright: '#36393f',
  surfaceTint: '#ffba44',
  surfaceVariant: '#32353b',
  onSurfaceVariant: '#d6c4ac',
  surfaceContainerLowest: '#0b0e13',
  surfaceContainerLow: '#191c21',
  surfaceContainer: '#1d2025',
  surfaceContainerHigh: '#272a30',
  surfaceContainerHighest: '#32353b',
  inverseSurface: '#e1e2ea',
  inverseOnSurface: '#2e3036',

  // Outline
  outline: '#9f8e79',
  outlineVariant: '#514533',
} as const;

export const typography = {
  display: {
    fontFamily: '"Newsreader", serif',
    sizes: {
      lg: '4.5rem',
      md: '3.5rem',
      sm: '2.5rem',
    },
  },
  headline: {
    fontFamily: '"Newsreader", serif',
    sizes: {
      lg: '2rem',
      md: '1.5rem',
      sm: '1.25rem',
    },
  },
  body: {
    fontFamily: '"Manrope", sans-serif',
    sizes: {
      lg: '1.125rem',
      md: '1rem',
      sm: '0.875rem',
    },
  },
  label: {
    fontFamily: '"Space Grotesk", monospace',
    sizes: {
      lg: '1rem',
      md: '0.875rem',
      sm: '0.75rem',
    },
  },
} as const;

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export const radius = {
  none: '0',
  sm: '0.125rem',
  md: '0.25rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px',
} as const;

export const shadows = {
  none: 'none',
  sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
  md: '0 4px 6px rgba(0, 0, 0, 0.4)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  xl: '0 20px 40px rgba(0, 0, 0, 0.5)',
  glow: '0 0 15px rgba(240, 165, 0, 0.2)',
} as const;

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
} as const;
