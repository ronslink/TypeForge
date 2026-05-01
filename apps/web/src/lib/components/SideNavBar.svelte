<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    children: Snippet;
    title?: string;
  }

  let { children, title = 'Filters' }: Props = $props();

  let mobileMenuOpen = $state(false);
</script>

<!-- Mobile Toggle Button (Visible only on lg and below) -->
<div class="lg:hidden w-full bg-surface-container border-b border-surface-container-high px-6 py-3 flex items-center justify-between sticky top-0 z-30">
  <span class="font-headline text-sm uppercase tracking-widest text-on-surface-variant">{title}</span>
  <button
    class="flex items-center gap-2 text-primary focus:outline-none"
    onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
    aria-label={mobileMenuOpen ? `Close ${title}` : `Open ${title}`}
    aria-expanded={mobileMenuOpen}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>
</div>

<!-- Mobile Overlay -->
{#if mobileMenuOpen}
  <div
    class="lg:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
    role="presentation"
    onclick={() => (mobileMenuOpen = false)}
  ></div>
{/if}

<!-- Sidebar Container -->
<aside
  class="fixed lg:sticky top-0 lg:top-20 bottom-0 left-0 z-50 lg:z-0
         w-[280px] bg-surface-container-lowest border-r border-outline-variant/10
         flex flex-col h-full lg:h-[calc(100vh-80px)] overflow-y-auto
         transform transition-transform duration-300 ease-in-out
         {mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
>
  <!-- Mobile Close Header -->
  <div class="lg:hidden flex items-center justify-between p-6 border-b border-outline-variant/10">
    <span class="font-headline text-lg uppercase tracking-widest text-on-surface">{title}</span>
    <button
      class="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
      onclick={() => (mobileMenuOpen = false)}
      aria-label={`Close ${title}`}
    >
      <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
      </svg>
    </button>
  </div>

  <div class="p-6 flex flex-col gap-6">
    {@render children()}
  </div>
</aside>
