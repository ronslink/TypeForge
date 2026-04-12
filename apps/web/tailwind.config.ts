import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,js,svelte,ts}',
    '../../packages/ui/src/**/*.{html,js,svelte,ts}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "tertiary-container": "#ff9795",
        "on-primary": "#442c00",
        "on-surface": "#e1e2ea",
        "primary-fixed-dim": "#ffba44",
        "primary-container": "#f0a500",
        "on-secondary-container": "#004d3f",
        "on-primary-fixed": "#281800",
        "surface-container-low": "#191c21",
        "outline-variant": "#514533",
        "secondary-fixed-dim": "#38debb",
        "error-container": "#93000a",
        "on-tertiary-fixed-variant": "#92001b",
        "background": "#111319",
        "primary": "#ffc56c",
        "on-error-container": "#ffdad6",
        "on-error": "#690005",
        "on-primary-fixed-variant": "#614000",
        "inverse-primary": "#805600",
        "surface-dim": "#111319",
        "on-secondary-fixed-variant": "#005142",
        "surface-container-lowest": "#0b0e13",
        "error": "#ffb4ab",
        "secondary-fixed": "#5ffbd6",
        "outline": "#9f8e79",
        "tertiary": "#ffc0bd",
        "tertiary-fixed-dim": "#ffb3b0",
        "surface-container": "#1d2025",
        "on-secondary-fixed": "#002019",
        "secondary-container": "#00c7a5",
        "inverse-surface": "#e1e2ea",
        "on-primary-container": "#5f3f00",
        "surface-container-high": "#272a30",
        "on-surface-variant": "#d6c4ac",
        "on-tertiary-fixed": "#410007",
        "surface-tint": "#ffba44",
        "on-tertiary-container": "#91001b",
        "on-secondary": "#00382d",
        "on-background": "#e1e2ea",
        "surface-container-highest": "#32353b",
        "surface-variant": "#32353b",
        "inverse-on-surface": "#2e3036",
        "surface-bright": "#36393f",
        "tertiary-fixed": "#ffdad8",
        "on-tertiary": "#680010",
        "secondary": "#41e4c0",
        "primary-fixed": "#ffddaf",
        "surface": "#111319"
      },
      fontFamily: {
        "headline": ["Newsreader", "serif"],
        "body": ["Manrope", "sans-serif"],
        "label": ["Space Grotesk", "monospace"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
} satisfies Config;
