<script lang="ts">
  interface Props {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    variant?: 'primary' | 'secondary' | 'success' | 'warning';
    showLabel?: boolean;
  }

  let {
    progress,
    size = 120,
    strokeWidth = 8,
    variant = 'primary',
    showLabel = true,
  }: Props = $props();

  // Clamp progress to 0-100
  const normalizedProgress = $derived(Math.min(100, Math.max(0, progress)));

  // Calculate circle properties
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  const variantColors = {
    primary: '#F0A500', // amber
    secondary: '#00838F', // teal
    success: '#4CAF50',
    warning: '#FF9800',
  };

  const color = $derived(variantColors[variant]);
</script>

<div
  class="progress-ring relative inline-flex items-center justify-center"
  style="width: {size}px; height: {size}px;"
>
  <svg
    width={size}
    height={size}
    class="transform -rotate-90"
  >
    <!-- Background circle -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke="currentColor"
      stroke-width={strokeWidth}
      fill="none"
      class="text-surface-container-high"
    />
    <!-- Progress circle -->
    <circle
      cx={size / 2}
      cy={size / 2}
      r={radius}
      stroke={color}
      stroke-width={strokeWidth}
      fill="none"
      stroke-linecap="square"
      stroke-dasharray={circumference}
      stroke-dashoffset={offset}
      class="transition-all duration-500 ease-out"
    />
  </svg>

  {#if showLabel}
    <span class="absolute font-label text-2xl font-bold text-on-surface">
      {Math.round(normalizedProgress)}%
    </span>
  {/if}
</div>

<style>
  .progress-ring {
    filter: drop-shadow(0 0 10px rgba(240, 165, 0, 0.1));
  }
</style>
