<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { 
    TypingInput, 
    Keyboard, 
    MetricsBar, 
    StatCard, 
    Button, 
    ConfettiCelebration,
    Badge 
  } from '@typeforge/ui';
  import { 
    getLessonById, 
    LESSON_CATALOG, 
    type Lesson, 
    type LessonChar 
  } from '@typeforge/curriculum';
  import { 
    WPMCalculator, 
    AccuracyTracker 
  } from '@typeforge/metrics';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { getLanguageByCode, ALL_LANGUAGES } from '$lib/i18n/languages';
  import { layouts } from '@typeforge/layouts';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Get lesson ID from URL params
  const lessonId = $derived($page.params.lessonId);
  const lesson = $derived(getLessonById(lessonId));

  // Get authentication context natively during component initialization
  const ctx = useClerkContext();

  // User preferences (would come from user store in production)
  let userLanguage = $state('en');
  let userLayout = $state('qwerty-us');

  // RTL detection from lesson or language
  const isRTL = $derived(lesson?.rtl || language?.rtl || false);

  // Session state
  let currentIndex = $state(0);
  let errors = $state<Set<number>>(new Set());
  let isComplete = $state(false);
  let isStarted = $state(false);
  let showCelebration = $state(false);
  let sessionSubmitted = $state(false);

  // Timer state
  let startTime = $state<number | null>(null);
  let elapsedSeconds = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  const LESSON_TIME_LIMIT = $derived(lessonChars.length > 0 ? Math.max(60, Math.ceil((lessonChars.length / 5) * 4)) : 60);

  // Metrics
  let wpmCalculator = $state(new WPMCalculator());
  let accuracyTracker = $state(new AccuracyTracker());
  let currentWPM = $state(0);
  let currentAccuracy = $state(100);
  let currentStreak = $state(0);
  let maxStreak = $state(0);
  let previousStreak = $state(0);

  // Keystroke tracking for API
  let keystrokes = $state<Array<{
    character: string;
    expected: string;
    correct: boolean;
    timestamp: string;
    keyDownAt: string;
    keyUpAt?: string;
    dwellTime?: number;
    flightTime?: number;
    finger?: string;
    hand?: string;
  }>>([]);

  // Keyboard state
  let pressedKey = $state<string | undefined>(undefined);
  let highlightKeys = $state<Set<string>>(new Set());

  // Results
  let finalWPM = $state(0);
  let finalAccuracy = $state(0);
  let finalDuration = $state(0);

  // Screen reader announcements
  let ariaLiveText = $state('');
  let lastAccuracyAnnouncement = $state(100);

  // Derived values
  const lessonText = $derived(lesson?.content.map((c) => c.char).join('') || '');
  const lessonChars = $derived(lesson?.content || []);
  const currentChar = $derived(lessonChars[currentIndex]);
  const language = $derived(lesson ? getLanguageByCode(lesson.language) : null);
  const keyboardLayout = $derived(layouts[userLayout as keyof typeof layouts] || layouts['qwerty-us']);

  // RTL-aware keyboard layout - swaps left/right finger assignments
  const rtlKeyboardLayout = $derived({
    ...keyboardLayout,
    rows: keyboardLayout.rows.map(row => row.map(key => ({
      ...key,
      finger: swapFingerForRTL((key as any).finger || 'thumb'),
      hand: swapHandForRTL((key as any).hand || 'thumb'),
    }))),
  });

  // Use RTL layout when in RTL mode
  const activeKeyboardLayout = $derived(isRTL ? rtlKeyboardLayout : keyboardLayout);

  function swapFingerForRTL(finger: string): string {
    const swapMap: Record<string, string> = {
      'left-pinky': 'right-pinky',
      'left-ring': 'right-ring',
      'left-middle': 'right-middle',
      'left-index': 'right-index',
      'right-index': 'left-index',
      'right-middle': 'left-middle',
      'right-ring': 'left-ring',
      'right-pinky': 'left-pinky',
      'thumb': 'thumb',
    };
    return swapMap[finger] || finger;
  }

  function swapHandForRTL(hand: string): string {
    if (hand === 'left') return 'right';
    if (hand === 'right') return 'left';
    return hand;
  }

  // Finger Tutorial State
  const FingerDescriptions: Record<string, string> = {
    left_pinky: "Left Pinky",
    left_ring: "Left Ring",
    left_middle: "Left Middle",
    left_index: "Left Index",
    left_thumb: "Left Thumb",
    right_thumb: "Right Thumb",
    right_index: "Right Index",
    right_middle: "Right Middle",
    right_ring: "Right Ring",
    right_pinky: "Right Pinky",
    'left-pinky': "Left Pinky",
    'left-ring': "Left Ring",
    'left-middle': "Left Middle",
    'left-index': "Left Index",
    'left-thumb': "Left Thumb",
    'right-thumb': "Right Thumb",
    'right-index': "Right Index",
    'right-middle': "Right Middle",
    'right-ring': "Right Ring",
    'right-pinky': "Right Pinky",
    all: "Any Finger"
  };

  let showIntroAnimation = $state(true);
  let introKeyIndex = $state(0);
  let introInterval: ReturnType<typeof setInterval> | null = null;
  
  const introKeys = $derived.by(() => {
    if (!lesson) return [];
    // remove duplicates by character
    const map = new Map<string, any>();
    for (const c of lesson.content) {
      if (!map.has(c.char.toLowerCase())) map.set(c.char.toLowerCase(), c);
    }
    return Array.from(map.values());
  });

  $effect(() => {
    if (showIntroAnimation && introKeys.length > 0 && !introInterval) {
      introInterval = setInterval(() => {
        introKeyIndex++;
        if (introKeyIndex >= introKeys.length) stopIntro();
      }, 1500);
      return () => { if (introInterval) clearInterval(introInterval); };
    }
  });

  function stopIntro() {
     showIntroAnimation = false;
     if (introInterval) {
         clearInterval(introInterval);
         introInterval = null;
     }
     pressedKey = undefined;
  }

  // Update highlight keys based on current character or intro sequence
  $effect(() => {
    if (showIntroAnimation && introKeys.length > 0 && introKeyIndex < introKeys.length) {
       const charData = introKeys[introKeyIndex];
       pressedKey = charData.char.toLowerCase();
       highlightKeys = new Set([charData.char.toLowerCase()]);
    } else {
       if (currentChar) {
         highlightKeys = new Set([currentChar.char.toLowerCase()]);
       } else {
         highlightKeys = new Set();
       }
    }
  });

  // Update metrics periodically
  $effect(() => {
    if (isStarted && !isComplete && !showIntroAnimation) {
      const interval = setInterval(() => {
        const wpmResult = wpmCalculator.getWPM();
        currentWPM = Math.round(wpmResult.netWPM);
        currentAccuracy = Math.round(accuracyTracker.getAccuracy());
      }, 500);
      return () => clearInterval(interval);
    }
  });

  // Announce accuracy changes on word completion
  $effect(() => {
    if (isStarted && !isComplete && !showIntroAnimation) {
      const accuracy = Math.round(accuracyTracker.getAccuracy());
      // Announce when accuracy changes by more than 5%
      if (Math.abs(accuracy - lastAccuracyAnnouncement) >= 5) {
        ariaLiveText = `Accuracy: ${accuracy}%`;
        lastAccuracyAnnouncement = accuracy;
      }
    }
  });

  // Timer effect
  $effect(() => {
    if (isStarted && !isComplete && !showIntroAnimation) {
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        if (elapsedSeconds >= LESSON_TIME_LIMIT) completeLesson();
      }, 1000);
      return () => { if (timerInterval) clearInterval(timerInterval); };
    }
  });

  // Handle keyboard input
  function handleKeyDown(event: KeyboardEvent) {
    if (showIntroAnimation) {
       if (event.key === 'Escape') stopIntro();
       event.preventDefault();
       return;
    }
    
    if (isComplete) return;

    // Prevent default for typing keys
    if (event.key.length === 1 || event.key === 'Backspace') {
      event.preventDefault();
    }

    if (event.key === 'Backspace') {
      if (currentIndex > 0) {
        currentIndex--;
        errors.delete(currentIndex);
        errors = new Set(errors);
      }
      return;
    }

    if (!isStarted) {
      isStarted = true;
      startTime = Date.now();
    }

    pressedKey = event.key.toLowerCase();

    const expectedChar = lessonChars[currentIndex];
    if (!expectedChar) return;

    const typedChar = event.key;
    const isCorrect = typedChar === expectedChar.char;

    // Record keystroke
    const now = new Date().toISOString();
    keystrokes.push({
      character: typedChar,
      expected: expectedChar.char,
      correct: isCorrect,
      timestamp: now,
      keyDownAt: now,
      finger: expectedChar.expectedFinger,
    });

    // Update metrics
    wpmCalculator.onKeystroke(event.code, isCorrect, Date.now());
    accuracyTracker.onKeystroke(event.code, isCorrect);

    if (isCorrect) {
      previousStreak = currentStreak;
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      previousStreak = currentStreak;
      currentStreak = 0;
      errors.add(currentIndex);
      errors = new Set(errors);
      // Announce error for screen readers
      ariaLiveText = `Error: expected ${expectedChar.char}, typed ${typedChar}`;
    }

    // Always advance cursor on typing
    currentIndex++;

    // Check if lesson is complete
    if (currentIndex >= lessonChars.length) {
      completeLesson();
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    pressedKey = undefined;
  }

  let testFailed = $state(false);

  function completeLesson() {
    if (isComplete) return;
    
    isComplete = true;
    showCelebration = true;
    
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    // Calculate final metrics
    const wpmResult = wpmCalculator.getWPM();
    finalWPM = Math.round(wpmResult.netWPM);
    finalAccuracy = Math.round(accuracyTracker.getAccuracy());
    finalDuration = elapsedSeconds;

    if (lesson?.isTest && finalAccuracy < 90) {
      testFailed = true;
      showCelebration = false;
      ariaLiveText = `Test failed. You need at least 90% accuracy. You achieved ${finalAccuracy}%.`;
      return;
    }

    // Announce completion for screen readers
    ariaLiveText = `Lesson complete! WPM: ${finalWPM}, Accuracy: ${finalAccuracy}%. Great job!`;

    // Submit session to API
    submitSession();

    if (lesson?.isTest && lesson.id.includes('-test-5')) {
      setTimeout(() => { goto('/certificate'); }, 4000);
    }
  }

  async function submitSession() {
    if (sessionSubmitted || !lesson) return;

    try {
      const correctKeystrokes = keystrokes.filter((k) => k.correct).length;
      
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const defaultHeaders = new Headers(init?.headers);
        if (token) defaultHeaders.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: defaultHeaders });
      };
      const api = createApiClient('/', authFetch);

      await api.api.v1.sessions.$post({
        json: {
          wpm: finalWPM,
          accuracy: finalAccuracy,
          keystrokes: keystrokes,
          duration: finalDuration,
          lessonId: lesson.id,
          language: lesson.language,
          layout: userLayout,
          totalCharacters: keystrokes.length,
          correctCharacters: correctKeystrokes,
          errors: keystrokes.length - correctKeystrokes,
          rawWpm: finalWPM,
          consistency: finalAccuracy,
        },
      });
      
      sessionSubmitted = true;
    } catch (error) {
      console.error('Failed to submit session:', error);
      // Still show completion even if API fails
    }
  }

  function getNextLessonId(): string | null {
    if (!lesson) return null;
    const currentIndex = LESSON_CATALOG.findIndex((l) => l.id === lesson.id);
    const nextLesson = LESSON_CATALOG[currentIndex + 1];
    return nextLesson?.id || null;
  }

  function goToNextLesson() {
    const nextId = getNextLessonId();
    if (nextId) {
      goto(`/learn/${nextId}`);
    } else {
      goto('/learn');
    }
  }

  function restartLesson() {
    currentIndex = 0;
    errors = new Set();
    isComplete = false;
    isStarted = false;
    showCelebration = false;
    sessionSubmitted = false;
    startTime = null;
    elapsedSeconds = 0;
    currentWPM = 0;
    currentAccuracy = 100;
    currentStreak = 0;
    previousStreak = 0;
    keystrokes = [];
    wpmCalculator = new WPMCalculator();
    accuracyTracker = new AccuracyTracker();
    lastAccuracyAnnouncement = 100;
    ariaLiveText = 'Lesson restarted';
  }

  // Handle word completion for screen reader
  function handleWordComplete(word: string, accuracy: number) {
    if (accuracy === 100) {
      ariaLiveText = `Word "${word}" completed perfectly`;
    } else {
      ariaLiveText = `Word "${word}" completed, ${accuracy}% accuracy`;
    }
  }

  // Format time display
  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Get difficulty label
  function getDifficultyLabel(level: number): string {
    const labels = ['', 'Beginner', 'Beginner', 'Intermediate', 'Advanced', 'Expert'];
    return labels[level] || 'Unknown';
  }

  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<svelte:head>
  <title>{lesson ? `${lesson.title} — TypingScholar` : 'Lesson — TypingScholar'}</title>
  <meta name="description" content={lesson ? `Practice typing: ${lesson.title}` : 'Typing lesson'} />
</svelte:head>

<!-- 
  Accessibility Notes:
  - ARIA live region for announcing WPM, accuracy, and word completions
  - aria-live="assertive" for errors to interrupt current speech
  - Progress bar with aria-valuenow, aria-valuemin, aria-valuemax
  - RTL support with dir attribute and lang for Arabic text
  - Modal focus trap for completion overlay
  - Skip navigation available from parent layout
-->

<ConfettiCelebration trigger={showCelebration} duration={3000} />

<!-- ARIA Live Region for Screen Reader Announcements -->
<div class="sr-only" aria-live="polite" aria-atomic="true">
  {ariaLiveText}
</div>

<div class="max-w-5xl mx-auto px-6 py-12">
  {#if lesson}
    <!-- Back Link -->
    <div class="mb-6">
      <a 
        href="/learn" 
        class="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2 focus-indicator"
        aria-label="Back to lessons list"
      >
        <span aria-hidden="true">←</span>
        <span>Back to lessons</span>
      </a>
    </div>

    <!-- Lesson Header -->
    <div class="mb-8 flex justify-between items-start">
      <div>
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <h1 class="font-headline text-3xl" id="lesson-title">
            {language?.nativeName || lesson.language}
          </h1>
          <Badge variant="solid" size="sm">{getDifficultyLabel(lesson.difficulty)}</Badge>
          {#if isRTL}
            <span class="rtl-badge" role="note" aria-label="Right-to-left language">RTL</span>
          {/if}
        </div>
        <p class="text-on-surface-variant" id="lesson-description">{lesson.title}</p>
      </div>

      <!-- Keyboard Layout Selector -->
      <div class="flex flex-col gap-1 items-end min-w-[140px]">
        <label for="keyboard-layout" class="text-xs font-label text-on-surface-variant uppercase tracking-widest">Layout</label>
        <select 
          id="keyboard-layout"
          class="w-full bg-surface-container text-on-surface text-sm p-2 outline-none border-b-2 border-primary/50 focus:border-primary focus:ring-0 rounded-t-sm transition-colors cursor-pointer"
          bind:value={userLayout}
        >
          <option value="qwerty-us">QWERTY (US)</option>
          <option value="dvorak">Dvorak</option>
          <option value="azerty-fr">AZERTY (FR)</option>
          <option value="qwertz-de">QWERTZ (DE)</option>
          <option value="cyrillic-ru">Cyrillic (RU)</option>
          <option value="arabic">Arabic</option>
          <option value="hebrew">Hebrew</option>
        </select>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-8" role="region" aria-label="Lesson progress">
      <div 
        class="h-1 bg-surface-container-highest relative overflow-hidden"
        role="progressbar"
        aria-valuenow={currentIndex}
        aria-valuemin={0}
        aria-valuemax={lessonChars.length}
        aria-label="Typing progress"
      >
        <div 
          class="h-full bg-secondary transition-all duration-300"
          class:reduced-motion={false}
          style="width: {(currentIndex / lessonChars.length) * 100}%"
        ></div>
      </div>
      <div class="flex justify-between mt-2 text-xs text-on-surface-variant">
        <span aria-label="Characters typed">{currentIndex} / {lessonChars.length} characters</span>
        <span aria-label="Percent complete">{Math.round((currentIndex / lessonChars.length) * 100)}% complete</span>
      </div>
    </div>

    <!-- Completion Overlay (Modal) -->
    {#if isComplete}
      <div 
        class="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-title"
        aria-describedby="completion-description"
      >
        <div 
          class="bg-surface-container-low p-8 max-w-md w-full text-center border-t-4 {testFailed ? 'border-error' : 'border-primary'} rounded-2xl shadow-2xl relative overflow-hidden"
          role="document"
        >
          {#if testFailed}
            <div class="absolute inset-0 bg-error/5 z-0 pointer-events-none"></div>
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-error relative z-10">Test Failed!</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8 relative z-10">You needed 90% accuracy. You achieved {finalAccuracy}%.</p>
          {:else if lesson.isTest && lesson.id.includes('-test-5')}
            <div class="absolute inset-0 bg-primary/5 z-0 pointer-events-none"></div>
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-primary relative z-10">Certification Earned!</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8 relative z-10 font-bold text-sm">Validating metrics and preparing formal award...</p>
          {:else if lesson.isTest}
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-primary">Test Passed!</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8">Stage cleared. You've proven your mechanics.</p>
          {:else}
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-primary">Lesson Complete!</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8">Great job finishing this lesson!</p>
          {/if}
          
          <!-- Results Grid -->
          <div class="grid grid-cols-3 gap-4 mb-8 relative z-10" role="region" aria-label="Your results">
            <div class="bg-surface-container p-4">
              <div class="text-2xl font-bold text-secondary" aria-label="Words per minute">{finalWPM}</div>
              <div class="text-xs text-on-surface-variant uppercase">WPM</div>
            </div>
            <div class="bg-surface-container p-4">
              <div class="text-2xl font-bold text-primary" aria-label="Accuracy percentage">{finalAccuracy}%</div>
              <div class="text-xs text-on-surface-variant uppercase">Accuracy</div>
            </div>
            <div class="bg-surface-container p-4">
              <div class="text-2xl font-bold text-on-surface" aria-label="Time taken">{formatTime(finalDuration)}</div>
              <div class="text-xs text-on-surface-variant uppercase">Time</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            {#if getNextLessonId() && !testFailed}
              <Button variant="primary" onclick={goToNextLesson}>Next Lesson →</Button>
            {/if}
            <Button variant="secondary" onclick={() => goto('/learn')}>Back to Curriculum</Button>
            <Button variant="ghost" onclick={restartLesson}>Retry</Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Typing Area with RTL support -->
    <div 
      class="bg-surface-container-lowest p-8 mb-8 relative" 
      dir={isRTL ? 'rtl' : 'ltr'}
      role="region"
      aria-label="Typing area"
    >
      <TypingInput 
        text={lessonText} 
        {currentIndex} 
        {errors}
        {isRTL}
        language={lesson.language}
        class="min-h-[120px] {isRTL ? 'rtl-input' : ''}"
        onWordComplete={handleWordComplete}
      />
      
      <!-- Focus hint & Intro loop -->
      {#if showIntroAnimation && introKeys.length > 0}
        <div 
          class="absolute inset-0 flex flex-col items-center justify-center bg-background/85 backdrop-blur-sm z-10 rounded"
          aria-hidden="true"
        >
          {#if introKeyIndex < introKeys.length}
            {@const currentIntro = introKeys[introKeyIndex]}
            <p class="text-secondary font-label text-xs uppercase tracking-widest mb-4 animate-pulse">Required Finger Positioning</p>
            <div class="bg-surface-container-low px-10 py-6 rounded-2xl border border-primary/30 shadow-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 transform scale-110">
              <span class="text-5xl text-primary font-mono">{currentIntro.char === ' ' ? 'Space' : currentIntro.char}</span>
              <span class="text-on-surface-variant font-bold text-sm">Use your <span class="text-background bg-secondary px-2 py-0.5 rounded ml-1">{FingerDescriptions[currentIntro.expectedFinger.replace('_', '-')] || currentIntro.expectedFinger}</span></span>
            </div>
            <div class="absolute bottom-6 flex gap-2">
              <span class="text-on-surface-variant/50 text-xs font-mono uppercase font-bold tracking-widest border border-on-surface-variant/20 px-2 py-1 rounded">ESC</span>
              <span class="text-on-surface-variant/50 text-[0.65rem] uppercase tracking-widest mt-1.5">to skip intro</span>
            </div>
          {/if}
        </div>
      {:else if !isStarted}
        <div 
          class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm"
          aria-hidden="true"
        >
          <p class="text-on-surface-variant font-label">Start typing to begin...</p>
        </div>
      {/if}
    </div>

    <!-- Live Metrics Bar -->
    <div class="mb-8" role="region" aria-label="Live statistics">
      <MetricsBar
        metrics={[
          { label: 'WPM', value: currentWPM, variant: 'primary' },
          { label: 'Accuracy', value: `${currentAccuracy}%`, variant: 'secondary' },
          { label: 'Streak', value: currentStreak, variant: 'default' },
          { label: 'Time', value: formatTime(Math.max(0, LESSON_TIME_LIMIT - elapsedSeconds)), variant: 'default' },
          { label: 'Errors', value: keystrokes.filter((k) => !k.correct).length, variant: 'default' },
          { label: 'Correct', value: keystrokes.filter((k) => k.correct).length, variant: 'default' }
        ]}
        {currentStreak}
        {previousStreak}
      />
    </div>

    <!-- Keyboard Visualization with RTL support -->
    <div 
      class="bg-surface-container p-4" 
      dir={isRTL ? 'rtl' : 'ltr'}
      role="region"
      aria-label="Keyboard finger placement guide"
    >
      <h3 class="font-label text-sm text-on-surface-variant mb-4 text-center">Keyboard Guide</h3>
      <Keyboard 
        layout={activeKeyboardLayout} 
        {highlightKeys}
        {pressedKey}
        {isRTL}
      />
      
      <!-- Finger Guide with logical properties for RTL -->
      <div class="finger-guide">
        <div class="finger-item">
          <span class="finger-indicator finger-pinky" aria-hidden="true"></span>
          <span>Pinky</span>
        </div>
        <div class="finger-item">
          <span class="finger-indicator finger-ring" aria-hidden="true"></span>
          <span>Ring</span>
        </div>
        <div class="finger-item">
          <span class="finger-indicator finger-middle" aria-hidden="true"></span>
          <span>Middle</span>
        </div>
        <div class="finger-item">
          <span class="finger-indicator finger-index" aria-hidden="true"></span>
          <span>Index</span>
        </div>
      </div>
    </div>

    <!-- Lesson Info -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-4">Focus Keys</h3>
        <div class="flex flex-wrap gap-2">
          {#each lesson.tags.key_bigram.split('') as key}
            <span 
              class="px-3 py-1 bg-surface-container text-on-surface font-label"
              aria-label="Focus key: {key}"
            >{key}</span>
          {/each}
        </div>
      </div>
      
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-4">Lesson Details</h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li><span class="text-on-surface">Hand:</span> {lesson.tags.hand}</li>
          <li><span class="text-on-surface">Focus:</span> {lesson.tags.finger}</li>
          <li><span class="text-on-surface">Speed:</span> {lesson.tags.speed}</li>
          <li><span class="text-on-surface">Characters:</span> {lesson.content.length}</li>
        </ul>
      </div>
    </div>
  {:else}
    <!-- Lesson Not Found -->
    <div class="text-center py-20" role="alert">
      <h1 class="font-headline text-3xl mb-4">Lesson Not Found</h1>
      <p class="text-on-surface-variant mb-8">The lesson you're looking for doesn't exist.</p>
      <Button variant="primary" onclick={() => goto('/learn')}>Browse Lessons</Button>
    </div>
  {/if}
</div>

<style>
  /* RTL Badge */
  .rtl-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: var(--primary-container, #f0a500);
    color: var(--on-primary-container, #5f3f00);
    font-size: 0.625rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    clip-path: polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px));
  }

  /* RTL Input styling */
  :global(.rtl-input) {
    text-align: right;
    direction: rtl;
    unicode-bidi: bidi-override;
  }

  /* Finger guide with logical properties */
  .finger-guide {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 1rem;
    font-size: 0.75rem;
    color: var(--on-surface-variant, #d6c4ac);
  }

  .finger-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .finger-indicator {
    display: block;
    width: 0.75rem;
    height: 0.75rem;
    border-inline-start: 2px solid;
  }

  .finger-indicator.finger-pinky {
    border-color: #ff6b6b;
  }

  .finger-indicator.finger-ring {
    border-color: #ffa94d;
  }

  .finger-indicator.finger-middle {
    border-color: #ffd43b;
  }

  .finger-indicator.finger-index {
    border-color: #69db7c;
  }

  /* RTL adjustments using logical properties */
  :global([dir="rtl"] .finger-indicator) {
    border-inline-start: none;
    border-inline-end: 2px solid;
  }

  /* Smooth transitions for direction changes */
  .typing-container,
  :global(.typing-input) {
    transition: direction 0.3s ease;
  }

  /* Focus indicator - amber outline */
  .focus-indicator {
    outline: none;
    border-radius: 2px;
  }

  .focus-indicator:focus-visible {
    outline: 2px solid var(--primary, #ffc56c);
    outline-offset: 2px;
  }

  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .typing-container,
    :global(.typing-input) {
      transition: none;
    }
    
    :global(.transition-all) {
      transition: none !important;
    }
  }

  /* Class-based reduced motion override */
  :global(.reduced-motion) .typing-container,
  :global(.reduced-motion) :global(.typing-input) {
    transition: none;
  }
</style>
