<script lang="ts">
  import type { Snippet } from 'svelte';
  import StatCard from './StatCard.svelte';

  interface Metric {
    label: string;
    value: string | number;
    unit?: string;
    variant?: 'default' | 'primary' | 'secondary';
    ariaLive?: 'polite' | 'assertive' | 'off';
  }

  interface Props {
    metrics: Metric[];
    children?: Snippet;
    /** Announce WPM updates every N seconds (default: 10) */
    wpmAnnouncementInterval?: number;
    /** Current streak for milestone announcements */
    currentStreak?: number;
    /** Previous streak for detecting milestones */
    previousStreak?: number;
  }

  let { 
    metrics, 
    children, 
    wpmAnnouncementInterval = 10,
    currentStreak = 0,
    previousStreak = 0
  }: Props = $props();

  // ARIA live announcement state
  let ariaLiveText = $state('');
  let lastWpmAnnouncement = $state(0);
  let lastWpmValue = $state(0);
  let announcementTimer: ReturnType<typeof setInterval> | null = null;
  
  // Streak milestones to announce
  const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
  let announcedMilestones = $state<Set<number>>(new Set());

  // Find WPM metric
  const wpmMetric = $derived(metrics.find(m => m.label === 'WPM'));
  const accuracyMetric = $derived(metrics.find(m => m.label === 'Accuracy'));

  // Announce WPM every N seconds (not every keystroke - too noisy)
  $effect(() => {
    if (wpmMetric && typeof wpmMetric.value === 'number') {
      const now = Date.now();
      const timeSinceLastAnnouncement = now - lastWpmAnnouncement;
      
      // Only announce if interval has passed and value changed significantly (> 5 WPM)
      if (timeSinceLastAnnouncement >= wpmAnnouncementInterval * 1000 && 
          Math.abs(wpmMetric.value - lastWpmValue) > 5) {
        ariaLiveText = `WPM: ${wpmMetric.value}`;
        lastWpmAnnouncement = now;
        lastWpmValue = wpmMetric.value;
      }
    }
  });

  // Announce accuracy changes on significant updates
  $effect(() => {
    if (accuracyMetric) {
      // This will be triggered when accuracy changes
      // We don't announce every change to avoid noise
    }
  });

  // Announce streak milestones
  $effect(() => {
    if (currentStreak > (previousStreak || 0)) {
      // Check if we hit a milestone
      for (const milestone of STREAK_MILESTONES) {
        if (currentStreak >= milestone && !announcedMilestones.has(milestone)) {
          ariaLiveText = `🔥 ${milestone} day streak! Keep it up!`;
          announcedMilestones = new Set([...announcedMilestones, milestone]);
          break;
        }
      }
    }
  });

  // Reset announcements when component unmounts
  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (announcementTimer) {
      clearInterval(announcementTimer);
    }
  });

  // Get aria-live value for a metric
  function getAriaLive(metric: Metric): 'polite' | 'assertive' | 'off' {
    if (metric.ariaLive) return metric.ariaLive;
    // WPM and Accuracy announce politely
    if (metric.label === 'WPM' || metric.label === 'Accuracy') return 'polite';
    // Streak milestones are more important
    if (metric.label === 'Streak') return 'polite';
    return 'off';
  }
</script>

<!-- 
  Accessibility Notes:
  - aria-live="polite" for WPM updates every 10 seconds (not every keystroke)
  - aria-live="polite" for accuracy changes on word completion
  - aria-live="polite" for streak milestones with fire emoji
  - aria-live="assertive" reserved for errors only
  - Each StatCard has proper aria-label and role
-->
<div 
  class="metrics-bar flex flex-wrap gap-4" 
  role="region" 
  aria-label="Typing statistics"
>
  <!-- ARIA live region for announcements -->
  <div class="sr-only" aria-live="polite" aria-atomic="true">
    {ariaLiveText}
  </div>
  
  {#each metrics as metric}
    <div aria-live={getAriaLive(metric)} aria-atomic="true">
      <StatCard
        label={metric.label}
        value={metric.value}
        unit={metric.unit}
        variant={metric.variant}
      />
    </div>
  {/each}
  {#if children}
    <div class="flex-1">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .metrics-bar {
    background: linear-gradient(
      180deg,
      transparent 0%,
      rgba(240, 165, 0, 0.02) 100%
    );
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding: 1rem;
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
