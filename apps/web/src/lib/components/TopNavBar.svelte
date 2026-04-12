<script lang="ts">
  import { page } from '$app/state';

  import { afterNavigate } from '$app/navigation';
  import { useClerkContext, UserButton } from 'svelte-clerk';

  // Navigation items
  const navItems = [
    { href: '/learn',          label: 'Learn'    },
    { href: '/practice',       label: 'Practice' },
    { href: '/games/cascade',  label: 'Play'     },
    { href: '/progress',       label: 'Progress' },
  ];

  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  let user       = $derived(ctx?.user);

  let currentPath    = $derived(page.url.pathname);
  let mobileMenuOpen = $state(false);

  afterNavigate(() => { mobileMenuOpen = false; });
</script>

<nav
  class="fixed top-0 w-full z-50 glass-panel border-b border-outline-variant/10"
  aria-label="Main navigation"
>
  <div class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">

    <!-- Logo -->
    <div class="flex items-center gap-8">
      <a
        href="/"
        class="text-xl font-black tracking-tighter text-primary uppercase font-label focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="TypingScholar Home"
      >
        TYPINGSCHOLAR
      </a>

      <!-- Desktop nav links -->
      <div class="hidden md:flex gap-6 items-center">
        {#each navItems as item}
          <a
            href={item.href}
            class="text-sm font-body transition-colors relative py-1 outline-none {currentPath.startsWith(item.href)
              ? 'text-primary'
              : 'text-on-surface/70 hover:text-white'}"
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

    <!-- Right side -->
    <div class="flex items-center gap-4">
      <a
        href="/settings"
        class="hidden md:block text-sm font-body transition-colors relative py-1 outline-none {currentPath.startsWith('/settings')
          ? 'text-primary'
          : 'text-on-surface/70 hover:text-white'}"
        aria-current={currentPath.startsWith('/settings') ? 'page' : undefined}
      >
        Settings
        {#if currentPath.startsWith('/settings')}
          <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" aria-hidden="true"></span>
        {/if}
      </a>

      {#if isSignedIn && user}
        <div class="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-outline-variant">
          <UserButton afterSignOutUrl="/" />
        </div>
      {:else}
        <a
          href="/sign-up"
          class="hidden md:inline-block notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors ml-4 text-center"
        >
          Start Typing
        </a>
      {/if}

      <!-- Mobile hamburger -->
      <button
        class="md:hidden flex flex-col gap-1.5 p-2 rounded outline-none focus-visible:outline-2 focus-visible:outline-primary"
        onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-nav-drawer"
      >
        <span class="block w-6 h-0.5 bg-on-surface transition-all duration-200"
          style="transform: {mobileMenuOpen ? 'translateY(8px) rotate(45deg)' : 'none'}"></span>
        <span class="block w-6 h-0.5 bg-on-surface transition-opacity duration-200"
          style="opacity: {mobileMenuOpen ? 0 : 1}"></span>
        <span class="block w-6 h-0.5 bg-on-surface transition-all duration-200"
          style="transform: {mobileMenuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none'}"></span>
      </button>
    </div>
  </div>
</nav>

<!-- Mobile Drawer -->
{#if mobileMenuOpen}
  <div
    class="md:hidden fixed inset-0 z-40 bg-background/60 backdrop-blur-sm"
    role="presentation"
    onclick={() => (mobileMenuOpen = false)}
  ></div>
  <div
    id="mobile-nav-drawer"
    class="md:hidden fixed top-0 right-0 bottom-0 z-50 w-72 glass-panel border-l border-outline-variant/20 flex flex-col p-8 pt-20"
    role="dialog"
    aria-modal="true"
    aria-label="Mobile navigation"
  >
    <button
      class="absolute top-5 right-6 text-on-surface-variant hover:text-primary transition-colors p-1 rounded outline-none focus-visible:outline-2 focus-visible:outline-primary"
      onclick={() => (mobileMenuOpen = false)}
      aria-label="Close menu"
    >
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <line x1="4" y1="4" x2="16" y2="16" /><line x1="16" y1="4" x2="4" y2="16" />
      </svg>
    </button>
    <nav class="flex flex-col gap-2 flex-1" aria-label="Mobile nav">
      {#each [...navItems, { href: '/settings', label: 'Settings' }] as item}
        <a
          href={item.href}
          class="font-label text-lg py-3 px-4 transition-colors border-l-2 {currentPath.startsWith(item.href)
            ? 'text-primary bg-primary/10 border-l-primary'
            : 'text-on-surface/80 hover:text-primary hover:bg-surface-container border-l-transparent'}"
          aria-current={currentPath.startsWith(item.href) ? 'page' : undefined}
        >
          {item.label}
        </a>
      {/each}
    </nav>
    <div class="mt-auto pt-6 border-t border-outline-variant/20">
      {#if isSignedIn && user}
        <div class="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span class="font-label text-sm text-on-surface-variant">{user.firstName || user.username}</span>
        </div>
      {:else}
        <a href="/sign-up" class="notched-button bg-primary text-on-primary w-full py-3 font-label font-bold text-sm uppercase tracking-widest text-center block">
          Start Typing
        </a>
      {/if}
    </div>
  </div>
{/if}
