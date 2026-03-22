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
  import { layouts } from '@typeforge/layouts';
  import { api } from '@typeforge/api/client';
  import { getLanguageByCode } from '$lib/i18n/languages';
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Get lesson ID from URL params
  const lessonId = $derived($page.params.lessonId);
  const lesson = $derived(getLessonById(lessonId));

  // User preferences (would come from user store in production)
  let userLanguage = $state('en');
  let userLayout = $state('qwerty-us');

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
  const LESSON_TIME_LIMIT = 300; // 5 minutes max

  // Metrics
  let wpmCalculator = $state(new WPMCalculator());
  let accuracyTracker = $state(new AccuracyTracker());
  let currentWPM = $state(0);
  let currentAccuracy = $state(100);
  let currentStreak = $state(0);
  let maxStreak = $state(0);

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

  // Derived values
  const lessonText = $derived(lesson?.content.map((c) => c.char).join('') || '');
  const lessonChars = $derived(lesson?.content || []);
  const currentChar = $derived(lessonChars[currentIndex]);
  const language = $derived(lesson ? getLanguageByCode(lesson.language) : null);
  const keyboardLayout = $derived(layouts['qwerty-us']); // Default to QWERTY for now

  // Update highlight keys based on current character
  $effect(() => {
    if (currentChar) {
      highlightKeys = new Set([currentChar.char.toLowerCase()]);
    } else {
      highlightKeys = new Set();
    }
  });

  // Update metrics periodically
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

  // Timer effect
  $effect(() => {
    if (isStarted && !isComplete) {
      timerInterval = setInterval(() => {
        elapsedSeconds++;
        if (elapsedSeconds >= LESSON_TIME_LIMIT) {
          completeLesson();
        }
      }, 1000);
      return () => {
        if (timerInterval) clearInterval(timerInterval);
      };
    }
  });

  // Handle keyboard input
  function handleKeyDown(event: KeyboardEvent) {
    if (isComplete) return;

    // Prevent default for typing keys
    if (event.key.length === 1 || event.key === 'Backspace') {
      event.preventDefault();
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
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
      currentIndex++;

      // Check if lesson is complete
      if (currentIndex >= lessonChars.length) {
        completeLesson();
      }
    } else {
      currentStreak = 0;
      errors.add(currentIndex);
      errors = new Set(errors);
    }
  }

  function handleKeyUp(event: KeyboardEvent) {
    pressedKey = undefined;
  }

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

    // Submit session to API
    submitSession();
  }

  async function submitSession() {
    if (sessionSubmitted || !lesson) return;

    try {
      const correctKeystrokes = keystrokes.filter((k) => k.correct).length;
      
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
    keystrokes = [];
    wpmCalculator = new WPMCalculator();
    accuracyTracker = new AccuracyTracker();
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
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (timerInterval) clearInterval(timerInterval);
  });
</script>

<svelte:head>
  <title>{lesson ? `${lesson.title} — TypeForge` : 'Lesson — TypeForge'}</title>
</svelte:head>

<ConfettiCelebration trigger={showCelebration} duration={3000} />

<div class="max-w-5xl mx-auto px-6 py-12">
  {#if lesson}
    <!-- Back Link -->
    <div class="mb-6">
      <a 
        href="/learn" 
        class="text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-2"
      >
        <span>←</span>
        <span>Back to lessons</span>
      </a>
    </div>

    <!-- Lesson Header -->
    <div class="mb-8">
      <div class="flex items-center gap-3 mb-2">
        <h1 class="font-headline text-3xl">{language?.nativeName || lesson.language}</h1>
        <Badge variant="solid" size="sm">{getDifficultyLabel(lesson.difficulty)}</Badge>
      </div>
      <p class="text-on-surface-variant">{lesson.title}</p>
    </div>

    <!-- Progress Bar -->
    <div class="mb-8">
      <div class="h-1 bg-surface-container-highest relative overflow-hidden">
        <div 
          class="h-full bg-secondary transition-all duration-300"
          style="width: {(currentIndex / lessonChars.length) * 100}%"
        ></div>
      </div>
      <div class="flex justify-between mt-2 text-xs text-on-surface-variant">
        <span>{currentIndex} / {lessonChars.length} characters</span>
        <span>{Math.round((currentIndex / lessonChars.length) * 100)}% complete</span>
      </div>
    </div>

    <!-- Completion Overlay -->
    {#if isComplete}
      <div class="fixed inset-0 bg-background/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div class="bg-surface-container-low p-8 max-w-md w-full text-center">
          <h2 class="font-headline text-3xl mb-2 text-primary">Lesson Complete!</h2>
          <p class="text-on-surface-variant mb-8">Great job finishing this lesson!</p>
          
          <!-- Results Grid -->
          <div class="grid grid-cols-3 gap-4 mb-8">
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

          <!-- Action Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            {#if getNextLessonId()}
              <Button variant="primary" onclick={goToNextLesson}>Next Lesson →</Button>
            {/if}
            <Button variant="secondary" onclick={() => goto('/learn')}>Back to Browser</Button>
            <Button variant="ghost" onclick={restartLesson}>Retry</Button>
          </div>
        </div>
      </div>
    {/if}

    <!-- Typing Area -->
    <div class="bg-surface-container-lowest p-8 mb-8 relative">
      <TypingInput 
        text={lessonText} 
        {currentIndex} 
        {errors}
        class="min-h-[120px]"
      />
      
      <!-- Focus hint -->
      {#if !isStarted}
        <div class="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <p class="text-on-surface-variant font-label">Start typing to begin...</p>
        </div>
      {/if}
    </div>

    <!-- Live Metrics Bar -->
    <div class="mb-8">
      <MetricsBar
        metrics={[
          { label: 'WPM', value: currentWPM, variant: 'primary' },
          { label: 'Accuracy', value: `${currentAccuracy}%`, variant: 'secondary' },
          { label: 'Streak', value: currentStreak, variant: 'default' },
          { label: 'Time', value: formatTime(Math.max(0, LESSON_TIME_LIMIT - elapsedSeconds)), variant: 'default' },
        ]}
      />
    </div>

    <!-- Keyboard Visualization -->
    <div class="bg-surface-container p-4">
      <h3 class="font-label text-sm text-on-surface-variant mb-4 text-center">Keyboard Guide</h3>
      <Keyboard 
        layout={keyboardLayout} 
        {highlightKeys}
        {pressedKey}
      />
      
      <!-- Finger Guide -->
      <div class="flex justify-center gap-6 mt-4 text-xs text-on-surface-variant">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 border-l-2 border-red-400"></span>
          <span>Pinky</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 border-l-2 border-orange-400"></span>
          <span>Ring</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 border-l-2 border-yellow-400"></span>
          <span>Middle</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 border-l-2 border-green-400"></span>
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
            <span class="px-3 py-1 bg-surface-container text-on-surface font-label">{key}</span>
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
    <div class="text-center py-20">
      <h1 class="font-headline text-3xl mb-4">Lesson Not Found</h1>
      <p class="text-on-surface-variant mb-8">The lesson you're looking for doesn't exist.</p>
      <Button variant="primary" onclick={() => goto('/learn')}>Browse Lessons</Button>
    </div>
  {/if}
</div>
