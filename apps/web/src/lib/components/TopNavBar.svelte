<script lang="ts">
  import { page } from '$app/state';
  import { afterNavigate } from '$app/navigation';
  import { useClerkContext, UserButton } from 'svelte-clerk';
  import { UI_LOCALES, getPersistedLocale, setUiLocale, saveLocaleToApi, t, type UiLocale } from '$lib/stores/locale';

  // Navigation items using reactive translation keys
  let hasOrg = $state(false);

  const navItems = $derived([
    { href: '/learn',          label: $t('nav_learn')    },
    { href: '/practice',       label: $t('nav_practice') },
    { href: '/games/cascade',  label: $t('nav_play')     },
    ...(!hasOrg ? [{ href: '/progress', label: $t('nav_progress') }] : []),
    ...(hasOrg ? [{ href: '/org', label: $t('nav_dashboard') }] : []),
  ]);

  const ctx = useClerkContext();
  let loaded     = $derived(ctx?.isLoaded);
  let isSignedIn = $derived(!!ctx?.user);
  let user       = $derived(ctx?.user);

  let currentPath    = $derived(page.url.pathname);
  let mobileMenuOpen = $state(false);

  // UI locale state
  let activeLocale = $state<UiLocale>('en');
  let localeSwitcherOpen = $state(false);

  $effect(() => {
    activeLocale = getPersistedLocale();
  });

  // Check if user belongs to an org (fire-and-forget)
  $effect(() => {
    if (!isSignedIn) { hasOrg = false; return; }
    (async () => {
      try {
        const token = await ctx?.session?.getToken();
        const res = await fetch('/api/v1/organisations', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          hasOrg = data.organisations?.length > 0;
        }
      } catch { /* ignore */ }
    })();
  });

  async function handleLocaleSelect(code: UiLocale) {
    localeSwitcherOpen = false;
    activeLocale = code;
    await setUiLocale(code);
    const token = await ctx?.session?.getToken();
    saveLocaleToApi(code, token ?? null);
  }

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
        class="text-xl font-black tracking-tighter text-primary font-label focus-visible:outline-2 focus-visible:outline-primary"
        aria-label="TypingScholar Home"
      >
        TypingScholar
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
        {$t('nav_settings')}
        {#if currentPath.startsWith('/settings')}
          <span class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" aria-hidden="true"></span>
        {/if}
      </a>

      <!-- UI Language Switcher (desktop) -->
      <div class="hidden md:block relative" style="z-index: 200;">
        <button
          class="ui-locale-btn"
          onclick={() => localeSwitcherOpen = !localeSwitcherOpen}
          aria-label="Change UI language"
          aria-haspopup="listbox"
          aria-expanded={localeSwitcherOpen}
          title="UI Language"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          <span>{UI_LOCALES.find(l => l.code === activeLocale)?.nativeName ?? 'EN'}</span>
          <svg class="chevron" class:open={localeSwitcherOpen} xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        {#if localeSwitcherOpen}
          <div class="locale-dropdown" role="listbox" aria-label="Select UI language">
            {#each UI_LOCALES as loc}
              <button
                class="locale-option"
                class:locale-active={loc.code === activeLocale}
                role="option"
                aria-selected={loc.code === activeLocale}
                onclick={() => handleLocaleSelect(loc.code)}
              >
                <span class="locale-native">{loc.nativeName}</span>
                <span class="locale-en">{loc.englishName}</span>
                {#if loc.code === activeLocale}
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {/if}
              </button>
            {/each}
          </div>
        {/if}
      </div>

      {#if !loaded}
        <!-- Loading stub to reserve space -->
        <div class="hidden md:block w-24 h-8 bg-surface-container/50 rounded animate-pulse ml-4"></div>
      {:else if isSignedIn && user}
        <div class="hidden md:flex items-center gap-3 ml-4 pl-4 border-l border-outline-variant">
          <UserButton />
        </div>
      {:else}
        <div class="hidden md:flex items-center gap-4 ml-4">
          <a
            href="/onboarding/school"
            class="text-sm font-body text-on-surface/70 hover:text-white transition-colors"
          >
            {$t('nav_for_teachers')}
          </a>
          <a
            href="/sign-in"
            class="text-sm font-body text-on-surface/70 hover:text-white transition-colors"
          >
            {$t('nav_sign_in')}
          </a>
          <a
            href="/sign-up"
            class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors text-center"
          >
            {$t('lesson_start_cta')}
          </a>
        </div>
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
      {#each [...navItems, { href: '/settings', label: $t('nav_settings') }] as item}
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
      {#if !loaded}
         <!-- Load spacing -->
         <div class="w-full py-6 bg-transparent"></div>
      {:else if isSignedIn && user}
        <div class="flex items-center gap-3">
          <UserButton />
          <span class="font-label text-sm text-on-surface-variant">{user.firstName || user.username}</span>
        </div>
      {:else}
        <div class="flex flex-col gap-3">
          <a href="/sign-in" class="border border-outline-variant/30 text-on-surface w-full py-3 font-label font-bold text-sm uppercase tracking-widest text-center block hover:bg-surface-container-high transition-colors">
            {$t('nav_sign_in')}
          </a>
          <a href="/onboarding/school" class="border border-outline-variant/30 text-on-surface w-full py-3 font-label font-bold text-sm uppercase tracking-widest text-center block hover:bg-surface-container-high transition-colors">
            {$t('nav_institution_login')}
          </a>
          <a href="/sign-up" class="notched-button bg-primary text-on-primary w-full py-3 font-label font-bold text-sm uppercase tracking-widest text-center block">
            {$t('lesson_start_cta')}
          </a>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* ─── UI Locale Switcher ─── */
  .ui-locale-btn {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.6rem;
    background: var(--surface-container, #1d2025);
    border: 1px solid var(--outline-variant, #514533);
    color: var(--on-surface, #e1e2ea);
    font-family: var(--font-label, 'Space Grotesk', monospace);
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.15s, border-color 0.15s;
    white-space: nowrap;
  }
  .ui-locale-btn:hover {
    background: var(--surface-container-high, #272a30);
    border-color: var(--primary, #ffc56c);
    color: var(--primary, #ffc56c);
  }
  .ui-locale-btn .chevron { transition: transform 0.2s ease; }
  .ui-locale-btn .chevron.open { transform: rotate(180deg); }

  .locale-dropdown {
    position: absolute;
    top: calc(100% + 6px);
    right: 0;
    min-width: 180px;
    background: var(--surface-container-low, #191c21);
    border: 1px solid var(--outline-variant, #514533);
    border-radius: 6px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,197,108,0.08);
    animation: locale-in 0.18s cubic-bezier(0.22,1,0.36,1) both;
    overflow: hidden;
  }
  @keyframes locale-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .locale-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.55rem 0.9rem;
    background: transparent;
    border: none;
    color: var(--on-surface, #e1e2ea);
    font-family: var(--font-body, 'Manrope', sans-serif);
    font-size: 0.825rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.12s;
  }
  .locale-option:hover { background: var(--surface-container-high, #272a30); }
  .locale-option.locale-active { background: rgba(255,197,108,0.08); }
  .locale-active .locale-native { color: var(--primary, #ffc56c); font-weight: 700; }

  .locale-native { font-weight: 500; flex: 1; }
  .locale-en {
    color: var(--on-surface-variant, #d6c4ac);
    font-size: 0.75rem;
  }
</style>
