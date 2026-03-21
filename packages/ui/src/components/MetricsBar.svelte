<script lang="ts">
  import type { Snippet } from 'svelte';
  import StatCard from './StatCard.svelte';

  interface Metric {
    label: string;
    value: string | number;
    unit?: string;
    variant?: 'default' | 'primary' | 'secondary';
  }

  interface Props {
    metrics: Metric[];
    children?: Snippet;
  }

  let { metrics, children }: Props = $props();
</script>

<div class="metrics-bar flex flex-wrap gap-4">
  {#each metrics as metric}
    <StatCard
      label={metric.label}
      value={metric.value}
      unit={metric.unit}
      variant={metric.variant}
    />
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
</style>
