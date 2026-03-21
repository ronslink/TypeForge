<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost';
  type ButtonSize = 'sm' | 'md' | 'lg';

  interface Props extends HTMLButtonAttributes {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: Snippet;
  }

  let {
    variant = 'primary',
    size = 'md',
    children,
    class: className = '',
    ...restProps
  }: Props = $props();

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim hover:shadow-[0_0_15px_rgba(240,165,0,0.2)]',
    secondary:
      'bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed-dim',
    ghost: 'bg-transparent text-on-surface hover:bg-surface-container-high',
  };

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-10 py-4 text-lg',
  };
</script>

<button
  class="notched-button font-label font-bold tracking-wider transition-all active:scale-95 {variantClasses[variant]} {sizeClasses[size]} {className}"
  {...restProps}
>
  {@render children()}
</button>

<style>
  .notched-button {
    clip-path: polygon(
      0 0,
      calc(100% - 8px) 0,
      100% 8px,
      100% 100%,
      8px 100%,
      0 calc(100% - 8px)
    );
    border: none;
    cursor: pointer;
  }
</style>
