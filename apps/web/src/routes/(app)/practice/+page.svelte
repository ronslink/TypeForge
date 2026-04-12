<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { 
    TypingInput, 
    Keyboard, 
    MetricsBar, 
    StatCard, 
    Button, 
    ConfettiCelebration 
  } from '@typeforge/ui';
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
  import { layouts } from '@typeforge/layouts';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const ctx = useClerkContext();
  let userLanguage = $state('en');
  let userLayout = $state('qwerty-us');

  // Practice Modes State
  let mode = $state<'select' | 'words' | 'sentences' | 'custom'>('select');
  let customText = $state('');

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
  const LESSON_TIME_LIMIT = $derived(lessonChars.length > 0 ? Math.max(60, Math.ceil((lessonChars.length / 5) * 4)) : 60);

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

  $effect(() => {
    if (currentChar) {
      highlightKeys = new Set([currentChar.char.toLowerCase()]);
    } else {
      highlightKeys = new Set();
    }
  });

  $effect(() => {
    if (isStarted && !isComplete) {
      const interval = setInterval(() => {
        const wpmResult = wpmCalculator.getWPM();
        currentWPM = Math.round(wpmResult.netWPM);
        currentAccuracy = Math.round(accuracyTracker.getAccuracy());
      }, 500);
      return () => clearInterval(interval);
    }
  });

  $effect(() => {
    if (isStarted && !isComplete) {
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        if (elapsedSeconds >= LESSON_TIME_LIMIT) {
          completePractice();
        }
      }, 1000);
      return () => {
        if (timerInterval) clearInterval(timerInterval);
      };
    }
  });

  // Generator Helpers mapping string to LessonChar engine array
  function generateLessonSequence(text: string): LessonChar[] {
    return text.split('').map(char => {
      let code = 'Unknown';
      let expectedFinger: Finger = 'right_index';
      if (char === ' ') {
        code = 'Space';
        expectedFinger = 'left_thumb';
      }
      return { char, code, expectedFinger };
    });
  }

  function mountPracticeMode(selectedMode: 'words' | 'sentences' | 'custom') {
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
    } else if (selectedMode === 'custom' && customText.trim().length > 0) {
      lessonChars = generateLessonSequence(customText.trim());
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
    currentWPM = 0;
    currentAccuracy = 100;
    currentStreak = 0;
    keystrokes = [];
    wpmCalculator = new WPMCalculator();
    accuracyTracker = new AccuracyTracker();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (mode === 'select' || (mode === 'custom' && lessonChars.length === 0)) return;
    if (isComplete) return;

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
    } else {
      previousStreak = currentStreak;
      currentStreak = 0;
      errors.add(currentIndex);
      errors = new Set(errors);
    }

    currentIndex++;
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
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const wpmResult = wpmCalculator.getWPM();
    finalWPM = Math.round(wpmResult.netWPM);
    finalAccuracy = Math.round(accuracyTracker.getAccuracy());
    finalDuration = elapsedSeconds;
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
  <title>Practice — TypingScholar</title>
</svelte:head>

<ConfettiCelebration trigger={showCelebration} duration={3000} />

<div class="max-w-7xl mx-auto px-6 py-12">
  
  {#if mode === 'select' || (mode === 'custom' && lessonChars.length === 0)}
    <h1 class="font-headline text-4xl mb-4">Practice</h1>
    <p class="text-on-surface-variant mb-8">Freeform typing simulation. Submitting tracks grants active backend XP profiles without unlocking Curriculum states.</p>

    <!-- Language Selector Injection -->
    <div class="mb-6 flex gap-4 max-w-sm">
      <select class="flex-1 bg-surface-container-low text-on-surface p-3 rounded" bind:value={userLanguage}>
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
        <option value="ar">Arabic</option>
      </select>
      <select class="flex-1 bg-surface-container-low text-on-surface p-3 rounded" bind:value={userLayout}>
        <option value="qwerty-us">QWERTY</option>
        <option value="qwertz-de">QWERTZ</option>
      </select>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <button onclick={() => mountPracticeMode('words')} class="bg-surface-container-low p-6 rounded-2xl border border-transparent text-left hover:border-primary hover:-translate-y-1 transition-all">
        <h3 class="font-headline text-xl mb-2">Words</h3>
        <p class="text-on-surface-variant text-sm">Practice common words pulled natively from localized arrays</p>
      </button>
      
      <button onclick={() => mountPracticeMode('sentences')} class="bg-surface-container-low p-6 rounded-2xl border border-transparent text-left hover:border-primary hover:-translate-y-1 transition-all">
        <h3 class="font-headline text-xl mb-2">Sentences</h3>
        <p class="text-on-surface-variant text-sm">Synthesized punctuated sentence blocks</p>
      </button>
      
      <div class="bg-surface-container-low p-6 rounded-2xl border border-transparent filter-none flex flex-col gap-3">
        <h3 class="font-headline text-xl">Custom</h3>
        <p class="text-on-surface-variant text-sm flex-1">Paste custom JSON, literature, or APIs to practice.</p>
        <textarea bind:value={customText} placeholder="Type custom drills here..." class="w-full h-24 bg-surface-container text-on-surface p-3 text-xs outline-none focus:ring-1 focus:ring-primary rounded mb-2"></textarea>
        <button onclick={() => mountPracticeMode('custom')} class="bg-primary text-black font-bold uppercase tracking-wider text-xs py-2 px-4 rounded hover:bg-opacity-80 transition-colors">Start Custom Drill</button>
      </div>
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
        {mode} Practice
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
        <h2 class="font-headline text-3xl mb-2 text-primary">Drill Complete!</h2>
        <p class="text-on-surface-variant mb-6 text-sm">Your session has been logged to your daily streak.</p>
        
        <div class="grid grid-cols-2 gap-4 mb-8">
          <div class="bg-surface-container p-4 rounded text-center">
            <span class="block font-label text-sm text-on-surface-variant mb-1">Speed</span>
            <span class="font-headline text-4xl text-on-surface">{finalWPM} <span class="text-base text-primary">WPM</span></span>
          </div>
          <div class="bg-surface-container p-4 rounded text-center">
            <span class="block font-label text-sm text-on-surface-variant mb-1">Accuracy</span>
            <span class="font-headline text-4xl text-on-surface">{finalAccuracy}<span class="text-base text-secondary">%</span></span>
          </div>
        </div>
        
        <div class="flex gap-4 w-full">
          <button onclick={() => { mode = 'select'; lessonChars = []; }} class="flex-1 bg-surface-container hover:bg-surface-container-highest text-white font-bold py-3 rounded transition-colors uppercase tracking-wider text-sm font-label">Done</button>
          <button onclick={() => mountPracticeMode(mode as any)} class="flex-1 bg-primary hover:bg-opacity-80 text-background font-bold py-3 rounded transition-colors uppercase tracking-wider text-sm font-label">Retry Mode</button>
        </div>
      </div>
    {:else}
      <div class="w-full max-w-4xl mx-auto flex flex-col gap-8 mb-12">
        <MetricsBar 
          metrics={[
            { label: 'WPM', value: currentWPM, variant: 'primary' },
            { label: 'Accuracy', value: `${currentAccuracy}%`, variant: 'secondary' },
            { label: 'Streak', value: currentStreak, variant: 'default' },
            { label: 'Time', value: formatTime(Math.max(0, LESSON_TIME_LIMIT - elapsedSeconds)), variant: 'default' },
            { label: 'Errors', value: keystrokes.filter((k) => !k.correct).length, variant: 'default' }
          ]}
          {currentStreak}
          previousStreak={previousStreak}
        />
        
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
