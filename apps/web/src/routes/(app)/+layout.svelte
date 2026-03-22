<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { clerk } from 'clerk-sveltekit/client';
  import { page } from '$app/stores';
  import { afterNavigate } from '$app/navigation';

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

  // Focus management - after navigation, focus moves to main content
  let mainContentRef = $state<HTMLElement | null>(null);
  
  afterNavigate(() => {
    // Move focus to main content area for screen readers
    if (mainContentRef) {
      mainContentRef.focus();
    }
  });

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

  // Handle skip to content link
  function handleSkipToContent(event: Event) {
    event.preventDefault();
    if (mainContentRef) {
      mainContentRef.focus();
      mainContentRef.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<!-- 
  Accessibility Notes:
  - Skip to content link at top for keyboard users
  - Focus management: after navigation, focus moves to <main>
  - All interactive elements have visible focus indicators (amber outline)
  - Navigation landmarks with proper aria-labels
  - Current page indicated with aria-current
-->

<div class="min-h-screen bg-background">
  <!-- Skip to Content Link - Visible on focus for keyboard users -->
  <a 
    href="#main-content" 
    class="skip-to-content"
    onclick={handleSkipToContent}
  >
    Skip to main content
  </a>

  <!-- Auth Banner - Sticky top banner for non-authenticated users -->
  {#if showAuthBanner}
    <div 
      class="fixed top-0 left-0 right-0 z-[60] bg-surface-container-high border-b border-outline-variant"
      role="banner"
    >
      <div class="flex justify-between items-center w-full px-8 py-3 max-w-screen-2xl mx-auto">
        <span class="text-sm text-on-surface-variant font-body">
          Sign in to save your progress
        </span>
        <button
          onclick={handleSignIn}
          class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors focus-indicator"
        >
          Sign In
        </button>
      </div>
    </div>
  {/if}

  <!-- Navigation -->
  <nav 
    class="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl" 
    class:mt-12={showAuthBanner}
    aria-label="Main navigation"
  >
    <div class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
      <div class="flex items-center gap-8">
        <a 
          href="/" 
          class="text-xl font-black tracking-tighter text-primary uppercase font-label focus-indicator"
          aria-label="TypeForge Home"
        >
          TYPEFORGE
        </a>
        <div class="hidden md:flex gap-6 items-center">
          {#each navItems as item}
            <a
              href={item.href}
              class="text-sm font-body transition-colors relative py-1 focus-indicator"
              class:text-primary={currentPath.startsWith(item.href)}
              class:text-on-surface/70={!currentPath.startsWith(item.href)}
              class:hover:text-white={!currentPath.startsWith(item.href)}
              aria-current={currentPath.startsWith(item.href) ? 'page' : undefined}
            >
              {item.label}
              {#if currentPath.startsWith(item.href)}
                <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" aria-hidden="true"></span>
              {/if}
            </a>
          {/each}
        </div>
      </div>
      <div class="flex items-center gap-4">
        <a
          href="/settings"
          class="text-sm font-body transition-colors relative py-1 focus-indicator"
          class:text-primary={currentPath.startsWith('/settings')}
          class:text-on-surface/70={!currentPath.startsWith('/settings')}
          class:hover:text-white={!currentPath.startsWith('/settings')}
          aria-current={currentPath.startsWith('/settings') ? 'page' : undefined}
        >
          Settings
          {#if currentPath.startsWith('/settings')}
            <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" aria-hidden="true"></span>
          {/if}
        </a>
        
        <!-- User menu -->
        {#if isSignedIn && user}
          <div class="flex items-center gap-3 ml-4 pl-4 border-l border-outline-variant">
            {#if user.imageUrl}
              <img
                src={user.imageUrl}
                alt=""
                class="w-8 h-8 rounded-none object-cover border border-outline-variant"
                role="presentation"
              />
            {:else}
              <div 
                class="w-8 h-8 bg-primary-container flex items-center justify-center text-on-primary-container font-label text-sm font-bold"
                aria-hidden="true"
              >
                {(user.firstName?.[0] || user.emailAddresses?.[0]?.emailAddress?.[0] || 'U').toUpperCase()}
              </div>
            {/if}
            <button
              onclick={handleSignOut}
              class="text-xs text-on-surface-variant hover:text-white transition-colors font-body focus-indicator"
            >
              Sign Out
            </button>
          </div>
        {:else}
          <button
            onclick={handleSignIn}
            class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors ml-4 focus-indicator"
          >
            Start Typing
          </button>
        {/if}
      </div>
    </div>
  </nav>

  <!-- Main Content Area -->
  <main 
    id="main-content"
    bind:this={mainContentRef}
    class="pt-20 outline-none" 
    class:mt-12={showAuthBanner}
    tabindex="-1"
    role="main"
    aria-label="Main content"
  >
    {@render children()}
  </main>
</div>

<style>
  .max-w-screen-2xl {
    max-width: 1536px;
  }

  /* Skip to content link - visible on focus */
  .skip-to-content {
    position: absolute;
    top: -100%;
    left: 50%;
    transform: translateX(-50%);
    z-index: 100;
    background: var(--primary, #ffc56c);
    color: var(--on-primary, #442c00);
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 0 0 4px 4px;
    transition: top 0.2s ease;
  }

  .skip-to-content:focus {
    top: 0;
    outline: 2px solid var(--on-primary, #442c00);
    outline-offset: 2px;
  }

  /* Focus indicator - amber outline for all interactive elements */
  .focus-indicator {
    outline: none;
    border-radius: 2px;
  }

  .focus-indicator:focus-visible {
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 2px;
  }

  /* Ensure main content can receive focus but doesn't show outline */
  main:focus {
    outline: none;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .skip-to-content {
      transition: none;
    }
    
    .transition-colors {
      transition: none;
    }
  }
</style>
