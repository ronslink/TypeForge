<script lang="ts">
  import { writable } from 'svelte/store';
  import { ALL_LANGUAGES, type Language } from '$lib/i18n/languages';
  import { WPMCalculator, AccuracyCalculator } from '@typeforge/metrics';
  import { MetricsBar, Keyboard } from '@typeforge/ui';
  import { layouts } from '@typeforge/layouts';
  import { api } from '@typeforge/api/client';
  import { goto } from '$app/navigation';

  // ============================================================================
  // Types
  // ============================================================================

  type LayoutOption = {
    id: string;
    name: string;
    languageCode: string;
    preview: string[];
  };

  type OnboardingState = {
    currentStep: number;
    selectedLanguage: string | null;
    selectedLayout: string | null;
    testResults: {
      wpm: number;
      accuracy: number;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    } | null;
  };

  // ============================================================================
  // Store
  // ============================================================================

  const onboardingStore = writable<OnboardingState>({
    currentStep: 1,
    selectedLanguage: null,
    selectedLayout: null,
    testResults: null,
  });

  // ============================================================================
  // Layout Options
  // ============================================================================

  const LAYOUT_OPTIONS: LayoutOption[] = [
    {
      id: 'qwerty-us',
      name: 'QWERTY (US)',
      languageCode: 'en',
      preview: ['Q', 'W', 'E', 'R', 'T', 'Y'],
    },
    {
      id: 'azerty-fr',
      name: 'AZERTY (FR)',
      languageCode: 'fr',
      preview: ['A', 'Z', 'E', 'R', 'T', 'Y'],
    },
    {
      id: 'qwertz-de',
      name: 'QWERTZ (DE)',
      languageCode: 'de',
      preview: ['Q', 'W', 'E', 'R', 'T', 'Z'],
    },
    {
      id: 'dvorak',
      name: 'Dvorak',
      languageCode: 'en',
      preview: ['P', 'Y', 'F', 'G', 'C', 'R'],
    },
    {
      id: 'arabic',
      name: 'Arabic',
      languageCode: 'ar',
      preview: ['ض', 'ص', 'ث', 'ق', 'ف', 'غ'],
    },
    {
      id: 'cyrillic',
      name: 'Cyrillic (ЙЦУКЕН)',
      languageCode: 'ru',
      preview: ['Й', 'Ц', 'У', 'К', 'Е', 'Н'],
    },
    {
      id: 'romaji',
      name: 'Japanese (Romaji)',
      languageCode: 'ja',
      preview: ['Q', 'W', 'E', 'R', 'T', 'Y'],
    },
  ];

  // ============================================================================
  // Step 1: Language Selection
  // ============================================================================

  function selectLanguage(code: string) {
    onboardingStore.update((state) => ({
      ...state,
      selectedLanguage: code,
    }));
  }

  function getSelectedLanguage(): Language | undefined {
    const state = $onboardingStore;
    if (!state.selectedLanguage) return undefined;
    return ALL_LANGUAGES.find((l) => l.code === state.selectedLanguage);
  }

  // ============================================================================
  // Step 2: Layout Selection
  // ============================================================================

  function selectLayout(layoutId: string) {
    onboardingStore.update((state) => ({
      ...state,
      selectedLayout: layoutId,
    }));
  }

  // ============================================================================
  // Step 3: Placement Test
  // ============================================================================

  let testText = $state('');
  let userInput = $state('');
  let testStarted = $state(false);
  let testEnded = $state(false);
  let timeRemaining = $state(60);
  let wpmCalculator = $state(new WPMCalculator());
  let accuracyCalculator = $state(new AccuracyCalculator());
  let currentWPM = $state(0);
  let currentAccuracy = $state(100);
  let testInterval: ReturnType<typeof setInterval> | null = null;
  let pressedKey = $state<string | undefined>(undefined);
  let highlightKeys = $state<Set<string>>(new Set());

  function initPlacementTest() {
    const lang = getSelectedLanguage();
    testText = lang?.sampleText || 'The quick brown fox jumps over the lazy dog.';
    userInput = '';
    testStarted = false;
    testEnded = false;
    timeRemaining = 60;
    wpmCalculator = new WPMCalculator();
    accuracyCalculator = new AccuracyCalculator();
    currentWPM = 0;
    currentAccuracy = 100;
    pressedKey = undefined;
    highlightKeys = new Set();
  }

  function startTest() {
    testStarted = true;
    testInterval = setInterval(() => {
      timeRemaining--;
      updateMetrics();
      if (timeRemaining <= 0) {
        endTest();
      }
    }, 1000);
  }

  function updateMetrics() {
    const wpmResult = wpmCalculator.getWPM();
    currentWPM = Math.round(wpmResult.netWPM);
    currentAccuracy = Math.round(accuracyCalculator.getAccuracy());
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!testStarted && !testEnded) {
      startTest();
    }

    if (testEnded) return;

    // Prevent default for printable characters
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();

      const expectedChar = testText[userInput.length];
      const isCorrect = event.key === expectedChar;

      // Update calculators
      wpmCalculator.onKeystroke(event.code, isCorrect, Date.now());
      accuracyCalculator.onKeystroke(event.code, isCorrect);

      if (isCorrect) {
        userInput += event.key;

        // Highlight next key
        const nextChar = testText[userInput.length];
        if (nextChar) {
          highlightKeys = new Set([nextChar.toLowerCase()]);
        }
      }

      updateMetrics();

      // Check if test is complete
      if (userInput.length >= testText.length) {
        endTest();
      }
    }

    pressedKey = event.key.toLowerCase();
  }

  function handleKeyup(event: KeyboardEvent) {
    pressedKey = undefined;
  }

  function endTest() {
    if (testInterval) {
      clearInterval(testInterval);
      testInterval = null;
    }
    testEnded = true;
    testStarted = false;

    const finalWPM = currentWPM;
    const finalAccuracy = currentAccuracy;

    let level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    if (finalWPM < 30) level = 'beginner';
    else if (finalWPM < 60) level = 'intermediate';
    else if (finalWPM < 90) level = 'advanced';
    else level = 'expert';

    onboardingStore.update((state) => ({
      ...state,
      testResults: {
        wpm: finalWPM,
        accuracy: finalAccuracy,
        level,
      },
    }));
  }

  // ============================================================================
  // Step 4: Results & Save
  // ============================================================================

  async function savePreferences() {
    const state = $onboardingStore;

    // Check if user is logged in (Clerk)
    const isLoggedIn = typeof window !== 'undefined' && (window as any).Clerk?.user?.id;

    if (isLoggedIn && state.selectedLanguage && state.selectedLayout) {
      try {
        // Save preferences to API
        await api.api.v1.sessions.$post({
          json: {
            wpm: state.testResults?.wpm || 0,
            accuracy: state.testResults?.accuracy || 0,
            keystrokes: [],
            duration: 60 - timeRemaining,
            language: state.selectedLanguage,
            layout: state.selectedLayout,
          },
        });
      } catch (error) {
        console.error('Failed to save preferences:', error);
      }
    }

    // Navigate to learn page
    goto('/learn');
  }

  // ============================================================================
  // Navigation
  // ============================================================================

  function nextStep() {
    onboardingStore.update((state) => {
      const next = Math.min(state.currentStep + 1, 4);
      if (next === 3) {
        // Initialize test when entering step 3
        setTimeout(initPlacementTest, 0);
      }
      return { ...state, currentStep: next };
    });
  }

  function prevStep() {
    onboardingStore.update((state) => ({
      ...state,
      currentStep: Math.max(state.currentStep - 1, 1),
    }));
  }

  function goToStep(step: number) {
    onboardingStore.update((state) => {
      if (step === 3) {
        setTimeout(initPlacementTest, 0);
      }
      return { ...state, currentStep: step };
    });
  }

  // ============================================================================
  // Reactive Computations
  // ============================================================================

  let canProceed = $derived.by(() => {
    const state = $onboardingStore;
    switch (state.currentStep) {
      case 1:
        return !!state.selectedLanguage;
      case 2:
        return !!state.selectedLayout;
      case 3:
        return testEnded;
      default:
        return true;
    }
  });

  let stepTitle = $derived.by(() => {
    switch ($onboardingStore.currentStep) {
      case 1:
        return 'Choose Your Language';
      case 2:
        return 'Select Keyboard Layout';
      case 3:
        return 'Placement Test';
      case 4:
        return 'Your Results';
      default:
        return '';
    }
  });

  let stepDescription = $derived.by(() => {
    switch ($onboardingStore.currentStep) {
      case 1:
        return 'Select the language you want to practice typing in';
      case 2:
        return 'Choose the keyboard layout you use';
      case 3:
        return 'Type the text below to assess your current skill level';
      case 4:
        return 'Based on your performance, we recommend the following starting level';
      default:
        return '';
    }
  });

  // Get current layout for keyboard display
  let currentLayout = $derived.by(() => {
    const layoutId = $onboardingStore.selectedLayout || 'qwerty-us';
    return layouts[layoutId as keyof typeof layouts] || layouts['qwerty-us'];
  });

  // Metrics for display
  let metrics = $derived([
    { label: 'WPM', value: currentWPM, unit: '', variant: 'primary' as const },
    { label: 'Accuracy', value: currentAccuracy, unit: '%', variant: 'secondary' as const },
    { label: 'Time', value: timeRemaining, unit: 's', variant: 'default' as const },
  ]);
</script>

<svelte:head>
  <title>Onboarding — TypeForge</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

<div class="min-h-screen bg-background">
  <!-- Progress Bar -->
  <div class="fixed top-0 left-0 right-0 z-50">
    <div class="flex h-1">
      {#each [1, 2, 3, 4] as step}
        <button
          class="flex-1 transition-all duration-300 {step <= $onboardingStore.currentStep
            ? 'bg-primary'
            : 'bg-surface-container-high'}"
          onclick={() => goToStep(step)}
          aria-label="Go to step {step}"
        ></button>
      {/each}
    </div>
  </div>

  <!-- Header -->
  <header class="pt-16 pb-8 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <div class="flex items-center justify-center gap-2 mb-4">
        <span class="font-label text-sm text-primary">Step {$onboardingStore.currentStep} of 4</span
        >
      </div>
      <h1 class="font-headline text-4xl md:text-5xl text-on-background mb-3">
        {stepTitle}
      </h1>
      <p class="font-body text-on-surface-variant text-lg max-w-xl mx-auto">
        {stepDescription}
      </p>
    </div>
  </header>

  <!-- Main Content -->
  <main class="px-6 pb-24">
    <div class="max-w-4xl mx-auto">
      <!-- Step 1: Language Selection -->
      {#if $onboardingStore.currentStep === 1}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each ALL_LANGUAGES as language}
            <button
              class="language-card relative p-6 text-left transition-all duration-300 border-2 border-transparent hover:border-outline-variant"
              class:selected={$onboardingStore.selectedLanguage === language.code}
              onclick={() => selectLanguage(language.code)}
            >
              <div class="flex flex-col h-full">
                <span class="font-headline text-2xl text-on-surface mb-1">
                  {language.nativeName}
                </span>
                <span class="font-body text-sm text-on-surface-variant mb-3">
                  {language.englishName}
                </span>
                <div class="mt-auto pt-3 border-t border-outline-variant">
                  <span
                    class="font-body text-sm text-on-surface-variant line-clamp-2"
                    dir={language.rtl ? 'rtl' : 'ltr'}
                  >
                    {language.sampleText}
                  </span>
                </div>
                {#if language.rtl}
                  <span
                    class="absolute top-3 right-3 font-label text-xs text-secondary bg-secondary/10 px-2 py-1"
                  >
                    RTL
                  </span>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {/if}

      <!-- Step 2: Layout Selection -->
      {#if $onboardingStore.currentStep === 2}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each LAYOUT_OPTIONS as layout}
            <button
              class="layout-card relative p-6 text-left transition-all duration-300 border-2 border-transparent hover:border-outline-variant"
              class:selected={$onboardingStore.selectedLayout === layout.id}
              onclick={() => selectLayout(layout.id)}
            >
              <div class="flex flex-col h-full">
                <span class="font-headline text-xl text-on-surface mb-3">
                  {layout.name}
                </span>
                <div class="keyboard-preview">
                  {#each layout.preview as key}
                    <span class="key-preview">{key}</span>
                  {/each}
                </div>
              </div>
            </button>
          {/each}
        </div>
      {/if}

      <!-- Step 3: Placement Test -->
      {#if $onboardingStore.currentStep === 3}
        <div class="space-y-6">
          <!-- Metrics Bar -->
          <MetricsBar {metrics} />

          <!-- Typing Area -->
          <div class="typing-area bg-surface-container-low p-8 relative">
            <!-- Text Display -->
            <div class="font-body text-2xl leading-relaxed mb-8 min-h-[120px]">
              {#each testText.split('') as char, i}
                <span
                  class="char"
                  class:correct={i < userInput.length}
                  class:current={i === userInput.length}
                  class:pending={i > userInput.length}
                >
                  {char}
                </span>
              {/each}
            </div>

            <!-- Progress Bar -->
            <div class="w-full h-1 bg-surface-container-high mb-6">
              <div
                class="h-full bg-primary transition-all duration-300"
                style="width: {(userInput.length / testText.length) * 100}%"
              ></div>
            </div>

            <!-- Instructions -->
            {#if !testStarted && !testEnded}
              <div class="text-center py-4">
                <p class="font-label text-sm text-on-surface-variant animate-pulse">
                  Start typing to begin the test
                </p>
              </div>
            {/if}

            {#if testEnded}
              <div class="text-center py-4">
                <p class="font-label text-lg text-primary">Test Complete!</p>
              </div>
            {/if}
          </div>

          <!-- Keyboard Visualization -->
          <div class="keyboard-section">
            <p
              class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-4 text-center"
            >
              Keyboard Layout
            </p>
            <Keyboard layout={currentLayout} {highlightKeys} {pressedKey} />
          </div>
        </div>
      {/if}

      <!-- Step 4: Results -->
      {#if $onboardingStore.currentStep === 4}
        {@const results = $onboardingStore.testResults}
        <div class="space-y-8">
          <!-- Results Cards -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="result-card bg-surface-container-low p-8 text-center">
              <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                WPM Achieved
              </span>
              <div class="font-label text-6xl font-bold text-primary mt-4">
                {results?.wpm || 0}
              </div>
              <span class="font-body text-sm text-on-surface-variant">words per minute</span>
            </div>

            <div class="result-card bg-surface-container-low p-8 text-center">
              <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Accuracy
              </span>
              <div class="font-label text-6xl font-bold text-secondary mt-4">
                {results?.accuracy || 0}%
              </div>
              <span class="font-body text-sm text-on-surface-variant">correct keystrokes</span>
            </div>

            <div class="result-card bg-surface-container-low p-8 text-center">
              <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">
                Suggested Level
              </span>
              <div class="font-label text-4xl font-bold text-on-surface mt-4 capitalize">
                {results?.level || 'beginner'}
              </div>
              <span class="font-body text-sm text-on-surface-variant">starting point</span>
            </div>
          </div>

          <!-- Level Description -->
          <div class="level-description bg-surface-container p-6">
            <h3 class="font-headline text-xl text-on-surface mb-3">What this means</h3>
            <p class="font-body text-on-surface-variant">
              {#if results?.level === 'beginner'}
                You're just starting out! We'll guide you through the fundamentals of touch typing,
                starting with home row keys and proper finger placement.
              {:else if results?.level === 'intermediate'}
                You have a solid foundation! We'll help you build speed and accuracy with more
                complex patterns and common words.
              {:else if results?.level === 'advanced'}
                Great typing skills! We'll challenge you with advanced techniques, special
                characters, and longer passages.
              {:else}
                Excellent! You're already a proficient typist. We'll help you maintain your skills
                and tackle specialized content.
              {/if}
            </p>
          </div>

          <!-- CTA -->
          <div class="text-center pt-8">
            <button
              class="start-learning-btn notched-button font-label font-bold text-lg px-12 py-4 transition-all duration-300 hover:amber-glow"
              onclick={savePreferences}
            >
              Start Learning
            </button>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <!-- Navigation Footer -->
  {#if $onboardingStore.currentStep < 4}
    <footer
      class="fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant px-6 py-4"
    >
      <div class="max-w-4xl mx-auto flex justify-between items-center">
        <button
          class="nav-btn font-label text-sm px-6 py-3 transition-all duration-300"
          onclick={prevStep}
          disabled={$onboardingStore.currentStep === 1}
          class:opacity-50={$onboardingStore.currentStep === 1}
          class:cursor-not-allowed={$onboardingStore.currentStep === 1}
        >
          Back
        </button>

        <button
          class="nav-btn-primary notched-button font-label font-bold text-sm px-8 py-3 transition-all duration-300 hover:amber-glow"
          onclick={nextStep}
          disabled={!canProceed}
          class:opacity-50={!canProceed}
          class:cursor-not-allowed={!canProceed}
        >
          {#if $onboardingStore.currentStep === 3}
            See Results
          {:else}
            Continue
          {/if}
        </button>
      </div>
    </footer>
  {/if}
</div>

<style>
  /* Language & Layout Cards */
  .language-card,
  .layout-card {
    background: var(--surface-container-low);
    clip-path: polygon(
      0 0,
      calc(100% - 12px) 0,
      100% 12px,
      100% 100%,
      12px 100%,
      0 calc(100% - 12px)
    );
  }

  .language-card.selected,
  .layout-card.selected {
    border-color: var(--primary) !important;
    background: var(--surface-container);
    box-shadow: 0 0 20px rgba(255, 197, 108, 0.15);
  }

  .language-card:hover:not(.selected),
  .layout-card:hover:not(.selected) {
    background: var(--surface-container);
  }

  /* Keyboard Preview */
  .keyboard-preview {
    display: flex;
    gap: 4px;
    justify-content: center;
    padding: 12px;
    background: var(--surface-container-lowest);
  }

  .key-preview {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-container);
    font-family: var(--font-label);
    font-size: 0.875rem;
    color: var(--on-surface);
  }

  /* Typing Area */
  .typing-area {
    clip-path: polygon(
      0 0,
      calc(100% - 16px) 0,
      100% 16px,
      100% 100%,
      16px 100%,
      0 calc(100% - 16px)
    );
  }

  .char {
    transition: all 0.1s ease;
  }

  .char.correct {
    color: var(--primary);
  }

  .char.current {
    background: var(--primary-container);
    color: var(--on-primary-container);
    animation: blink 1s infinite;
  }

  .char.pending {
    color: var(--on-surface-variant);
  }

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0.5;
    }
  }

  /* Keyboard Section */
  .keyboard-section {
    opacity: 0.7;
    transition: opacity 0.3s ease;
  }

  .keyboard-section:hover {
    opacity: 1;
  }

  /* Result Cards */
  .result-card {
    clip-path: polygon(
      0 0,
      calc(100% - 12px) 0,
      100% 12px,
      100% 100%,
      12px 100%,
      0 calc(100% - 12px)
    );
  }

  /* Level Description */
  .level-description {
    clip-path: polygon(
      0 0,
      calc(100% - 12px) 0,
      100% 12px,
      100% 100%,
      12px 100%,
      0 calc(100% - 12px)
    );
  }

  /* Buttons */
  .nav-btn {
    background: var(--surface-container);
    color: var(--on-surface);
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
  }

  .nav-btn:hover:not(:disabled) {
    background: var(--surface-container-high);
  }

  .nav-btn-primary {
    background: var(--primary);
    color: var(--on-primary);
  }

  .nav-btn-primary:hover:not(:disabled) {
    background: var(--primary-container);
  }

  .start-learning-btn {
    background: var(--primary);
    color: var(--on-primary);
  }

  .start-learning-btn:hover {
    background: var(--primary-container);
    transform: translateY(-2px);
  }

  /* Line clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Grid layout */
  .grid {
    display: grid;
  }

  .grid-cols-1 {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  @media (min-width: 640px) {
    .sm\:grid-cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (min-width: 1024px) {
    .lg\:grid-cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .gap-4 {
    gap: 1rem;
  }

  .gap-6 {
    gap: 1.5rem;
  }

  /* Space utility */
  .space-y-6 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(1.5rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(1.5rem * var(--tw-space-y-reverse));
  }

  .space-y-8 > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(2rem * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(2rem * var(--tw-space-y-reverse));
  }

  /* Min height */
  .min-h-\[120px\] {
    min-height: 120px;
  }

  /* Z-index */
  .z-50 {
    z-index: 50;
  }

  /* Fixed positioning */
  .fixed {
    position: fixed;
  }

  .top-0 {
    top: 0;
  }

  .left-0 {
    left: 0;
  }

  .right-0 {
    right: 0;
  }

  .bottom-0 {
    bottom: 0;
  }

  /* Border */
  .border-t {
    border-top-width: 1px;
  }

  /* Padding */
  .pt-16 {
    padding-top: 4rem;
  }

  .pt-3 {
    padding-top: 0.75rem;
  }

  .pt-4 {
    padding-top: 1rem;
  }

  .pt-8 {
    padding-top: 2rem;
  }

  .pb-8 {
    padding-bottom: 2rem;
  }

  .pb-24 {
    padding-bottom: 6rem;
  }

  .px-12 {
    padding-left: 3rem;
    padding-right: 3rem;
  }

  .py-4 {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  /* Text utilities */
  .capitalize {
    text-transform: capitalize;
  }

  /* Cursor */
  .cursor-not-allowed {
    cursor: not-allowed;
  }

  /* Animation */
  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }

  /* Transform */
  .hover\:translate-y-\[-2px\]:hover {
    transform: translateY(-2px);
  }
</style>
