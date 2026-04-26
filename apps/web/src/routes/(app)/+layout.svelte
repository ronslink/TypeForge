<script lang="ts">
  import type { LayoutProps } from './$types';
  import { page } from '$app/state';
  import { goto, afterNavigate } from '$app/navigation';
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { useClerkContext } from 'svelte-clerk';

  let { children, data }: LayoutProps = $props();

  // Soft auth banner shown when signed out on soft-auth pages
  const softAuthPages = ['/learn', '/progress', '/practice'];

  const ctx = useClerkContext();
  let showAuthBanner = $derived(
    ctx?.isLoaded && !ctx?.user && softAuthPages.some((p) => page.url.pathname.startsWith(p))
  );

  // Move focus to main content after each navigation
  let mainContentRef = $state<HTMLElement | null>(null);
  afterNavigate(() => { if (mainContentRef) mainContentRef.focus(); });

  function handleSkipToContent(event: Event) {
    event.preventDefault();
    if (mainContentRef) {
      mainContentRef.focus();
      mainContentRef.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<div class="min-h-screen bg-background grid-texture text-on-background flex flex-col">

  <!-- Skip to Content - visible on keyboard focus -->
  <a href="#main-content" class="skip-to-content" onclick={handleSkipToContent}>
    Skip to main content
  </a>

  <!-- Soft auth banner for /learn /practice /progress when signed out -->
  {#if showAuthBanner}
    <div
      class="fixed top-0 left-0 right-0 z-[60] bg-surface-container-high border-b border-outline-variant"
      role="banner"
    >
      <div class="flex justify-between items-center w-full px-8 py-3 max-w-screen-2xl mx-auto">
        <span class="text-sm text-on-surface-variant font-body">Sign in to save your progress</span>
        <a
          href="/sign-in"
          class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors inline-block"
        >
          Sign In
        </a>
      </div>
    </div>
  {/if}

  <TopNavBar />

  <main
    id="main-content"
    bind:this={mainContentRef}
    class="pt-20 outline-none flex-1"
    class:mt-12={showAuthBanner}
    tabindex="-1"
    aria-label="Main content"
  >
    {@render children()}
  </main>

  <Footer />
</div>

<style>
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
    transition: top 0.2s ease;
  }
  .skip-to-content:focus { top: 0; }
  main:focus { outline: none; }

  @media (prefers-reduced-motion: reduce) {
    .skip-to-content { transition: none; }
  }
</style>
