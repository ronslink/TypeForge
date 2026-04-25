<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const scripts = [
    {
      name: 'Latin', family: 'Roman', sample: 'The quick brown fox', rtl: false,
      description: 'The most widely used script. Includes all Western European languages with letters like é, ñ, ø.',
      languages: ['English', 'Spanish', 'French', 'German', 'Portuguese', 'Italian', 'Dutch', 'Polish']
    },
    {
      name: 'Cyrillic', family: 'Alphabetic', sample: 'Верный друг', rtl: false,
      description: 'Used across Russia, Bulgaria, Serbia, and many Central Asian nations. Over 50 languages use Cyrillic.',
      languages: ['Russian', 'Ukrainian', 'Bulgarian', 'Serbian', 'Kazakh', 'Mongolian']
    },
    {
      name: 'Arabic', family: 'Abjad', sample: 'الأصدقاء', rtl: true,
      description: 'A right-to-left script used by over 400 million people. Notably, vowels are often omitted in writing.',
      languages: ['Arabic', 'Persian', 'Urdu', 'Pashto']
    },
    {
      name: 'Hebrew', family: 'Abjad', sample: 'שלום עולם', rtl: true,
      description: 'Another right-to-left abjad, historically used for biblical texts and modern Israeli Hebrew.',
      languages: ['Hebrew', 'Yiddish']
    },
    {
      name: 'CJK', family: 'Logographic', sample: '日本語', rtl: false,
      description: 'Chinese characters (hanzi/kanji/hanja) used across Chinese, Japanese, and Korean writing systems.',
      languages: ['Mandarin', 'Cantonese', 'Japanese', 'Korean (Hanja)']
    },
    {
      name: 'Korean Hangul', family: 'Alphabet', sample: '안녕하세요', rtl: false,
      description: 'Phonetic alphabet created in 1443. Designed to be easy to learn with 14 basic consonants and 10 vowels.',
      languages: ['Korean']
    },
    {
      name: 'Devanagari', family: 'Abugida', sample: 'नमस्ते', rtl: false,
      description: 'Used for many Indo-Aryan languages of the Indian subcontinent. Each character includes a default vowel.',
      languages: ['Hindi', 'Marathi', 'Nepali', 'Sanskrit']
    },
    {
      name: 'Thai', family: 'Abugida', sample: 'สวัสดีครับ', rtl: false,
      description: 'Script of the Thai language with complex tone marks and no spaces between words.',
      languages: ['Thai']
    },
    {
      name: 'Greek', family: 'Alphabetic', sample: 'Καλημέρα', rtl: false,
      description: 'The script of classical antiquity, still used for Greek and mathematical/scientific notation.',
      languages: ['Greek']
    },
    {
      name: 'Armenian', family: 'Alphabetic', sample: 'Սիրելի ընկեր', rtl: false,
      description: 'An independent script created by Mesrop Mashtots in 405 AD. 38 letters, one for each sound.',
      languages: ['Armenian']
    },
    {
      name: 'Georgian', family: 'Alphabetic', sample: 'გამარჯობა', rtl: false,
      description: 'One of the few unique scripts that has its own Unicode block. Three historic scripts in one.',
      languages: ['Georgian']
    },
    {
      name: 'Tamil', family: 'Abugida', sample: 'வணக்கம்', rtl: false,
      description: 'One of the oldest living scripts in the world, used primarily for Tamil language in India and Sri Lanka.',
      languages: ['Tamil']
    },
  ];
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
        <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">17+ languages and counting</h1>
        <p class="font-body text-xl text-on-surface-variant max-w-2xl mx-auto">
          From Latin to CJK, from Arabic RTL to Devanagari — TypingScholar's adaptive engine tailors to each script's unique challenges.
        </p>
      </div>

      <!-- Script cards -->
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each scripts as script}
          <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <span class="font-label text-xs uppercase tracking-widest px-3 py-1 bg-surface-container-high rounded-full">{script.name}</span>
              {#if script.rtl}
                <span class="font-label text-xs text-on-surface-variant">RTL</span>
              {/if}
            </div>

            <!-- Sample text -->
            <div class="mb-4 p-4 bg-surface-container-high rounded-xl">
              <p class="font-body text-2xl leading-relaxed" dir={script.rtl ? 'rtl' : 'ltr'}>{script.sample}</p>
              <p class="font-label text-xs text-on-surface-variant mt-2 uppercase tracking-wider">{script.family}</p>
            </div>

            <!-- Description -->
            <p class="font-body text-sm text-on-surface-variant mb-4 leading-relaxed">{script.description}</p>

            <!-- Languages -->
            <div class="flex flex-wrap gap-2">
              {#each script.languages as lang}
                <span class="font-label text-[11px] uppercase tracking-wide px-2 py-1 bg-surface-container rounded text-on-surface-variant">
                  {lang}
                </span>
              {/each}
            </div>
          </div>
        {/each}
      </div>

      <!-- Coming soon -->
      <div class="mt-16 text-center">
        <div class="inline-block bg-surface-container-low border border-outline-variant/20 rounded-2xl px-8 py-6">
          <h2 class="font-headline text-xl mb-2">More coming soon</h2>
          <p class="font-body text-sm text-on-surface-variant">
            Vietnamese (Latin), Bengali, Punjabi (Gurmukhi), Tibetan, and more are on our roadmap.
          </p>
        </div>
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