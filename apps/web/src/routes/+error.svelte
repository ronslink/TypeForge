<script lang="ts">
  import { page } from '$app/state';
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { t } from '$lib/stores/locale';
  
  // Use page.status and page.error in SvelteKit 2
</script>

<svelte:head>
  <title>Error {page.status} — TypingScholar</title>
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1 flex items-center justify-center">
    <div class="text-center px-6 py-24">
      <div class="flex justify-center mb-6">
        <div class="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-error text-4xl">
            {page.status === 404 ? 'search_off' : 'error'}
          </span>
        </div>
      </div>
      
      <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">
        {page.status === 404 ? $t('error_page_not_found') : $t('error_something_wrong')}
      </h1>
      
      <p class="font-body text-xl text-on-surface-variant max-w-lg mx-auto mb-10">
        {#if page.status === 404}
          {$t('error_404_description')}
        {:else}
          {$t('error_generic_description', { status: page.status })}
        {/if}
      </p>
      
      <div class="flex gap-4 justify-center">
        <button onclick={() => window.history.back()} class="notched-button bg-surface-container-high text-on-surface px-6 py-3 font-label font-bold hover:bg-surface-container transition-colors">
          {$t('error_go_back')}
        </button>
        <a href="/" class="notched-button bg-primary text-on-primary px-6 py-3 font-label font-bold hover:bg-primary-fixed-dim transition-colors">
          {$t('error_return_home')}
        </a>
      </div>
    </div>
  </main>
  <Footer />
</div>
