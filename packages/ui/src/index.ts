/**
 * @typeforge/ui — Shared Svelte component library
 * Kinetic Foundry Design System
 */

// Core Components
export { default as Button } from './components/Button.svelte';
export { default as StatCard } from './components/StatCard.svelte';
export { default as TypingInput } from './components/TypingInput.svelte';
export { default as Keyboard } from './components/Keyboard.svelte';
export { default as HandGuide } from './components/HandGuide.svelte';
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

// Celebration Components
export { default as MilestoneToast } from './components/MilestoneToast.svelte';
export { default as Celebration } from './components/Celebration.svelte';
export { default as LevelUp } from './components/LevelUp.svelte';
export { default as AchievementBadge } from './components/AchievementBadge.svelte';

// Organization Components
export { default as OrgDashboard } from './components/OrgDashboard.svelte';

// Teacher Dashboard Components
export { default as ClassOverview } from './components/ClassOverview.svelte';
export { default as StudentRow } from './components/StudentRow.svelte';
export { default as StudentProgressReport } from './components/StudentProgressReport.svelte';
export { default as ClassRoster } from './components/ClassRoster.svelte';
export { default as OrgStatsPanel } from './components/OrgStatsPanel.svelte';
export { default as InviteStudentModal } from './components/InviteStudentModal.svelte';

// Theme Components
export { default as ThemeProvider } from './components/ThemeProvider.svelte';

// Analysis Components
export { default as WeaknessHeatmap } from './components/WeaknessHeatmap.svelte';

// Utilities
export * from './utils/design-tokens.js';
export * from './utils/celebrations.js';
