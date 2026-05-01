<script lang="ts">
  import SideNavBar from '$lib/components/SideNavBar.svelte';
  import type { LayoutProps } from './$types';
  import { page } from '$app/state';
  import { t } from '$lib/stores/locale';

  let { children }: LayoutProps = $props();

  const navItems = $derived([
    { href: '/org', label: $t('org_overview'), icon: 'dashboard' },
    { href: '/org/roster', label: $t('org_roster_title'), icon: 'users' },
    { href: '/billing', label: $t('billing_title'), icon: 'card' }
  ]);
</script>

<div class="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full relative">
  <SideNavBar title={$t('org_dashboard_title')}>
    <div class="flex flex-col gap-2 w-full">
      {#each navItems as item}
        <a 
          href={item.href}
          class="org-nav-item flex items-center gap-3 px-4 py-3 text-sm font-label transition-colors border-l-2
            {page.url.pathname === item.href 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-transparent text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}"
          aria-current={page.url.pathname === item.href ? 'page' : undefined}
        >
          <span class="org-nav-icon" aria-hidden="true">
            {#if item.icon === 'dashboard'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
            {:else if item.icon === 'users'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            {/if}
          </span>
          <span class="truncate">{item.label}</span>
        </a>
      {/each}
    </div>
  </SideNavBar>

  <div class="flex-1 w-full max-w-7xl mx-auto py-8">
    {@render children()}
  </div>
</div>

<style>
  .org-nav-item {
    min-height: 44px;
  }

  .org-nav-icon {
    width: 1.125rem;
    height: 1.125rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .org-nav-icon svg {
    width: 100%;
    height: 100%;
  }
</style>
