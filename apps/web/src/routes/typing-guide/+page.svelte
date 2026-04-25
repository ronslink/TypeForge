<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  const homeKeys = [
    { finger: 'Left Pinky',  key: 'A', color: 'bg-red-500' },
    { finger: 'Left Ring',   key: 'S', color: 'bg-orange-500' },
    { finger: 'Left Middle', key: 'D', color: 'bg-yellow-500' },
    { finger: 'Left Index',  key: 'F', color: 'bg-green-500', home: true },
    { finger: 'Right Index', key: 'J', color: 'bg-green-500', home: true },
    { finger: 'Right Middle',key: 'K', color: 'bg-yellow-500' },
    { finger: 'Right Ring',  key: 'L', color: 'bg-orange-500' },
    { finger: 'Right Pinky', key: ';', color: 'bg-red-500' },
  ];

  const fingerMapping = [
    { finger: 'Left pinky', keys: ['`', '1', 'Q', 'A', 'Z', 'Shift'], color: 'text-red-400' },
    { finger: 'Left ring',   keys: ['2', 'W', 'S', 'X'], color: 'text-orange-400' },
    { finger: 'Left middle',keys: ['3', 'E', 'D', 'C'], color: 'text-yellow-400' },
    { finger: 'Left index', keys: ['4', 'R', 'F', 'V', '5', 'T', 'G', 'B'], color: 'text-green-400' },
    { finger: 'Right index',keys: ['6', 'Y', 'H', 'N', '7', 'U', 'J', 'M'], color: 'text-green-400' },
    { finger: 'Right middle',keys: ['8', 'I', 'K', ','], color: 'text-yellow-400' },
    { finger: 'Right ring', keys: ['9', 'O', 'L', '.'], color: 'text-orange-400' },
    { finger: 'Right pinky',keys: ['0', 'P', ';', '/', '-', '=', '[', ']', "\\", "'"], color: 'text-red-400' },
  ];

  const tips = [
    {
      title: 'Master home row first',
      body: 'Your index fingers rest on the raised bumps of F and J. Always return to home position after reaching for any key. This builds muscle memory that makes all other keys faster.'
    },
    {
      title: 'One key, one finger',
      body: 'Assign each key to exactly one finger and never deviate. Even if a key is next to a finger that could reach it easier, stick to the assigned finger. Consistency is how you build speed.'
    },
    {
      title: 'Hit the key with the pad, not the tip',
      body: 'Use the pads (fleshy part) of your fingertips, not the nails or the very tips. This gives you more control and prevents finger strain injuries over time.'
    },
    {
      title: 'Keep your wrists floating',
      body: 'Your wrists should hover above the keyboard, not rest on it. Resting on the palm rest is fine between sessions, but typing with wrists planted causes carpal tunnel over time.'
    },
    {
      title: 'Start slow, build accuracy',
      body: 'Speed comes from muscle memory, and muscle memory requires correct repetition. If you type 60 WPM with 10% errors, you are drilling in bad habits. Better to type 30 WPM with 99% accuracy and build up.'
    },
    {
      title: 'For RTL scripts (Arabic, Hebrew), approach differently',
      body: 'Right-to-left scripts are typed leftward, but the muscle memory is about the key position, not the visual direction. Focus on memorising the keyboard layout, not the reading direction.'
    },
  ];
</script>

<svelte:head>
  <title>Typing Guide — TypingScholar</title>
  <meta name="description" content="Learn proper touch-typing technique with our complete guide. Master home row positioning, finger mapping, and script-specific tips." />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-4xl mx-auto">

      <div class="text-center mb-16">
        <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">The complete typing guide</h1>
        <p class="font-body text-xl text-on-surface-variant">
          Proper technique is the difference between 40 WPM and 100 WPM over time. Here's everything you need to build a solid foundation.
        </p>
      </div>

      <!-- Hand diagram -->
      <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 mb-16">
        <h2 class="font-headline text-2xl mb-8 text-center">Home row position</h2>
        <div class="flex justify-center mb-8">
          <div class="inline-grid grid-cols-8 gap-3">
            {#each homeKeys as k}
              <div class="flex flex-col items-center gap-2">
                <div class="w-16 h-16 rounded-xl {k.color} flex items-center justify-center {k.home ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}">
                  <span class="font-label text-xl text-on-primary font-bold">{k.key}</span>
                </div>
                {#if k.home}
                  <div class="w-2 h-2 bg-primary rounded-full"></div>
                {:else}
                  <div class="w-2 h-2"></div>
                {/if}
                <span class="font-label text-[10px] text-center text-on-surface-variant">{k.finger.split(' ')[1]}</span>
              </div>
            {/each}
          </div>
        </div>
        <p class="text-center font-body text-sm text-on-surface-variant">
          The raised bumps on <strong>F</strong> and <strong>J</strong> help you find home position without looking.
          {#if !typeof navigator === 'undefined' && navigator.platform?.includes('Mac')}
            <span class="block mt-1">On Mac keyboards, the dots are on <strong>F</strong> and <strong>J</strong>.</span>
          {/if}
        </p>
      </div>

      <!-- Finger mapping table -->
      <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 mb-16">
        <h2 class="font-headline text-2xl mb-6">Finger-to-key mapping</h2>
        <div class="space-y-4">
          {#each fingerMapping as row}
            <div class="flex items-center gap-4">
              <div class="w-32 shrink-0">
                <span class="font-label text-sm {row.color}">{row.finger}</span>
              </div>
              <div class="flex flex-wrap gap-2">
                {#each row.keys as key}
                  <span class="font-mono bg-surface-container-high px-3 py-1.5 rounded text-sm border border-outline-variant/20">
                    {key}
                  </span>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Tips -->
      <div class="mb-16">
        <h2 class="font-headline text-2xl mb-8">Core technique tips</h2>
        <div class="space-y-8">
          {#each tips as tip, i}
            <div class="flex gap-6">
              <div class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-headline text-xl">
                {i + 1}
              </div>
              <div>
                <h3 class="font-label text-lg mb-2">{tip.title}</h3>
                <p class="font-body text-on-surface-variant leading-relaxed">{tip.body}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <!-- Script-specific notes -->
      <div class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 mb-16">
        <h2 class="font-headline text-2xl mb-6">Per-script notes</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-label text-sm uppercase tracking-wider text-primary mb-3">Cyrillic</h3>
            <p class="font-body text-sm text-on-surface-variant">The layout follows the QWERTY physical positions even though the letters are different. Your fingers move the same paths — the visual changes, not the motor pattern.</p>
          </div>
          <div>
            <h3 class="font-label text-sm uppercase tracking-wider text-primary mb-3">Arabic & Hebrew</h3>
            <p class="font-body text-sm text-on-surface-variant">Type leftward but do not let that confuse your finger placement. The keyboard layout is still read left-to-right physically. Focus on position over visual direction.</p>
          </div>
          <div>
            <h3 class="font-label text-sm uppercase tracking-wider text-primary mb-3">CJK</h3>
            <p class="font-body text-sm text-on-surface-variant">Typing CJK characters involves multi-key sequences via pinyin (Chinese) or romaji (Japanese). Accuracy and tone markers matter — slow and correct beats fast and wrong.</p>
          </div>
          <div>
            <h3 class="font-label text-sm uppercase tracking-wider text-primary mb-3">Korean Hangul</h3>
            <p class="font-body text-sm text-on-surface-variant">Hangul is phonetic — each key corresponds to a jamo (letter). Letters combine into syllable blocks. Learning the individual jamo first makes typing intuitive.</p>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="text-center">
        <p class="font-body text-on-surface-variant mb-4">Practice these fundamentals in our adaptive lesson system.</p>
        <a href="/learn" class="notched-button bg-primary text-on-primary px-8 py-3 font-label font-bold hover:bg-primary-fixed-dim transition-colors inline-block">
          Start learning
        </a>
      </div>

    </section>
  </main>
  <Footer />
</div>