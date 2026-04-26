<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  import { 
    TypingInput, 
    Keyboard, 
    MetricsBar, 
    StatCard, 
    Button, 
    ConfettiCelebration,
    Badge,
    HandGuide,
    LessonIntroModal
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
  import { t } from '$lib/stores/locale';
  import { layouts, getDefaultLayoutForLanguage } from '@typeforge/layouts';
  import type { PageProps } from './$types';

  let { data }: PageProps = $props();


  // Get lesson ID from URL params (typed via page.params)
  const lessonId = $derived(page.params.lessonId);
  const lesson = $derived(getLessonById(lessonId));

  // Derived values needed early
  const lessonText = $derived(lesson?.content.map((c) => c.char).join('') || '');
  let currentIndex = $state(0);
  const lessonChars = $derived(lesson?.content || []);
  const currentChar = $derived(lessonChars[currentIndex]);
  const language = $derived(lesson ? getLanguageByCode(lesson.language) : null);


  // Get authentication context natively during component initialization
  const ctx = useClerkContext();

  // User preferences
  let userLanguage = $state('en');
  let userLayout = $state('qwerty-us');

  // Auto-select the canonical keyboard layout whenever the lesson's language changes.
  // The user can still manually override via the dropdown afterward.
  $effect(() => {
    if (lesson?.language) {
      userLayout = getDefaultLayoutForLanguage(lesson.language);
    }
  });

  // RTL detection from lesson or language
  const isRTL = $derived(lesson?.rtl || language?.rtl || false);

  // Session state
  // let currentIndex = $state(0); // MOVED UP
  let errors = $state<Set<number>>(new Set());
  let isComplete = $state(false);
  let isStarted = $state(false);
  let showCelebration = $state(false);
  let errorFlash = $state(false);
  let sessionSubmitted = $state(false);
  let isLocked = $state(false);

  // Timer state — wall-clock elapsed (display only); active time lives in wpmCalculator
  let startTime = $state<number | null>(null);
  let elapsedSeconds = $state(0);
  let timerInterval: ReturnType<typeof setInterval> | null = null;
  // Pause detection UI state — mirrors wpmCalculator.isPaused reactively
  let isPausedUI = $state(false);
  // Idle watcher interval
  let idleInterval: ReturnType<typeof setInterval> | null = null;
  // Active elapsed seconds (wall-clock minus pauses) for display
  let activeElapsedSeconds = $state(0);

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

  // Check sessionStorage to skip intro for returning users
  let showIntroAnimation = $state(true);
  // Tracks which key is currently highlighted in the intro animation
  let introKeyIndex = $state(0);

  $effect(() => {
    if (lesson) {
      try {
        const seen = sessionStorage.getItem(`tf_intro_seen_${lesson.id}`);
        if (seen) showIntroAnimation = false;
      } catch {}
    }
  });

  const introKeys = $derived.by(() => {
    if (!lesson) return [];
    const map = new Map<string, any>();
    for (const c of lesson.content) {
      if (!map.has(c.char.toLowerCase())) map.set(c.char.toLowerCase(), c);
    }
    return Array.from(map.values());
  });

  function stopIntro() {
    showIntroAnimation = false;
    pressedKey = undefined;
    try { sessionStorage.setItem(`tf_intro_seen_${lesson?.id}`, '1'); } catch {}
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

  // Metrics update is now handled inside the idle-detection effect below

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

  // Wall-clock timer (display only — no hard stop)
  $effect(() => {
    if (isStarted && !isComplete && !showIntroAnimation) {
      timerInterval = setInterval(() => {
        elapsedSeconds++;
      }, 1000);
      return () => { if (timerInterval) clearInterval(timerInterval); };
    }
  });

  // Idle / pause detection — ticks every 500ms, updates isPausedUI and wpmCalculator
  $effect(() => {
    if (isStarted && !isComplete && !showIntroAnimation) {
      idleInterval = setInterval(() => {
        const now = Date.now();
        wpmCalculator.tick(now);
        isPausedUI = wpmCalculator.isPaused;
        // Active elapsed = wall-clock minus total paused time
        if (startTime !== null) {
          const wallMs = now - startTime;
          activeElapsedSeconds = Math.round(
            Math.max(0, wallMs - wpmCalculator.totalPausedMs) / 1000
          );
        }
        // Refresh live WPM too (replaces the separate 500ms interval)
        const wpmResult = wpmCalculator.getWPM();
        currentWPM = Math.round(wpmResult.netWPM);
        currentAccuracy = Math.round(accuracyTracker.getAccuracy());
      }, 500);
      return () => { if (idleInterval) clearInterval(idleInterval); };
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
      return; // Disabled in strict mode since cursor never advances on error
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
      currentIndex++; // Only advance on correct keystroke
    } else {
      previousStreak = currentStreak;
      currentStreak = 0;
      errors.add(currentIndex);
      errors = new Set(errors);
      // Error flash
      errorFlash = true;
      setTimeout(() => { errorFlash = false; }, 160);
      // Announce error for screen readers
      ariaLiveText = `Error: expected ${expectedChar.char}, typed ${typedChar}`;
    }

    // Check if lesson is complete
    if (currentIndex >= lessonChars.length) {
      completeLesson();
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    pressedKey = undefined;
  }

  let testFailed = $state(false);
  // Org membership flag
  let isOrgMember = $state(false);
  // The org-defined cooldown in hours
  let orgRetryPolicy = $state<{ cooldownHours: number } | null>(null);
  // 429 cooldown state — set when the API rejects a placement retry
  let cooldownActive = $state(false);
  let cooldownHoursRemaining = $state(0);

  // ── Reset all session state when lessonId changes (Next Lesson navigation) ──
  // SvelteKit reuses the component when navigating between [lessonId] routes,
  // so we must manually reset everything to get a clean slate.
  let _prevLessonId = $state<string | null>(null);
  $effect(() => {
    if (lessonId && lessonId !== _prevLessonId) {
      _prevLessonId = lessonId;
      currentIndex = 0;
      errors = new Set();
      isComplete = false;
      isStarted = false;
      showCelebration = false;
      sessionSubmitted = false;
      testFailed = false;
      startTime = null;
      elapsedSeconds = 0;
      activeElapsedSeconds = 0;
      isPausedUI = false;
      currentWPM = 0;
      currentAccuracy = 100;
      currentStreak = 0;
      previousStreak = 0;
      maxStreak = 0;
      keystrokes = [];
      finalWPM = 0;
      finalAccuracy = 0;
      finalDuration = 0;
      ariaLiveText = '';
      pressedKey = undefined;
      introKeyIndex = 0;
      showIntroAnimation = true;
      try {
        if (typeof sessionStorage !== 'undefined') {
          const seen = sessionStorage.getItem(`tf_intro_seen_${lessonId}`);
          if (seen) showIntroAnimation = false;
        }
      } catch {}
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }
    }
  });

  // Can the student manually stop the lesson?
  const canStop = $derived(isStarted && !isComplete && keystrokes.filter(k => k.correct).length >= 10);

  function completeLesson() {

    if (isComplete) return;
    
    isComplete = true;
    showCelebration = true;
    
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }

    // Calculate final metrics using active time (pauses excluded)
    const wpmResult = wpmCalculator.getWPM();
    finalWPM = Math.round(wpmResult.netWPM);
    finalAccuracy = Math.round(accuracyTracker.getAccuracy());
    finalDuration = activeElapsedSeconds;

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
    sessionSubmitted = true;

    try {
      const correctKeystrokes = keystrokes.filter((k) => k.correct).length;
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (token) h.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      };
      const api = createApiClient('/', authFetch);

      // If this is a placement test, record the result separately
      if (lesson.isTest) {
        const placementRes = await authFetch('/api/v1/progress/placement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            testId: lesson.id,
            passed: !testFailed,
            accuracy: finalAccuracy,
            wpm: finalWPM,
          }),
        });

        if (placementRes.status === 429) {
          // Org cooldown is active — show a user-friendly error, stop here
          const body = await placementRes.json().catch(() => ({}));
          cooldownHoursRemaining = body.hoursRemaining ?? (orgRetryPolicy?.cooldownHours ?? 24);
          cooldownActive = true;
          sessionSubmitted = false; // allow retry once cooldown lifts
          return;
        }
      }

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
    } catch (error) {
      console.error('Failed to submit session:', error);
    }
  }

  function getNextLessonId(): string | null {
    if (!lesson) return null;
    const catalogIdx = LESSON_CATALOG.findIndex((l) => l.id === lesson.id);
    if (catalogIdx === -1) return null;
    return LESSON_CATALOG[catalogIdx + 1]?.id ?? null;
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
    activeElapsedSeconds = 0;
    isPausedUI = false;
    currentWPM = 0;
    currentAccuracy = 100;
    currentStreak = 0;
    previousStreak = 0;
    keystrokes = [];
    wpmCalculator = new WPMCalculator();
    accuracyTracker = new AccuracyTracker();
    lastAccuracyAnnouncement = 100;
    introKeyIndex = 0;
    showIntroAnimation = true;
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

  onMount(async () => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Fetch placement retry policy (needed to show correct retry messaging)
    try {
      const token = await ctx?.session?.getToken();
      const res = await fetch('/api/v1/progress/placement/policy', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const policy = await res.json();
        isOrgMember = policy.isOrgMember ?? false;
        orgRetryPolicy = { cooldownHours: policy.cooldownHours ?? 0 };
      }
    } catch {
      // Non-critical; default to unlimited retries
    }

    // Enforce locked curriculum logic
    try {
      const token = await ctx?.session?.getToken();
      const progressRes = await fetch('/api/v1/progress/lessons', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (progressRes.ok) {
        const payload = await progressRes.json();
        const completedLessonIds = new Set<string>(payload.completedLessons || []);
        
        let maxTestLevelPassed = 0;
        for (const id of completedLessonIds) {
          const l = getLessonById(id);
          if (l?.isTest && l.difficulty > maxTestLevelPassed) {
            maxTestLevelPassed = l.difficulty;
          }
        }
        const highestUnlockedStage = maxTestLevelPassed + 1;
        
        if (lesson && lesson.difficulty > highestUnlockedStage) {
          isLocked = true;
        }
      }
    } catch (e) {
      console.error('Failed to check locked status', e);
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
    if (timerInterval) clearInterval(timerInterval);
    if (idleInterval) clearInterval(idleInterval);
  });
</script>

<svelte:head>
  <title>{lesson ? `${lesson.title} — TypeForge` : 'Lesson — TypeForge'}</title>
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
  {#if isLocked}
    <div class="mb-6">
      <a 
        href="/learn" 
        class="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2 focus-indicator"
        aria-label={$t('lesson_back')}
      >
        <span aria-hidden="true">←</span>
        <span>{$t('lesson_back')}</span>
      </a>
    </div>
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="bg-surface-container w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-inner">
        <span class="text-5xl drop-shadow-md">🔒</span>
      </div>
      <h1 class="font-headline text-4xl mb-4 text-on-surface">Lesson Locked</h1>
      <p class="text-on-surface-variant max-w-md mx-auto mb-8 font-body">
        You haven't unlocked this curriculum stage yet. Please complete the preceding evaluation tests to advance.
      </p>
      <a href="/learn" class="notched-button bg-primary text-on-primary px-8 py-3 font-label uppercase tracking-widest font-bold hover:shadow-[0_0_15px_rgba(240,165,0,0.5)] transition-shadow">
        Return to Curriculum
      </a>
    </div>
  {:else if lesson}
    <!-- Back Link -->
    <div class="mb-6">
      <a 
        href="/learn" 
        class="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2 focus-indicator"
        aria-label={$t('lesson_back')}
      >
        <span aria-hidden="true">←</span>
        <span>{$t('lesson_back')}</span>
      </a>
    </div>

    <!-- Lesson Header -->
    <div class="mb-8 flex justify-between items-start">
      <div>
        <div class="flex items-center gap-3 mb-2 flex-wrap">
          <h1 class="font-headline text-3xl" id="lesson-title">
            {language?.nativeName || lesson.language}
          </h1>
          <Badge variant="default">{getDifficultyLabel(lesson.difficulty)}</Badge>
          {#if isRTL}
            <span class="rtl-badge" role="note" aria-label="Right-to-left language">RTL</span>
          {/if}
        </div>
        <p class="text-on-surface-variant" id="lesson-description">{lesson.title}</p>
      </div>

      <!-- Keyboard Layout Selector -->
      <div class="flex flex-col gap-1 items-end min-w-[140px]">
        <label for="keyboard-layout" class="text-xs font-label text-on-surface-variant uppercase tracking-widest">{$t('lesson_layout')}</label>
        <select 
          id="keyboard-layout"
          class="w-full bg-surface-container text-on-surface text-sm p-2 outline-none border-b-2 border-primary/50 focus:border-primary focus:ring-0 rounded-t-sm transition-colors cursor-pointer"
          bind:value={userLayout}
        >
          {#each Object.entries(layouts) as [id, layout]}
            <option value={id}>{layout.name}</option>
          {/each}
        </select>
      </div>

    </div>

    <!-- Segmented Progress Bar -->
    <div class="mb-8" role="region" aria-label="Lesson progress">
      <div
        class="segmented-bar"
        role="progressbar"
        aria-valuenow={currentIndex}
        aria-valuemin={0}
        aria-valuemax={lessonChars.length}
        aria-label="Typing progress"
      >
        {#each Array(Math.ceil(lessonChars.length / 10)) as _, i}
          {@const segStart = i * 10}
          {@const segEnd   = Math.min((i + 1) * 10, lessonChars.length)}
          {@const segDone  = Math.min(Math.max(currentIndex - segStart, 0), segEnd - segStart)}
          {@const pct      = Math.round((segDone / (segEnd - segStart)) * 100)}
          <div class="seg-track">
            <div
              class="seg-fill"
              class:complete={pct === 100}
              style="width: {pct}%"
            ></div>
          </div>
        {/each}
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
          class="bg-surface-container-low p-8 max-w-md w-full text-center border-t-4 {cooldownActive ? 'border-warning' : testFailed ? 'border-error' : 'border-primary'} rounded-2xl shadow-2xl relative overflow-hidden"
          role="document"
        >

          {#if cooldownActive}
            <!-- ─── Cooldown card ─── -->
            <div class="absolute inset-0 bg-warning/5 z-0 pointer-events-none"></div>
            <div class="cooldown-icon" aria-hidden="true">⏳</div>
            <h2 id="completion-title" class="font-headline text-2xl mb-2 text-warning relative z-10">{$t('lesson_cooldown_active')}</h2>
            <p id="completion-description" class="text-on-surface-variant text-sm mb-6 relative z-10">
              {@html $t('lesson_cooldown_body', { hours: orgRetryPolicy?.cooldownHours ?? cooldownHoursRemaining })}
            </p>

            <div class="cooldown-pill" role="status" aria-label="Time remaining">
              <span class="cooldown-timer" aria-live="polite">{$t('lesson_cooldown_timer', { hours: cooldownHoursRemaining })}</span>
            </div>

            <p class="text-xs text-on-surface-variant mt-4 mb-8 relative z-10">
              {$t('lesson_cooldown_advice')}
            </p>

            <!-- Results still shown, greyed slightly -->
            <div class="grid grid-cols-3 gap-4 mb-8 relative z-10 opacity-70">
              <div class="bg-surface-container p-4">
                <div class="text-2xl font-bold text-secondary">{finalWPM}</div>
                <div class="text-xs text-on-surface-variant uppercase">WPM</div>
              </div>
              <div class="bg-surface-container p-4">
                <div class="text-2xl font-bold text-primary">{finalAccuracy}%</div>
                <div class="text-xs text-on-surface-variant uppercase">Accuracy</div>
              </div>
              <div class="bg-surface-container p-4">
                <div class="text-2xl font-bold text-on-surface">{formatTime(finalDuration)}</div>
                <div class="text-xs text-on-surface-variant uppercase">Time</div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <a href="/learn" class="btn-secondary">{$t('lesson_back_curriculum')}</a>
              <a href="/practice" class="btn-primary-outline">{$t('lesson_drill_weak')}</a>
            </div>

          {:else if testFailed}
            <div class="absolute inset-0 bg-error/5 z-0 pointer-events-none"></div>
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-error relative z-10">{$t('lesson_test_failed')}</h2>
            <p id="completion-description" class="text-on-surface-variant mb-2 relative z-10">
              {$t('lesson_test_failed_body', { accuracy: finalAccuracy })}
            </p>
            {#if !isOrgMember}
              <p class="text-xs text-primary mb-6 relative z-10">{@html $t('lesson_retry_unlimited')}</p>
            {:else if orgRetryPolicy && orgRetryPolicy.cooldownHours > 0}
              <p class="text-xs text-on-surface-variant mb-6 relative z-10">{@html $t('lesson_retry_cooldown', { hours: orgRetryPolicy.cooldownHours })}</p>
            {:else}
              <p class="text-xs text-primary mb-6 relative z-10">{@html $t('lesson_retry_org_unlimited')}</p>
            {/if}
          {:else if lesson.isTest && lesson.id.includes('-test-5')}
            <div class="absolute inset-0 bg-primary/5 z-0 pointer-events-none"></div>
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-primary relative z-10">{$t('lesson_cert_earned')}</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8 relative z-10 font-bold text-sm">{$t('lesson_cert_body')}</p>
          {:else if lesson.isTest}
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-primary">{$t('lesson_test_passed')}</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8">{$t('lesson_test_passed_body')}</p>
          {:else}
            <h2 id="completion-title" class="font-headline text-3xl mb-2 text-primary">{$t('lesson_complete')}</h2>
            <p id="completion-description" class="text-on-surface-variant mb-8">{$t('lesson_complete_body')}</p>
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
              <Button variant="primary" onclick={goToNextLesson}>{$t('lesson_next')} →</Button>
            {/if}
            <Button variant="secondary" onclick={() => goto('/learn')}>{$t('lesson_back_curriculum')}</Button>
            <Button variant="ghost" onclick={restartLesson}>{$t('lesson_retry')}</Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Typing Area with RTL support -->
    <div 
      class="typing-area-wrapper mb-8 relative"
      class:error-flash={errorFlash}
      dir={isRTL ? 'rtl' : 'ltr'}
      role="region"
      aria-label="Typing area"
    >
      {#if showIntroAnimation && introKeys.length > 0}
        <LessonIntroModal
          lessonId={lesson.id}
          {introKeys}
          {highlightKeys}
          language={language}
          onStart={stopIntro}
        />
      {/if}

      <TypingInput 
        text={lessonText} 
        {currentIndex} 
        {errors}
        {isRTL}
        language={lesson.language}
        class="min-h-[120px] {isRTL ? 'rtl-input' : ''}"
        onWordComplete={handleWordComplete}
      />
      
      <!-- Focus hint -->
      {#if !isStarted && !showIntroAnimation}
        <div 
          class="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm z-10"
          aria-hidden="true"
        >
          <span class="hint-icon" aria-hidden="true">⌨️</span>
          <p class="text-on-surface-variant font-label text-sm mt-2">{$t('lesson_start_hint')}</p>
        </div>
      {/if}
    </div>

    <!-- Live Metrics Bar -->
    <div class="mb-4" role="region" aria-label="Live statistics">
      <MetricsBar
        metrics={[
          { label: 'WPM', value: currentWPM, variant: 'primary' },
          { label: 'Accuracy', value: `${currentAccuracy}%`, variant: 'secondary' },
          { label: 'Streak', value: currentStreak, variant: 'default' },
          { label: 'Active Time', value: formatTime(activeElapsedSeconds), variant: 'default' },
          { label: 'Errors', value: keystrokes.filter((k) => !k.correct).length, variant: 'default' },
          { label: 'Correct', value: keystrokes.filter((k) => k.correct).length, variant: 'default' }
        ]}
        {currentStreak}
        {previousStreak}
      />
    </div>

    <!-- Pause indicator + Stop & Finish row -->
    {#if isStarted && !isComplete}
      <div class="flex items-center justify-between mb-6 px-1" aria-live="polite">
        <!-- Pause status -->
        <div class="flex items-center gap-2 text-xs font-label uppercase tracking-widest
          {isPausedUI ? 'text-tertiary' : 'text-on-surface-variant/50'}">
          {#if isPausedUI}
            <span class="pause-dot" aria-hidden="true"></span>
            <span>Clock paused — tap any key to resume</span>
          {:else if isStarted}
            <span class="active-dot" aria-hidden="true"></span>
            <span>Clock running</span>
          {/if}
        </div>
        <!-- Student-controlled stop -->
        {#if canStop}
          <button
            id="stop-finish-btn"
            onclick={completeLesson}
            class="stop-btn font-label text-xs font-bold uppercase tracking-widest px-4 py-2
              border border-outline-variant/40 text-on-surface-variant
              hover:border-primary hover:text-primary transition-all duration-200"
            aria-label="Stop lesson and see your results"
          >
            Stop &amp; Finish
          </button>
        {/if}
      </div>
    {/if}

    <!-- Keyboard Visualization with RTL support -->
    <div 
      class="bg-surface-container p-4 relative" 
      dir={isRTL ? 'rtl' : 'ltr'}
      role="region"
      aria-label="Keyboard finger placement guide"
    >
      <h3 class="font-label text-sm text-on-surface-variant mb-4 text-center">{$t('lesson_keyboard_guide')}</h3>
      <Keyboard 
        layout={activeKeyboardLayout} 
        {highlightKeys}
        {pressedKey}
        {isRTL}
      />
      
      <!-- Live Finger Guide — always visible during lesson -->
      {#if isStarted && currentChar}
        <div class="live-hand-guide mt-4">
          <HandGuide activeFinger={currentChar.expectedFinger} showLabels={true} />
        </div>
      {/if}

      <!-- Finger colour legend -->
      <div class="finger-guide">
        <div class="finger-item"><span class="finger-indicator finger-pinky" aria-hidden="true"></span><span>{$t('finger_pinky')}</span></div>
        <div class="finger-item"><span class="finger-indicator finger-ring" aria-hidden="true"></span><span>{$t('finger_ring')}</span></div>
        <div class="finger-item"><span class="finger-indicator finger-middle" aria-hidden="true"></span><span>{$t('finger_middle')}</span></div>
        <div class="finger-item"><span class="finger-indicator finger-index" aria-hidden="true"></span><span>{$t('finger_index')}</span></div>
      </div>
    </div>

    <!-- Lesson Info -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-surface-container-low p-6">
        <h3 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-4">{$t('lesson_focus_keys')}</h3>
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
        <h3 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-4">{$t('lesson_details')}</h3>
        <ul class="space-y-2 text-sm text-on-surface-variant">
          <li><span class="text-on-surface">{$t('lesson_hand')}:</span> {lesson.tags.hand}</li>
          <li><span class="text-on-surface">{$t('lesson_focus')}:</span> {lesson.tags.finger}</li>
          <li><span class="text-on-surface">{$t('lesson_speed')}:</span> {lesson.tags.speed}</li>
          <li><span class="text-on-surface">{$t('lesson_characters')}:</span> {lesson.content.length}</li>
        </ul>
      </div>
    </div>
  {:else}
    <!-- Lesson Not Found -->
    <div class="text-center py-20" role="alert">
      <h1 class="font-headline text-3xl mb-4">{$t('error_heading')}</h1>
      <p class="text-on-surface-variant mb-8">{$t('error_subheading')}</p>
      <Button variant="primary" onclick={() => goto('/learn')}>{$t('lesson_back')}</Button>
    </div>
  {/if}
</div>

<style>
  /* ─── Pause indicator dots ─── */
  .pause-dot, .active-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .pause-dot {
    background: #f59e0b;
    animation: pulse-amber 1.4s ease-in-out infinite;
  }
  .active-dot {
    background: #4ade80;
    animation: pulse-green 2s ease-in-out infinite;
  }
  @keyframes pulse-amber {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes pulse-green {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.2); }
  }

  /* ─── Stop & Finish button ─── */
  .stop-btn {
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    cursor: pointer;
    background: transparent;
  }

  /* ─── Cooldown overlay ─── */
  .border-warning { border-color: #f59e0b; }


  .cooldown-icon {
    font-size: 3rem;
    display: block;
    margin: 0 auto 0.75rem;
    animation: hourglass-spin 3s ease-in-out infinite;
  }
  @keyframes hourglass-spin {
    0%,100% { transform: rotate(0deg); }
    45%      { transform: rotate(0deg); }
    55%      { transform: rotate(180deg); }
  }

  .cooldown-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.35);
    border-radius: 100px;
    padding: 0.4rem 1.25rem;
    margin-bottom: 0.25rem;
  }
  .cooldown-timer {
    font-family: 'Space Grotesk', monospace;
    font-size: 1.1rem;
    font-weight: 800;
    color: #f59e0b;
    letter-spacing: 0.05em;
  }

  /* Inline button styles for cooldown card */
  .btn-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', monospace;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.6rem 1.25rem;
    background: var(--surface-container-high, #2a2d35);
    color: var(--on-surface, #e3e2e6);
    border: 1px solid var(--outline-variant, #48464f);
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.15s, border-color 0.15s;
  }
  .btn-secondary:hover { background: var(--surface-container-highest, #36343b); border-color: var(--on-surface-variant, #cac4d0); }

  .btn-primary-outline {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: 'Space Grotesk', monospace;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.6rem 1.25rem;
    background: transparent;
    color: var(--primary, #ffc56c);
    border: 1px solid var(--primary, #ffc56c);
    border-radius: 4px;
    text-decoration: none;
    transition: background 0.15s, box-shadow 0.15s;
  }
  .btn-primary-outline:hover { background: rgba(255,197,108,0.1); box-shadow: 0 0 12px rgba(255,197,108,0.25); }

  /* Typing area wrapper with amber glow on focus-active state */
  .typing-area-wrapper {
    background: var(--surface-container-lowest, #0c0d10);
    padding: 2rem;
    border: 1px solid var(--outline-variant, #48464f);
    border-radius: 4px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .typing-area-wrapper:focus-within {
    border-color: rgba(255, 197, 108, 0.4);
    box-shadow: 0 0 0 1px rgba(255, 197, 108, 0.15), inset 0 0 30px rgba(255, 197, 108, 0.04);
  }

  /* Error flash */
  .error-flash {
    animation: flash-red 0.16s ease-out;
  }
  @keyframes flash-red {
    0%   { border-color: rgba(255, 100, 80, 0.7); box-shadow: 0 0 0 2px rgba(255, 80, 60, 0.3); }
    100% { border-color: var(--outline-variant, #48464f); box-shadow: none; }
  }

  /* Hint icon */
  .hint-icon { font-size: 2rem; }

  /* Segmented progress bar */
  .segmented-bar { display: flex; gap: 3px; height: 6px; }
  .seg-track {
    flex: 1;
    background: var(--surface-container-highest, #36343b);
    border-radius: 3px;
    overflow: hidden;
  }
  .seg-fill {
    height: 100%;
    background: linear-gradient(90deg, #ffc56c, #ffb13e);
    border-radius: 3px;
    transition: width 0.25s ease;
  }
  .seg-fill.complete {
    background: linear-gradient(90deg, #69db7c, #51cf66);
  }

  /* Live hand guide */
  .live-hand-guide {
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
    animation: guide-in 0.3s ease;
  }
  @keyframes guide-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

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
