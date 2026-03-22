<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { clerk } from 'clerk-sveltekit/client';
  import { page } from '$app/stores';

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();

  // Auth state from Clerk
  let auth = $derived($clerk);
  let isSignedIn = $derived(!!auth?.user);
  let user = $derived(auth?.user);

  // Current page path for active nav highlighting
  let currentPath = $derived($page.url.pathname);

  // Pages that should show the auth banner when not logged in
  const authBannerPages = ['/learn', '/progress', '/practice'];
  let showAuthBanner = $derived(!isSignedIn && authBannerPages.some(p => currentPath.startsWith(p)));

  // Navigation items
  const navItems = [
    { href: '/learn', label: 'Learn' },
    { href: '/practice', label: 'Practice' },
    { href: '/progress', label: 'Progress' },
  ];

  function handleSignIn() {
    clerk.openSignIn({
      redirectUrl: currentPath,
    });
  }

  function handleSignOut() {
    clerk.signOut({
      redirectUrl: '/',
    });
  }
</script>

<div class="min-h-screen bg-background">
  <!-- Auth Banner - Sticky top banner for non-authenticated users -->
  {#if showAuthBanner}
    <div class="fixed top-0 left-0 right-0 z-[60] bg-surface-container-high border-b border-outline-variant">
      <div class="flex justify-between items-center w-full px-8 py-3 max-w-screen-2xl mx-auto">
        <span class="text-sm text-on-surface-variant font-body">
          Sign in to save your progress
        </span>
        <button
          onclick={handleSignIn}
          class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors"
        >
          Sign In
        </button>
      </div>
    </div>
  {/if}

  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl" class:mt-12={showAuthBanner}>
    <div class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
      <div class="flex items-center gap-8">
        <a href="/" class="text-xl font-black tracking-tighter text-primary uppercase font-label">
          TYPEFORGE
        </a>
        <div class="hidden md:flex gap-6 items-center">
          {#each navItems as item}
            <a
              href={item.href}
              class="text-sm font-body transition-colors relative py-1"
              class:text-primary={currentPath.startsWith(item.href)}
              class:text-on-surface/70={!currentPath.startsWith(item.href)}
              class:hover:text-white={!currentPath.startsWith(item.href)}
            >
              {item.label}
              {#if currentPath.startsWith(item.href)}
                <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
      <div class="flex items-center gap-4">
        <a
          href="/settings"
          class="text-sm font-body transition-colors relative py-1"
          class:text-primary={currentPath.startsWith('/settings')}
          class:text-on-surface/70={!currentPath.startsWith('/settings')}
          class:hover:text-white={!currentPath.startsWith('/settings')}
        >
          Settings
          {#if currentPath.startsWith('/settings')}
            <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></span>
          {/if}
        </a>
        
        <!-- User menu -->
        {#if isSignedIn && user}
          <div class="flex items-center gap-3 ml-4 pl-4 border-l border-outline-variant">
            {#if user.imageUrl}
              <img
                src={user.imageUrl}
                alt={user.firstName || 'User'}
                class="w-8 h-8 rounded-none object-cover border border-outline-variant"
              />
            {:else}
              <div class="w-8 h-8 bg-primary-container flex items-center justify-center text-on-primary-container font-label text-sm font-bold">
                {(user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
              </div>
            {/if}
            <button
              onclick={handleSignOut}
              class="text-xs text-on-surface-variant hover:text-white transition-colors font-body"
            >
              Sign Out
            </button>
          </div>
        {:else}
          <button
            onclick={handleSignIn}
            class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors ml-4"
          >
            Start Typing
          </button>
        {/if}
      </div>
    </div>
  </nav>

  <main class="pt-20" class:mt-12={showAuthBanner}>
    {@render children()}
  </main>
</div>

<style>
  .max-w-screen-2xl {
    max-width: 1536px;
  }
</style>
