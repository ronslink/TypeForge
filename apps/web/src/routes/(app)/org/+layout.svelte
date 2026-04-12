<script lang="ts">
  import SideNavBar from '$lib/components/SideNavBar.svelte';
  import type { LayoutProps } from './$types';
  import { page } from '$app/state';

  let { children }: LayoutProps = $props();

  const navItems = [
    { href: '/org', label: 'Overview', icon: 'dashboard' },
    { href: '/org/roster', label: 'Class Roster', icon: 'groups' },
    { href: '/billing', label: 'Billing', icon: 'credit_card' }
  ];
</script>

<div class="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full relative">
  <SideNavBar title="Org Dashboard">
    <div class="flex flex-col gap-2 w-full">
      {#each navItems as item}
        <a 
          href={item.href}
          class="flex items-center gap-3 px-4 py-3 text-sm font-label transition-colors border-l-2
            {page.url.pathname === item.href 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}"
        >
          <span class="material-symbols-outlined text-lg">{item.icon}</span>
          {item.label}
        </a>
      {/each}
    </div>
  </SideNavBar>

  <div class="flex-1 w-full max-w-7xl mx-auto py-8">
    {@render children()}
  </div>
</div>
