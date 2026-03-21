<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    label: string;
    value: string | number;
    unit?: string;
    variant?: 'default' | 'primary' | 'secondary';
    children?: Snippet;
  }

  let { label, value, unit, variant = 'default', children }: Props = $props();

  const variantClasses = {
    default: 'text-on-surface',
    primary: 'text-primary',
    secondary: 'text-secondary',
  };
</script>

<div class="stat-card bg-surface-container-low p-6">
  <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">
    {label}
  </span>
  <div class="flex items-baseline gap-2 mt-2">
    <span class="font-label text-4xl font-bold {variantClasses[variant]}">
      {value}
    </span>
    {#if unit}
      <span class="font-label text-sm text-on-surface-variant">
        {unit}
      </span>
    {/if}
  </div>
  {#if children}
    <div class="mt-4">
      {@render children()}
    </div>
  {/if}
</div>

<style>
  .stat-card {
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(
      circle,
      rgba(240, 165, 0, 0.05) 1px,
      transparent 1px
    );
    background-size: 24px 24px;
    pointer-events: none;
  }
</style>
