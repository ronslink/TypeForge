/**
 * @typeforge/ui — Shared Svelte component library
 * Kinetic Foundry Design System
 */

// Core Components
export { default as Button } from './components/Button.svelte';
export { default as StatCard } from './components/StatCard.svelte';
export { default as TypingInput } from './components/TypingInput.svelte';
export { default as Keyboard } from './components/Keyboard.svelte';
export { default as ProgressBar } from './components/ProgressBar.svelte';
export { default as Badge } from './components/Badge.svelte';

// Metrics & Progress Components
export { default as MetricsBar } from './components/MetricsBar.svelte';
export { default as ProgressRing } from './components/ProgressRing.svelte';

// Lesson Components
export { default as LessonCard } from './components/LessonCard.svelte';

// Feedback Components
export { default as EncouragementToast } from './components/EncouragementToast.svelte';
export { default as ConfettiCelebration } from './components/ConfettiCelebration.svelte';

// Organization Components
export { default as OrgDashboard } from './components/OrgDashboard.svelte';

// Theme Components
export { default as ThemeProvider } from './components/ThemeProvider.svelte';

// Analysis Components
export { default as WeaknessHeatmap } from './components/WeaknessHeatmap.svelte';

// Utilities
export * from './utils/design-tokens.js';
