<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { ALL_LANGUAGES } from '$lib/i18n/languages';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();
  const lang = $derived(data.language);

  // For hreflang we can map out all alternatives
  const alternatives = ALL_LANGUAGES;
</script>

<svelte:head>
  <title>Learn to Type in {lang.englishName} ({lang.nativeName}) — TypingScholar</title>
  <meta name="description" content="Master touch typing in {lang.englishName}. Practice using the {lang.keyboard} keyboard layout. Improve your WPM and accuracy with our adaptive {lang.script} curriculum." />
  
  <link rel="canonical" href="https://typingscholar.com/languages/{lang.code}" />
  
  <!-- SEO: hreflang tags for all languages -->
  {#each alternatives as alt}
    <link rel="alternate" hreflang={alt.code} href="https://typingscholar.com/languages/{alt.code}" />
  {/each}
  <link rel="alternate" hreflang="x-default" href="https://typingscholar.com/languages" />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col" dir={lang.rtl ? 'rtl' : 'ltr'}>
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-screen-xl mx-auto">
      <div class="flex flex-col lg:flex-row gap-16 items-center">
        <div class="flex-1 text-center lg:text-left" dir="ltr">
          <span class="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-label text-sm font-bold uppercase tracking-widest mb-6">
            Language & Script Support
          </span>
          <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-6">
            Master <span class="text-primary">{lang.englishName}</span> Typing
          </h1>
          <p class="font-body text-xl text-on-surface-variant mb-8 leading-relaxed">
            Boost your productivity and digital fluency. Our adaptive curriculum helps you learn touch typing in {lang.nativeName} using the standard {lang.keyboard} layout.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <a href="/sign-up" class="notched-button bg-primary text-on-primary px-8 py-4 font-label font-bold text-lg hover:bg-primary-fixed-dim transition-colors text-center">
              Start Free Practice
            </a>
            <a href="/languages" class="px-8 py-4 font-label font-bold text-lg text-on-surface-variant hover:text-on-surface transition-colors text-center">
              View all languages
            </a>
          </div>
        </div>
        
        <div class="flex-1 w-full max-w-lg">
          <div class="bg-surface-container-low border border-outline-variant/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <!-- Decorative blur -->
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 blur-3xl rounded-full" aria-hidden="true"></div>
            
            <div class="relative z-10" dir={lang.rtl ? 'rtl' : 'ltr'}>
              <div class="flex items-center justify-between mb-8" dir="ltr">
                <div>
                  <div class="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-1">Keyboard Layout</div>
                  <div class="font-headline text-2xl">{lang.keyboard}</div>
                </div>
                <div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center font-headline text-xl">
                  {lang.code.toUpperCase()}
                </div>
              </div>
              
              <div class="mb-8">
                <div class="font-label text-sm text-on-surface-variant uppercase tracking-widest mb-3" dir="ltr">Sample Practice Text</div>
                <div class="p-6 bg-surface-container-high rounded-2xl border border-outline-variant/10">
                  <p class="font-body text-2xl leading-relaxed text-on-surface">{lang.sampleText}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-4" dir="ltr">
                <div class="bg-surface-container p-4 rounded-xl">
                  <div class="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Script Family</div>
                  <div class="font-bold text-on-surface">{lang.script}</div>
                </div>
                <div class="bg-surface-container p-4 rounded-xl">
                  <div class="font-label text-xs text-on-surface-variant uppercase tracking-widest mb-1">Direction</div>
                  <div class="font-bold text-on-surface">{lang.rtl ? 'Right-to-Left' : 'Left-to-Right'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <Footer />
</div>
