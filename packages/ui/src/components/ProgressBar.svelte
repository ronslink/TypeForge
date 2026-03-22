<script lang="ts">
  interface Props {
    value: number;
    max?: number;
    variant?: 'default' | 'primary' | 'secondary';
    showLabel?: boolean;
  }

  let { value, max = 100, variant = 'default', showLabel = false }: Props = $props();

  let percentage = $derived(Math.min(100, Math.max(0, (value / max) * 100)));

  const variantClasses = {
    default: 'bg-on-surface-variant',
    primary: 'bg-primary-container',
    secondary: 'bg-secondary-container',
  };
</script>

<div class="progress-container">
  <div class="progress-track bg-surface-container-highest">
    <div
      class="progress-fill {variantClasses[variant]}"
      style="width: {percentage}%"
    ></div>
  </div>
  {#if showLabel}
    <span class="progress-label font-label text-xs text-on-surface-variant">
      {Math.round(percentage)}%
    </span>
  {/if}
</div>

<style>
  .progress-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .progress-track {
    flex: 1;
    height: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    transition: width 0.3s ease;
  }
</style>
