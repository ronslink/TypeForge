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
    ConfettiCelebration 
  } from '@typeforge/ui';
  import SideNavBar from '$lib/components/SideNavBar.svelte';
  import { 
    getRandomWords, 
    type LessonChar, 
    type Finger 
  } from '@typeforge/curriculum';
  import { 
    WPMCalculator, 
    AccuracyTracker 
  } from '@typeforge/metrics';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { layouts, getDefaultLayoutForLanguage } from '@typeforge/layouts';
  import type { PageProps } from './$types';
  import { FAMOUS_BOOKS } from './books';
  import { getSupportedLanguages } from '@typeforge/curriculum';
  import { ALL_LANGUAGES } from '$lib/i18n/languages';
  import { t } from '$lib/stores/locale';

  let { data }: PageProps = $props();


  const ctx = useClerkContext();
  let userLanguage = $state('en');
  let userLayout = $state('qwerty-us');

  // Load backend localization metrics
  let availableLanguages = getSupportedLanguages();

  // Practice Modes State
  let mode = $state<'select' | 'words' | 'sentences' | 'book' | 'adaptive'>('select');
  let isGeneratingAI = $state(false);
  
  onMount(() => {
    const urlMode = $page.url.searchParams.get('mode');
    const weakKeys = $page.url.searchParams.get('weakKeys')?.split(',') || [];
    if (urlMode === 'adaptive' && weakKeys.length > 0) {
      mountAdaptivePractice(weakKeys);
    }
  });
  
  let currentBooks = $derived(FAMOUS_BOOKS[userLanguage] || FAMOUS_BOOKS['en'] || []);
  let selectedBookId = $state('');
  // Keep selection synchronized when language changes
  $effect(() => {
    if (currentBooks.length > 0 && !currentBooks.find(b => b.id === selectedBookId)) {
       selectedBookId = currentBooks[0].id;
    }
  });


  // Typing Session State
  let lessonChars = $state<LessonChar[]>([]);
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
  let activeElapsedSeconds = $state(0);
  let isPausedUI = $state(false);
  let idleInterval: ReturnType<typeof setInterval> | null = null;

  // Metrics
  let wpmCalculator = $state(new WPMCalculator());
  let accuracyTracker = $state(new AccuracyTracker());
  let currentWPM = $state(0);
  let currentAccuracy = $state(100);
  let currentStreak = $state(0);
  let maxStreak = $state(0);
  let previousStreak = $state(0);

  let keystrokes = $state<any[]>([]);
  let pressedKey = $state<string | undefined>(undefined);
  let highlightKeys = $state<Set<string>>(new Set());

  // Results
  let finalWPM = $state(0);
  let finalAccuracy = $state(0);
  let finalDuration = $state(0);

  const lessonText = $derived(lessonChars.map(c => c.char).join(''));
  const currentChar = $derived(lessonChars[currentIndex]);
  const activeKeyboardLayout = $derived(layouts[userLayout as keyof typeof layouts] || layouts['qwerty-us']);

  // Can the student stop early?
  const canStop = $derived(isStarted && !isComplete && keystrokes.filter(k => k.correct).length >= 10);

  // Auto-select the canonical layout when the practice language changes.
  $effect(() => {
    userLayout = getDefaultLayoutForLanguage(userLanguage);
  });


  $effect(() => {
    if (currentChar) {
      highlightKeys = new Set([currentChar.char.toLowerCase()]);
    } else {
      highlightKeys = new Set();
    }
  });

  // Wall-clock timer (display only)
  $effect(() => {
    if (isStarted && !isComplete) {
      timerInterval = setInterval(() => { elapsedSeconds++; }, 1000);
      return () => { if (timerInterval) clearInterval(timerInterval); };
    }
  });

  // Idle / pause detection — ticks every 500ms
  $effect(() => {
    if (isStarted && !isComplete) {
      idleInterval = setInterval(() => {
        const now = Date.now();
        wpmCalculator.tick(now);
        isPausedUI = wpmCalculator.isPaused;
        if (startTime !== null) {
          const wallMs = now - startTime;
          activeElapsedSeconds = Math.round(
            Math.max(0, wallMs - wpmCalculator.totalPausedMs) / 1000
          );
        }
        const wpmResult = wpmCalculator.getWPM();
        currentWPM = Math.round(wpmResult.netWPM);
        currentAccuracy = Math.round(accuracyTracker.getAccuracy());
      }, 500);
      return () => { if (idleInterval) clearInterval(idleInterval); };
    }
  });

  // Maps Latin characters to their QWERTY finger assignment.
  // Mirrors DYNAMIC_FINGER_MAP in @typeforge/curriculum for consistency.
  const PRACTICE_FINGER_MAP: Record<string, { code: string; finger: Finger }> = {
    'a': { code: 'KeyA', finger: 'left_pinky' }, 'b': { code: 'KeyB', finger: 'left_index' },
    'c': { code: 'KeyC', finger: 'left_middle' }, 'd': { code: 'KeyD', finger: 'left_middle' },
    'e': { code: 'KeyE', finger: 'left_middle' }, 'f': { code: 'KeyF', finger: 'left_index' },
    'g': { code: 'KeyG', finger: 'left_index' }, 'h': { code: 'KeyH', finger: 'right_index' },
    'i': { code: 'KeyI', finger: 'right_middle' }, 'j': { code: 'KeyJ', finger: 'right_index' },
    'k': { code: 'KeyK', finger: 'right_middle' }, 'l': { code: 'KeyL', finger: 'right_ring' },
    'm': { code: 'KeyM', finger: 'right_index' }, 'n': { code: 'KeyN', finger: 'right_index' },
    'o': { code: 'KeyO', finger: 'right_ring' }, 'p': { code: 'KeyP', finger: 'right_pinky' },
    'q': { code: 'KeyQ', finger: 'left_pinky' }, 'r': { code: 'KeyR', finger: 'left_index' },
    's': { code: 'KeyS', finger: 'left_ring' }, 't': { code: 'KeyT', finger: 'left_index' },
    'u': { code: 'KeyU', finger: 'right_index' }, 'v': { code: 'KeyV', finger: 'left_index' },
    'w': { code: 'KeyW', finger: 'left_ring' }, 'x': { code: 'KeyX', finger: 'left_ring' },
    'y': { code: 'KeyY', finger: 'right_index' }, 'z': { code: 'KeyZ', finger: 'left_pinky' },
    ',': { code: 'Comma', finger: 'right_middle' }, '.': { code: 'Period', finger: 'right_ring' },
    "'": { code: 'Quote', finger: 'right_pinky' }, '-': { code: 'Minus', finger: 'right_pinky' },
    ' ': { code: 'Space', finger: 'left_thumb' },
  };

  function generateLessonSequence(text: string): LessonChar[] {
    return text.split('').map(char => {
      const lower = char.toLowerCase();
      const mapped = PRACTICE_FINGER_MAP[lower];
      if (mapped) return { char, code: mapped.code, expectedFinger: mapped.finger };
      // Non-Latin/unknown: use left_thumb as neutral fallback
      return { char, code: 'Unknown', expectedFinger: 'left_thumb' };
    });
  }


  function mountPracticeMode(selectedMode: 'words' | 'sentences' | 'book') {
    mode = selectedMode;
    if (selectedMode === 'words') {
      const words = getRandomWords(userLanguage, 50);
      lessonChars = generateLessonSequence(words.join(' '));
    } else if (selectedMode === 'sentences') {
        const words = getRandomWords(userLanguage, 50);
        let text = '';
        for (let i = 0; i < words.length; i++) {
        let w = words[i];
        if (i % 8 === 0) w = w.charAt(0).toUpperCase() + w.slice(1);
        text += w + (i % 8 === 7 || i === words.length - 1 ? '.' : '') + ' ';
        }
        text = text.trim();
        lessonChars = generateLessonSequence(text);
    } else if (selectedMode === 'book') {
        const book = currentBooks.find(b => b.id === selectedBookId) || currentBooks[0];
        if (book) lessonChars = generateLessonSequence(book.excerpt);
    }
    
    // Reset state
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
    keystrokes = [];
    wpmCalculator = new WPMCalculator();
    accuracyTracker = new AccuracyTracker();
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }
  }

  async function mountAdaptivePractice(weakKeys: string[]) {
    mode = 'adaptive';
    isGeneratingAI = true;
    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const defaultHeaders = new Headers(init?.headers);
        if (token) defaultHeaders.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: defaultHeaders });
      };
      
      const api = createApiClient('/', authFetch);
      const res = await api.api.v1.lessons.adaptive.$post({
        json: { weakKeys, language: userLanguage }
      });

      if (!res.ok) {
        if (res.status === 403) {
          alert('Premium subscription required for AI Adaptive Drills');
          goto('/pricing');
          return;
        }
        throw new Error('Failed to generate lesson');
      }

      const data = await res.json();
      const lesson = data.lesson;
      const chars: LessonChar[] = [];
      for (const ex of lesson.exercises) {
        if (ex.type === 'words' || ex.type === 'sentences' || ex.type === 'paragraphs') {
          const text = Array.isArray(ex.content) ? ex.content.join(' ') : String(ex.content);
          chars.push(...generateLessonSequence(text));
          chars.push(generateLessonSequence(' ')[0]!); // Space between exercises
        }
      }
      // Remove trailing space
      if (chars.length > 0) chars.pop();
      
      lessonChars = chars;
      
      // Reset state
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
      keystrokes = [];
      wpmCalculator = new WPMCalculator();
      accuracyTracker = new AccuracyTracker();
      if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
      if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }
    } catch (e) {
      console.error(e);
      mode = 'select';
    } finally {
      isGeneratingAI = false;
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (mode === 'select') return;
    if (isComplete) return;

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
    const now = new Date().toISOString();

    keystrokes.push({
      character: typedChar,
      expected: expectedChar.char,
      correct: isCorrect,
      timestamp: now,
      keyDownAt: now,
      finger: expectedChar.expectedFinger,
    });

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
    }

    if (currentIndex >= lessonChars.length) completePractice();
  }

  function handleKeyUp(event: KeyboardEvent) {
    pressedKey = undefined;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function completePractice() {
    if (isComplete) return;
    isComplete = true;
    showCelebration = true;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (idleInterval) { clearInterval(idleInterval); idleInterval = null; }
    const wpmResult = wpmCalculator.getWPM();
    finalWPM = Math.round(wpmResult.netWPM);
    finalAccuracy = Math.round(accuracyTracker.getAccuracy());
    finalDuration = activeElapsedSeconds;
    submitSession();
  }

  async function submitSession() {
    if (sessionSubmitted) return;
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
          lessonId: undefined, // Freeform practice doesn't map to a set lesson graph
          language: userLanguage,
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
      console.error('Failed to submit practice session:', error);
    }
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
  <title>Practice — TypeForge</title>
</svelte:head>

<ConfettiCelebration trigger={showCelebration} duration={3000} />

<div class="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] w-full relative">
  <SideNavBar title={$t('nav_practice') || 'Practice Mode'}>
    <div class="flex flex-col gap-1.5 w-full">
      <label for="practice-language" class="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest">{$t('lang_ui_label') || 'Language'}</label>
      <select id="practice-language" class="bg-surface-container/50 px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container border border-transparent shadow-inner cursor-pointer transition-colors w-full" bind:value={userLanguage}>
        {#each ALL_LANGUAGES as lang}
          <option value={lang.code}>{lang.nativeName} ({lang.englishName})</option>
        {/each}
      </select>
    </div>
    
    <div class="flex flex-col gap-1.5 w-full">
      <label for="practice-layout" class="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest">{$t('practice_layout') || 'Keyboard Layout'}</label>
      <select id="practice-layout" class="bg-surface-container/50 px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container border border-transparent shadow-inner cursor-pointer transition-colors w-full" bind:value={userLayout}>
        {#each Object.entries(layouts) as [id, layout]}
          <option value={id}>{layout.name}</option>
        {/each}
      </select>
    </div>
  </SideNavBar>

  <!-- Main Content Area -->
  <div class="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 lg:py-12">
  
  {#if mode === 'select'}
    <h1 class="font-headline text-4xl mb-4 text-primary">{$t('practice_sandbox_title') || 'Practice Sandbox'}</h1>
    <p class="text-on-surface-variant mb-12 max-w-2xl text-sm">{$t('practice_sandbox_desc') || 'Freeform typing simulation. Submitting tracks grants active backend XP profiles without unlocking Curriculum states. Select your drill sequence below.'}</p>


    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <button onclick={() => mountPracticeMode('words')} class="bg-surface-container-low p-6 rounded-2xl border border-transparent text-left hover:border-primary hover:-translate-y-1 transition-all flex flex-col gap-3">
        <h3 class="font-headline text-xl mb-2">{$t('practice_mode_words') || 'Words'}</h3>
        <p class="text-on-surface-variant text-sm flex-1">{$t('practice_mode_words_desc') || 'Practice common words pulled natively from localized arrays'}</p>
      </button>
      
      <button onclick={() => mountPracticeMode('sentences')} class="bg-surface-container-low p-6 rounded-2xl border border-transparent text-left hover:border-primary hover:-translate-y-1 transition-all flex flex-col gap-3">
        <h3 class="font-headline text-xl mb-2">{$t('practice_mode_sentences') || 'Sentences'}</h3>
        <p class="text-on-surface-variant text-sm flex-1">{$t('practice_mode_sentences_desc') || 'Synthesized punctuated sentence blocks'}</p>
      </button>
      
      <div class="bg-surface-container-low p-6 rounded-2xl border border-transparent flex flex-col gap-3">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-headline text-xl">{$t('practice_mode_literature') || 'Literature'}</h3>
          {#if currentBooks.length > 0}
            <span class="text-xs font-label uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full shrink-0">
              {currentBooks.length} {currentBooks.length === 1 ? 'work' : 'works'}
            </span>
          {/if}
        </div>
        <p class="text-on-surface-variant text-sm flex-1">{$t('practice_mode_literature_desc') || 'Type passages from public-domain classics in your chosen language.'}</p>

        {#if currentBooks.length === 0}
          <p class="text-xs text-on-surface-variant italic border border-outline-variant/30 rounded p-3">
            No native-language classics available yet — showing English works instead.
          </p>
        {:else}
          <select
            bind:value={selectedBookId}
            class="w-full bg-surface-container text-on-surface p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary rounded mb-1 font-body font-bold shadow-inner"
          >
            {#each currentBooks as book}
              <option value={book.id}>{book.title} — {book.author} ({book.year < 0 ? Math.abs(book.year) + ' BCE' : book.year})</option>
            {/each}
          </select>

          <!-- Excerpt preview -->
          {#if selectedBookId}
            {@const selected = currentBooks.find(b => b.id === selectedBookId)}
            {#if selected}
              <p class="text-xs text-on-surface-variant/70 italic line-clamp-2 leading-relaxed border-l-2 border-primary/30 pl-3">
                "{selected.excerpt.slice(0, 120)}…"
              </p>
            {/if}
          {/if}
        {/if}

        <button
          onclick={() => mountPracticeMode('book')}
          disabled={currentBooks.length === 0}
          class="bg-primary text-background font-bold uppercase tracking-wider text-xs py-3 px-4 rounded hover:bg-opacity-80 transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {$t('practice_start_book') || 'Start Book Drill'}
        </button>
      </div>

    </div>
  {:else if isGeneratingAI}
    <div class="flex flex-col items-center justify-center py-24 space-y-6">
      <div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      <h2 class="font-headline text-2xl text-primary animate-pulse">Generating AI Adaptive Drill...</h2>
      <p class="text-on-surface-variant max-w-md text-center">Analyzing your weak keys and composing a custom multilingual sequence using Kimi AI.</p>
    </div>
  {:else}
    <div class="mb-6 flex items-center justify-between">
      <button 
        onclick={() => { mode = 'select'; lessonChars = []; }}
        class="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
      >
        <span>← Back to select</span>
      </button>
      <h2 class="font-headline text-xl uppercase tracking-widest text-primary font-bold">
        {mode} {$t('nav_practice') || 'Practice'}
      </h2>
    </div>

    <!-- Active Practice Dashboard -->
    <div class="mb-8">
      <div class="h-1 bg-surface-container-highest relative overflow-hidden mb-2">
        <div class="h-full bg-secondary transition-all duration-300" style="width: {(currentIndex / Math.max(1, lessonChars.length)) * 100}%"></div>
      </div>
    </div>

    {#if isComplete}
      <div class="bg-surface-container-low p-8 max-w-md mx-auto text-center rounded-2xl shadow-xl border border-primary/20">
        <h2 class="font-headline text-3xl mb-2 text-primary">{$t('lesson_complete') || 'Drill Complete!'}</h2>
        <p class="text-on-surface-variant mb-6 text-sm">{$t('practice_logged') || 'Your session has been logged to your daily streak.'}</p>
        
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-surface-container p-4 rounded text-center">
            <span class="block font-label text-sm text-on-surface-variant mb-1">{$t('lesson_speed') || 'Speed'}</span>
            <span class="font-headline text-4xl text-on-surface">{finalWPM} <span class="text-base text-primary">{$t('lesson_wpm') || 'WPM'}</span></span>
          </div>
          <div class="bg-surface-container p-4 rounded text-center">
            <span class="block font-label text-sm text-on-surface-variant mb-1">{$t('lesson_accuracy') || 'Accuracy'}</span>
            <span class="font-headline text-4xl text-on-surface">{finalAccuracy}<span class="text-base text-secondary">%</span></span>
          </div>
        </div>
        
        <div class="flex gap-4 w-full">
          <button onclick={() => { mode = 'select'; lessonChars = []; }} class="flex-1 bg-surface-container hover:bg-surface-container-highest text-white font-bold py-3 rounded transition-colors uppercase tracking-wider text-sm font-label">{$t('practice_done') || 'Done'}</button>
          <button onclick={() => mountPracticeMode(mode as any)} class="flex-1 bg-primary hover:bg-opacity-80 text-background font-bold py-3 rounded transition-colors uppercase tracking-wider text-sm font-label">{$t('lesson_retry') || 'Retry Mode'}</button>
        </div>
      </div>
    {:else}
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-8 mb-12">
        <MetricsBar 
          metrics={[
            { label: $t('lesson_wpm') || 'WPM', value: currentWPM, variant: 'primary' },
            { label: $t('lesson_accuracy') || 'Accuracy', value: `${currentAccuracy}%`, variant: 'secondary' },
            { label: $t('progress_streak') || 'Streak', value: currentStreak, variant: 'default' },
            { label: 'Active Time', value: formatTime(activeElapsedSeconds), variant: 'default' },
            { label: $t('practice_errors') || 'Errors', value: keystrokes.filter((k) => !k.correct).length, variant: 'default' }
          ]}
          {currentStreak}
          previousStreak={previousStreak}
        />

        <!-- Pause indicator + Stop & Finish -->
        {#if isStarted && !isComplete}
          <div class="flex items-center justify-between -mt-4 px-1" aria-live="polite">
            <div class="flex items-center gap-2 text-xs font-label uppercase tracking-widest
              {isPausedUI ? 'text-amber-400' : 'text-on-surface-variant/40'}">
              {#if isPausedUI}
                <span class="pr-pause-dot" aria-hidden="true"></span>
                <span>Clock paused — tap any key to resume</span>
              {:else}
                <span class="pr-active-dot" aria-hidden="true"></span>
                <span>Clock running</span>
              {/if}
            </div>
            {#if canStop}
              <button
                id="practice-stop-btn"
                onclick={completePractice}
                class="pr-stop-btn font-label text-xs font-bold uppercase tracking-widest px-4 py-2
                  border border-outline-variant/40 text-on-surface-variant
                  hover:border-primary hover:text-primary transition-all duration-200"
                aria-label="Stop practice and see results"
              >
                Stop &amp; Finish
              </button>
            {/if}
          </div>
        {/if}
        
        <div class="p-8 bg-surface-container-low rounded-2xl shadow-lg border border-surface-container relative">
          <TypingInput
            text={lessonText}
            {currentIndex}
            {errors}
          />
        </div>
        
        <Keyboard 
          layout={activeKeyboardLayout}
          {pressedKey}
          {highlightKeys}
        />
      </div>
    {/if}
  {/if}
  </div>
</div>

<style>
  .pr-pause-dot, .pr-active-dot {
    display: inline-block;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .pr-pause-dot { background: #f59e0b; animation: pr-pulse-amber 1.4s ease-in-out infinite; }
  .pr-active-dot { background: #4ade80; animation: pr-pulse-green 2s ease-in-out infinite; }
  @keyframes pr-pulse-amber {
    0%,100% { opacity:1; transform:scale(1); }
    50% { opacity:0.5; transform:scale(0.8); }
  }
  @keyframes pr-pulse-green {
    0%,100% { opacity:0.6; transform:scale(1); }
    50% { opacity:1; transform:scale(1.2); }
  }
  .pr-stop-btn {
    clip-path: polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px));
    background: transparent;
    cursor: pointer;
  }
</style>
