<script lang="ts">
  import type { Snippet } from 'svelte';

  type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'error';

  interface Props {
    variant?: BadgeVariant;
    children: Snippet;
  }

  let { variant = 'default', children }: Props = $props();

  const variantClasses: Record<BadgeVariant, string> = {
    default: 'bg-surface-container-high text-on-surface',
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-container text-on-secondary-container',
    success: 'bg-secondary/20 text-secondary',
    error: 'bg-error-container text-on-error-container',
  };
</script>

<span class="badge font-label text-xs uppercase tracking-wider {variantClasses[variant]}">
  {@render children()}
</span>

<style>
  .badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    font-weight: 600;
  }
</style>
