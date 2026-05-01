<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { t } from '$lib/stores/locale';
  
  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  
  let bestSession = $state({ wpm: 0, accuracy: 0, date: new Date().toISOString() });
  let loading = $state(true);
  
  onMount(async () => {
    if (!isSignedIn) {
      loading = false;
      return;
    }
    
    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (token) h.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      };
      const api = createApiClient('/', authFetch);
      
      const res = await api.api.v1.progress.$get();
      if (res.ok) {
        const progress = await res.json();
        const validSessions = (progress?.history || []).filter((s: any) => (s.accuracy || 0) >= 95);
        if (validSessions.length > 0) {
          bestSession = validSessions.sort((a: any, b: any) => (b.wpm || 0) - (a.wpm || 0))[0];
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  });

  function formatDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function handlePrint() {
    window.print();
  }
</script>

<svelte:head>
  <title>{$t('cert_official')} — TypingScholar</title>
  {#if bestSession.wpm > 0}
    <meta property="og:title" content="My TypingScholar Certificate" />
    <meta property="og:image" content={`https://typingscholar.com/api/og/certificate?wpm=${bestSession.wpm}&acc=${bestSession.accuracy}`} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={`https://typingscholar.com/api/og/certificate?wpm=${bestSession.wpm}&acc=${bestSession.accuracy}`} />
  {/if}
</svelte:head>

{#if loading}
  <div class="min-h-screen flex items-center justify-center">
    <div class="animate-pulse flex flex-col items-center">
      <div class="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p class="font-label tracking-widest uppercase text-on-surface-variant text-sm">{$t('cert_validating')}</p>
    </div>
  </div>
{:else if bestSession.wpm < 60 || !isSignedIn}
  <div class="min-h-screen flex items-center justify-center p-6">
    <div class="max-w-md bg-surface-container p-8 rounded border border-outline-variant/30 text-center">
      <span class="inline-flex w-12 h-12 text-error mb-4 mx-auto" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="10" rx="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </span>
      <h1 class="font-headline text-2xl mb-2">{$t('cert_locked_title')}</h1>
      <p class="text-on-surface-variant text-sm mb-6">
        {@html $t('cert_locked_desc')}
      </p>
      <a href="/progress" class="notched-button bg-primary text-background px-6 py-3 font-label text-sm font-bold uppercase tracking-wider">
        {$t('cert_return_progress')}
      </a>
    </div>
  </div>
{:else}
  <!-- Print Controls (Hidden when printing) -->
  <div class="fixed top-6 right-6 flex gap-4 print:hidden z-50">
    <a href="/progress" class="notched-button bg-surface-container text-on-surface px-4 py-2 font-label text-xs uppercase tracking-widest border border-outline-variant/30 hover:bg-surface-container-high transition-colors">
      {$t('cert_back')}
    </a>
    <button onclick={handlePrint} class="notched-button bg-primary text-background px-4 py-2 font-label text-xs font-bold uppercase tracking-widest hover:bg-primary-fixed-dim transition-colors flex items-center gap-2">
      <span class="inline-flex w-4 h-4" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      </span>
      {$t('cert_print')}
    </button>
    <a 
      href={`https://twitter.com/intent/tweet?text=I%20just%20hit%20${bestSession.wpm}%20WPM%20with%20${bestSession.accuracy}%25%20accuracy%20on%20TypingScholar!%0A%0Ahttps://typingscholar.com/certificate`}
      target="_blank"
      rel="noopener noreferrer"
      class="notched-button bg-[#1DA1F2] text-white px-4 py-2 font-label text-xs font-bold uppercase tracking-widest hover:bg-[#1A91DA] transition-colors flex items-center gap-2"
    >
      <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      Share
    </a>
  </div>

  <!-- Certificate Container -->
  <div class="certificate-wrapper min-h-screen bg-background flex items-center justify-center p-8 print:p-0">
    <div class="certificate aspect-[1.414/1] w-full max-w-[1056px] relative bg-white text-black overflow-hidden shadow-2xl print:shadow-none">
      
      <!-- Ornamental Border -->
      <div class="absolute inset-4 border-[1px] border-black/10"></div>
      <div class="absolute inset-[18px] border-4 border-black/80"></div>
      <div class="absolute inset-[24px] border-[1px] border-black/10"></div>
      
      <!-- Corner Ornaments -->
      <div class="absolute top-5 left-5 w-8 h-8 border-t-4 border-l-4 border-black/80"></div>
      <div class="absolute top-5 right-5 w-8 h-8 border-t-4 border-r-4 border-black/80"></div>
      <div class="absolute bottom-5 left-5 w-8 h-8 border-b-4 border-l-4 border-black/80"></div>
      <div class="absolute bottom-5 right-5 w-8 h-8 border-b-4 border-r-4 border-black/80"></div>

      <!-- Background Watermark -->
      <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <span class="font-headline text-[250px] leading-none tracking-tighter">TS</span>
      </div>

      <!-- Certificate Content -->
      <div class="relative h-full flex flex-col items-center justify-center text-center p-16 pb-12 z-10">
        
        <h3 class="font-label text-sm uppercase tracking-[0.4em] text-black/60 mb-6">{$t('cert_official')}</h3>
        
        <h1 class="font-headline text-6xl md:text-7xl mb-10 tracking-tight text-black">
          TypingScholar
        </h1>

        <p class="font-body text-xl md:text-2xl text-black/80 mb-6 italic">
          {$t('cert_certifies')}
        </p>

        <h2 class="font-headline text-4xl md:text-5xl text-black border-b border-black/20 pb-4 px-12 mb-10 min-w-[50%]">
          {ctx?.user?.firstName ? `${ctx.user.firstName} ${ctx.user.lastName || ''}` : $t('cert_default_name')}
        </h2>

        <p class="font-body text-lg md:text-xl text-black/80 max-w-2xl mx-auto leading-relaxed mb-12">
          {@html $t('cert_body', { wpm: Math.round(bestSession.wpm).toString(), accuracy: Math.round(bestSession.accuracy).toString() })}
        </p>

        <!-- Footer / Signatures -->
        <div class="w-full flex justify-between items-end mt-auto px-16">
          <div class="text-center w-48">
            <div class="font-headline text-2xl border-b border-black/30 pb-2 mb-2 text-black/80">
              {formatDate(bestSession.date)}
            </div>
            <div class="font-label text-xs uppercase tracking-widest text-black/50">{$t('cert_date_label')}</div>
          </div>

          <!-- Seal -->
          <div class="relative flex items-center justify-center">
            <div class="absolute w-24 h-24 bg-[#ffc56c] rounded-full mix-blend-multiply opacity-20 blur-md"></div>
            <div class="w-32 h-32 rounded-full border-[6px] border-[#ffc56c] flex items-center justify-center relative bg-white shadow-lg z-10">
              <div class="absolute inset-2 border border-[#ffc56c]/50 rounded-full border-dashed"></div>
              <div class="text-center">
                <span class="block font-headline text-2xl text-[#c48d35] leading-none mb-1">TS</span>
                <span class="block font-label text-[8px] uppercase tracking-widest text-[#c48d35] font-bold">{$t('cert_certified')}</span>
              </div>
            </div>
          </div>

          <div class="text-center w-48">
            <div class="border-b border-black/30 pb-2 mb-2">
              <span class="font-label italic text-2xl tracking-tighter text-black/80 block -mb-1 signature-font">TypeForge Engine</span>
            </div>
            <div class="font-label text-xs uppercase tracking-widest text-black/50">{$t('cert_verifier')}</div>
          </div>
        </div>

      </div>
    </div>
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap');

  .signature-font {
    font-family: 'Playfair Display', serif;
  }

  .notched-button {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }

  /* Print optimizations */
  @media print {
    @page {
      size: A4 landscape;
      margin: 0;
    }
    
    :global(body) {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    :global(nav), :global(footer), :global(sidebar) {
      display: none !important;
    }

    .certificate-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .certificate {
      width: 100vw;
      height: 100vh;
      max-width: none;
      border: none;
      box-shadow: none;
      transform: scale(1);
    }
  }
</style>
