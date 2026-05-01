<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { ALL_LANGUAGES, REGIONS, getLanguagesByRegion } from '$lib/i18n/languages';
</script>

<svelte:head>
  <title>Supported Languages — TypingScholar</title>
  <meta name="description" content="TypingScholar supports 17+ languages and scripts including Latin, Cyrillic, Arabic, Hebrew, CJK, Korean Hangul, Devanagari, Thai, Greek, and more." />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-screen-2xl mx-auto">
      <div class="text-center mb-20">
        <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">Master typing in any language</h1>
        <p class="font-body text-xl text-on-surface-variant max-w-2xl mx-auto">
          From Latin to CJK, from Arabic RTL to Devanagari — TypingScholar's adaptive engine tailors to each language's unique layout and script.
        </p>
      </div>

      <!-- Languages by Region -->
      <div class="space-y-16">
        {#each REGIONS as region}
          {@const regionLangs = getLanguagesByRegion(region)}
          {#if regionLangs.length > 0}
            <div>
              <h2 class="font-headline text-2xl mb-6 text-primary border-b border-outline-variant/20 pb-2">{region}</h2>
              <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each regionLangs as lang}
                  <a href="/languages/{lang.code}" class="block group">
                    <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6 h-full transition-transform hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
                      <!-- Header -->
                      <div class="flex items-center justify-between mb-4">
                        <span class="font-label text-xs uppercase tracking-widest px-3 py-1 bg-surface-container-high rounded-full">{lang.script}</span>
                        {#if lang.rtl}
                          <span class="font-label text-xs text-on-surface-variant">RTL</span>
                        {/if}
                      </div>

                      <!-- Sample text -->
                      <div class="mb-4 p-4 bg-surface-container-high rounded-xl">
                        <p class="font-body text-2xl leading-relaxed truncate" dir={lang.rtl ? 'rtl' : 'ltr'}>{lang.sampleText}</p>
                        <p class="font-label text-xs text-on-surface-variant mt-2 uppercase tracking-wider">{lang.keyboard}</p>
                      </div>

                      <!-- Language Name -->
                      <h3 class="font-headline text-xl mb-1 group-hover:text-primary transition-colors">{lang.englishName}</h3>
                      <p class="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">{lang.nativeName}</p>
                    </div>
                  </a>
                {/each}
              </div>
            </div>
          {/if}
        {/each}
      </div>

      <!-- CTA -->
      <div class="mt-16 text-center">
        <p class="font-body text-on-surface-variant mb-4">Ready to master a new script?</p>
        <a href="/sign-up" class="notched-button bg-primary text-on-primary px-8 py-3 font-label font-bold hover:bg-primary-fixed-dim transition-colors inline-block">
          Start for free
        </a>
      </div>
    </section>
  </main>
  <Footer />
</div>