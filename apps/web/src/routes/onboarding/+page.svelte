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
    hasPaid: boolean;
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
    hasPaid: false,
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
  // Step 3: Payment Handling
  // ============================================================================
  let isPaymentProcessing = $state(false);
  function handleMockPayment() {
    isPaymentProcessing = true;
    setTimeout(() => {
      onboardingStore.update(s => ({ ...s, hasPaid: true }));
      isPaymentProcessing = false;
      nextStep();
    }, 1500);
  }

  // ============================================================================
  // Step 4: Placement Test
  // ============================================================================

  let testText = $state('');
  let userInput = $state('');
  let testStarted = $state(false);
  let testEnded = $state(false);
  let elapsedSeconds = $state(0);          // wall-clock (for display only)
  let activeElapsedSeconds = $state(0);    // wall-clock minus pauses
  let isPausedUI = $state(false);
  let testStartTime = $state<number | null>(null);
  let wpmCalculator = $state(new WPMCalculator());
  let accuracyCalculator = $state(new AccuracyCalculator());
  let currentWPM = $state(0);
  let currentAccuracy = $state(100);
  let testInterval: ReturnType<typeof setInterval> | null = null;
  let idleInterval: ReturnType<typeof setInterval> | null = null;
  let pressedKey = $state<string | undefined>(undefined);
  let highlightKeys = $state<Set<string>>(new Set());

  // Minimum correct chars before "Stop & See Results" appears
  const canStopTest = $derived(
    testStarted && !testEnded &&
    userInput.length >= 10
  );

  function initPlacementTest() {
    const lang = getSelectedLanguage();
    testText = lang?.sampleText || 'The quick brown fox jumps over the lazy dog.';
    userInput = '';
    testStarted = false;
    testEnded = false;
    elapsedSeconds = 0;
    activeElapsedSeconds = 0;
    isPausedUI = false;
    testStartTime = null;
    wpmCalculator = new WPMCalculator();
    accuracyCalculator = new AccuracyCalculator();
    currentWPM = 0;
    currentAccuracy = 100;
    pressedKey = undefined;
    highlightKeys = new Set();
    if (testInterval) { clearInterval(testInterval); testInterval = null; }
    if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }
  }

  function startTest() {
    testStarted = true;
    testStartTime = Date.now();

    // Wall-clock tick
    testInterval = setInterval(() => { elapsedSeconds++; }, 1000);

    // Idle / pause detection + metrics refresh every 500ms
    idleInterval = setInterval(() => {
      const now = Date.now();
      wpmCalculator.tick(now);
      isPausedUI = wpmCalculator.isPaused;
      if (testStartTime !== null) {
        const wallMs = now - testStartTime;
        activeElapsedSeconds = Math.round(
          Math.max(0, wallMs - wpmCalculator.totalPausedMs) / 1000
        );
      }
      const r = wpmCalculator.getWPM();
      currentWPM = Math.round(r.netWPM);
      currentAccuracy = Math.round(accuracyCalculator.getAccuracy());
    }, 500);
  }

  function handleKeydown(event: KeyboardEvent) {
    if ($onboardingStore.currentStep !== 4) return;
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

      // (metrics refreshed by idleInterval)

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
    if (testInterval) { clearInterval(testInterval); testInterval = null; }
    if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }
    testEnded = true;
    testStarted = false;
    isPausedUI = false;

    // Capture final active-time metrics
    const r = wpmCalculator.getWPM();
    currentWPM = Math.round(r.netWPM);
    currentAccuracy = Math.round(accuracyCalculator.getAccuracy());
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

    // Auto-advance to results step after a brief pause so the student sees the score
    setTimeout(() => nextStep(), 1600);
  }

  // ============================================================================
  // Step 5: Results & Save
  // ============================================================================

  async function savePreferences() {
    const state = $onboardingStore;

    // Check if user is logged in (Clerk)
    const isLoggedIn = typeof window !== 'undefined' && (window as any).Clerk?.user?.id;

    if (isLoggedIn && state.selectedLanguage && state.selectedLayout) {
      try {
        // Save user state explicitly marking them as onboarded so we don't repeat this
        // Fake onboarding flags since backend user profiles handle progression
        // Save initial evaluation score to DB
        await api.api.v1.sessions.$post({
          json: {
            wpm: state.testResults?.wpm || 0,
            accuracy: state.testResults?.accuracy || 0,
            keystrokes: [],
            duration: activeElapsedSeconds,
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
      const next = Math.min(state.currentStep + 1, 5);
      if (next === 4) {
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
      if (step === 4) {
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
        return state.hasPaid;
      case 4:
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
        return 'Lifetime Access';
      case 4:
        return 'Placement Test';
      case 5:
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
        return 'Unlock unlimited courses, tracking, and certification with a one-time lifetime license.';
      case 4:
        return 'Type the text below to assess your current skill level';
      case 5:
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
    { label: 'Active Time', value: activeElapsedSeconds, unit: 's', variant: 'default' as const },
  ]);
</script>

<svelte:head>
  <title>Onboarding — TypeForge</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} />

<div class="min-h-screen bg-background pb-32">
  <!-- Progress Bar -->
  <div class="fixed top-0 left-0 right-0 z-50">
    <div class="flex h-1">
      {#each [1, 2, 3, 4, 5] as step}
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
        <span class="font-label text-sm text-primary uppercase tracking-widest">Step {$onboardingStore.currentStep} of 5</span>
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
  <main class="px-6 relative z-10">
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

      <!-- Step 3: Payment Lock -->
      {#if $onboardingStore.currentStep === 3}
         <div class="max-w-lg mx-auto bg-surface-container-low p-8 rounded-2xl border border-surface-container shadow-2xl relative overflow-hidden">
           <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-primary to-secondary"></div>
           
           <!-- Pricing tier presentation -->
           <div class="text-center mb-8">
             <div class="inline-flex bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-4">No Subscriptions</div>
             <div class="font-headline text-6xl text-on-surface mb-2">$29.99</div>
             <div class="text-on-surface-variant text-sm">One-time payment for lifetime access</div>
           </div>

           <!-- Fake Mock Payment Inputs -->
           <div class="space-y-4 mb-8">
             <div>
               <label for="card" class="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Card Details</label>
               <div class="flex flex-col gap-2">
                 <input id="card" type="text" placeholder="1234 5678 9101 1121" class="w-full bg-surface-container px-4 py-3 rounded-t border border-b-0 border-outline-variant/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono placeholder:opacity-40" />
                 <div class="flex">
                    <input type="text" placeholder="MM/YY" class="flex-1 bg-surface-container px-4 py-3 rounded-bl border border-r-0 border-outline-variant/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono placeholder:opacity-40" />
                    <input type="text" placeholder="CVC" class="flex-1 bg-surface-container px-4 py-3 rounded-br border border-outline-variant/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-mono placeholder:opacity-40" />
                 </div>
               </div>
             </div>
             
             <div>
               <label for="name" class="block text-xs font-label uppercase tracking-widest text-on-surface-variant mb-1">Name on card</label>
               <input id="name" type="text" placeholder="Jane Doe" class="w-full bg-surface-container px-4 py-3 rounded border border-outline-variant/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
             </div>
           </div>

           <button 
             onclick={handleMockPayment} 
             disabled={isPaymentProcessing || $onboardingStore.hasPaid}
             class="w-full py-4 rounded font-bold uppercase tracking-wider transition-all duration-300 relative overflow-hidden flex items-center justify-center 
              {$onboardingStore.hasPaid ? 'bg-secondary text-background cursor-not-allowed' : (isPaymentProcessing ? 'bg-primary/50 text-background/50 cursor-wait' : 'bg-primary text-background hover:-translate-y-1 hover:shadow-[0_10px_20px_rgba(240,165,0,0.3)]')}"
             >
             {#if isPaymentProcessing}
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Processing...
             {:else if $onboardingStore.hasPaid}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><polyline points="20 6 9 17 4 12"/></svg>
                Payment Successful
             {:else}
                Simulate Payment — $29.99
             {/if}
           </button>
           <p class="text-xs text-center text-on-surface-variant mt-4 opacity-70 italic">Powered by Test. Do not enter real numbers.</p>
         </div>
      {/if}

      <!-- Step 4: Placement Test -->
      {#if $onboardingStore.currentStep === 4}
        <div class="space-y-4">
          <!-- Metrics Bar -->
          <MetricsBar {metrics} />

          <!-- Pause indicator + Stop button -->
          {#if testStarted && !testEnded}
            <div class="flex items-center justify-between px-1" aria-live="polite">
              <div class="flex items-center gap-2 text-xs font-label uppercase tracking-widest
                {isPausedUI ? 'text-amber-400' : 'text-on-surface-variant/50'}">
                {#if isPausedUI}
                  <span class="ob-pause-dot" aria-hidden="true"></span>
                  <span>Clock paused — tap any key to resume</span>
                {:else}
                  <span class="ob-active-dot" aria-hidden="true"></span>
                  <span>Clock running</span>
                {/if}
              </div>
              {#if canStopTest}
                <button
                  id="onboarding-stop-btn"
                  onclick={endTest}
                  class="ob-stop-btn font-label text-xs font-bold uppercase tracking-widest px-4 py-2
                    border border-outline-variant/40 text-on-surface-variant
                    hover:border-primary hover:text-primary transition-all duration-200"
                  aria-label="Stop the placement test and see your results"
                >
                  Stop &amp; See Results
                </button>
              {/if}
            </div>
          {/if}

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
                  Start typing to begin — type as much as you like, then hit "Stop & See Results"
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


      <!-- Step 5: Results -->
      {#if $onboardingStore.currentStep === 5}
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
  {#if $onboardingStore.currentStep < 5 && $onboardingStore.currentStep !== 3}
    <footer
      class="fixed bottom-0 left-0 right-0 bg-surface-container-low border-t border-outline-variant px-6 py-4 z-50"
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
          {#if $onboardingStore.currentStep === 4}
            Continue to Results
          {:else}
            Continue
          {/if}
        </button>
      </div>
    </footer>
  {/if}
</div>

<style>
  /* ─── Onboarding pause indicators ─── */
  .ob-pause-dot, .ob-active-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .ob-pause-dot { background: #f59e0b; animation: ob-pulse-amber 1.4s ease-in-out infinite; }
  .ob-active-dot { background: #4ade80; animation: ob-pulse-green 2s ease-in-out infinite; }
  @keyframes ob-pulse-amber {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:0.5; transform:scale(0.8); }
  }
  @keyframes ob-pulse-green {
    0%,100% { opacity:0.6; transform:scale(1); }
    50% { opacity:1; transform:scale(1.2); }
  }
  .ob-stop-btn {
    clip-path: polygon(0 0,calc(100% - 6px) 0,100% 6px,100% 100%,6px 100%,0 calc(100% - 6px));
    background: transparent;
    cursor: pointer;
  }

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

</style>
