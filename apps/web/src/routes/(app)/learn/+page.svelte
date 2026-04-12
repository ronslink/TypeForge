<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { LessonCard, Button, Badge } from '@typeforge/ui';
  import { LESSON_CATALOG, getLessonById, type Lesson } from '@typeforge/curriculum';
  import { getLanguageByCode, ALL_LANGUAGES, type Language } from '$lib/i18n/languages';
  import type { PageData } from './$types';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // Auth & Progress Tracking State
  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  let completedLessonIds = $state(new Set<string>());

  onMount(async () => {
    if (!isSignedIn) return;
    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const defaultHeaders = new Headers(init?.headers);
        if (token) defaultHeaders.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: defaultHeaders });
      };
      const api = createApiClient('/', authFetch);

      const res = await api.api.v1.progress.lessons.$get();
      if (res.ok) {
        const payload = await res.json();
        if (payload.completedLessons) {
          completedLessonIds = new Set(payload.completedLessons);
        }
      }
    } catch (e) {
      console.error('Failed to wire user progression:', e);
    }
  });

  // User preferences from onboarding (would come from data/user store in production)
  let userLanguage = $state('en');
  let userLayout = $state('qwerty-us');

  // Filter states
  let selectedLanguage = $state(userLanguage);
  let selectedDifficulty = $state('all');
  let selectedTag = $state('all');
  let searchQuery = $state('');

  // Available filter options
  const languages = $derived(
    Array.from(new Set(LESSON_CATALOG.map((l) => l.language)))
      .map((code) => getLanguageByCode(code))
      .filter(Boolean) as Language[]
  );

  const difficultyLevels = [
    { value: '1', label: 'Beginner ★' },
    { value: '2', label: 'Beginner ★★' },
    { value: '3', label: 'Intermediate ★★★' },
    { value: '4', label: 'Advanced ★★★★' },
    { value: '5', label: 'Expert ★★★★★' },
  ];

  const tags = [
    'home row',
    'top row',
    'bottom row',
    'punctuation',
    'speed',
    'accuracy',
    'endurance',
    'left hand',
    'right hand',
  ];

  // Filter lessons based on selected filters
  const filteredLessons = $derived(
    LESSON_CATALOG.filter((lesson) => {
      // Language filter
      if (selectedLanguage !== 'all' && lesson.language !== selectedLanguage) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== 'all' && lesson.difficulty !== parseInt(selectedDifficulty)) {
        return false;
      }
      // Tag filter
      if (selectedTag !== 'all') {
        const lessonTags = getLessonTags(lesson);
        if (!lessonTags.includes(selectedTag)) {
          return false;
        }
      }
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = lesson.title.toLowerCase().includes(query);
        const matchesId = lesson.id.toLowerCase().includes(query);
        const matchesKeyBigram = lesson.tags.key_bigram.toLowerCase().includes(query);
        if (!matchesTitle && !matchesId && !matchesKeyBigram) {
          return false;
        }
      }
      return true;
    })
  );

  // Recommended lessons based on user preferences
  const recommendedLessons = $derived(
    LESSON_CATALOG.filter((lesson) => {
      // Match user's language
      if (lesson.language !== userLanguage) return false;
      // Recommend beginner lessons first
      return lesson.difficulty <= 2;
    }).slice(0, 3)
  );

  // Get display tags for a lesson
  function getLessonTags(lesson: Lesson): string[] {
    const tags: string[] = [];
    if (lesson.tags.key_bigram.includes('home-row') || lesson.id.includes('home-row')) {
      tags.push('home row');
    }
    if (lesson.tags.key_bigram.includes('top-row') || lesson.id.includes('top-row')) {
      tags.push('top row');
    }
    if (lesson.tags.key_bigram.includes('bottom-row') || lesson.id.includes('bottom-row')) {
      tags.push('bottom row');
    }
    if (lesson.tags.speed === 'speed') tags.push('speed');
    if (lesson.tags.speed === 'accuracy') tags.push('accuracy');
    if (lesson.tags.speed === 'endurance') tags.push('endurance');
    if (lesson.tags.hand === 'left') tags.push('left hand');
    if (lesson.tags.hand === 'right') tags.push('right hand');
    return tags;
  }

  // Convert curriculum lesson to LessonCard format
  function toLessonCardProps(lesson: Lesson) {
    const language = getLanguageByCode(lesson.language);
    const difficultyMap: Record<number, 'beginner' | 'intermediate' | 'advanced'> = {
      1: 'beginner',
      2: 'beginner',
      3: 'intermediate',
      4: 'advanced',
      5: 'advanced',
    };

    return {
      id: lesson.id,
      title: lesson.title,
      description: `Focus Characters: ${lesson.tags.key_bigram || lesson.content.substring(0, 15)}`,
      difficulty: difficultyMap[lesson.difficulty] || 'beginner',
      language: '', // Intentionally left blank to avoid redundancy on every card
      duration: Math.max(1, Math.round(lesson.content.length / 100)), // Estimate based on content length
      progress: completedLessonIds.has(lesson.id) ? 100 : 0,
    };
  }

  // Get difficulty stars display
  function getDifficultyStars(level: number): string {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  }

  // Clear all filters
  function clearFilters() {
    selectedLanguage = 'all';
    selectedDifficulty = 'all';
    selectedTag = 'all';
    searchQuery = '';
  }

  // Define Curriculum Sequence
  const curriculumStages = [
    { level: 1, title: 'Stage 1: Home Row Fundamentals', description: 'Master the resting position for ultimate typing efficiency.' },
    { level: 2, title: 'Stage 2: Core Combinations', description: 'Combine primary fingers to drill cross-key bigrams.' },
    { level: 3, title: 'Stage 3: Top Row Extensions', description: 'Expand your reach to the top alpha row.' },
    { level: 4, title: 'Stage 4: Bottom Row Variables', description: 'Learn the lower reaches for complete alpha mastery.' },
    { level: 5, title: 'Stage 5: Speed & Coordination', description: 'Real words, endurance blocks, and ultimate flow.' }
  ];

  // Helper to group lessons by difficulty for progressive layout
  const groupedLessons = $derived(
    curriculumStages.map(stage => ({
      ...stage,
      lessons: filteredLessons.filter(l => l.difficulty === stage.level)
    })).filter(stage => stage.lessons.length > 0)
  );
</script>

<svelte:head>
  <title>Learn — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <!-- Interactive Header Panel -->
  <div class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-8 bg-gradient-to-br from-surface-container-low to-surface-container-lowest rounded-2xl shadow-xl border border-surface-container border-b-4 border-b-primary">
    <div>
      <h1 class="font-headline text-4xl mb-3 flex items-center gap-3">
        Learn ⚡
      </h1>
      <p class="text-on-surface-variant max-w-md text-sm leading-relaxed">Master your typing sequence with guided curriculum modules specifically tailored to your preferred dialect and hardware structure.</p>
    </div>
    
    <div class="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <!-- Global Language Selector -->
        <div class="flex flex-col gap-1.5 flex-1">
          <label for="lang-select" class="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest">Target Language</label>
          <select
            id="lang-select"
            bind:value={selectedLanguage}
            class="bg-surface-container/50 px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container rounded-lg border border-transparent shadow-inner cursor-pointer transition-colors"
          >
            <option value="all">All Languages</option>
            {#each languages as lang}
              <option value={lang.code}>{lang.nativeName}</option>
            {/each}
          </select>
        </div>

        <!-- Global Layout Selector -->
        <div class="flex flex-col gap-1.5 flex-1">
          <label for="global-layout" class="text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-widest">Hardware Layout</label>
          <select 
            id="global-layout"
            class="bg-surface-container/50 px-4 py-2.5 text-sm font-medium text-on-surface focus:outline-none focus:border-primary focus:bg-surface-container rounded-lg border border-transparent shadow-inner cursor-pointer transition-colors"
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
  </div>

  <!-- Recommended Section -->
  {#if recommendedLessons.length > 0 && selectedLanguage === userLanguage && selectedDifficulty === 'all' && selectedTag === 'all' && !searchQuery}
    <section class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <h2 class="font-headline text-2xl">Recommended for You</h2>
        <Badge variant="solid" size="sm">{getLanguageByCode(userLanguage)?.nativeName}</Badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each recommendedLessons as lesson}
          <LessonCard
            lesson={toLessonCardProps(lesson)}
            href={`/learn/${lesson.id}`}
          >
            <div class="flex flex-wrap gap-2 mt-2">
              {#each getLessonTags(lesson).slice(0, 3) as tag}
                <span class="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-sm">
                  {tag}
                </span>
              {/each}
            </div>
            <div class="flex items-center gap-2 mt-3 text-amber-400 text-sm">
              <span>{getDifficultyStars(lesson.difficulty)}</span>
            </div>
          </LessonCard>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Filter Bar -->
  <section class="mb-8">
    <div class="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between bg-surface-container-low p-4">
      <div class="flex flex-wrap gap-4 items-center">
        <!-- Search -->
        <div class="relative">
          <input
            type="text"
            placeholder="Search lessons..."
            bind:value={searchQuery}
            class="bg-surface-container px-4 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary w-48"
          />
          {#if searchQuery}
            <button
              class="absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              onclick={() => searchQuery = ''}
            >
              ✕
            </button>
          {/if}
        </div>

        <!-- Remove inline Language selector to rely cleanly on the Header setup -->

        <!-- Difficulty Filter -->
        <select
          bind:value={selectedDifficulty}
          class="bg-surface-container px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="all">All Levels</option>
          {#each difficultyLevels as level}
            <option value={level.value}>{level.label}</option>
          {/each}
        </select>

        <!-- Tag Filter -->
        <select
          bind:value={selectedTag}
          class="bg-surface-container px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="all">All Tags</option>
          {#each tags as tag}
            <option value={tag}>{tag}</option>
          {/each}
        </select>

        <!-- Clear Filters -->
        {#if selectedLanguage !== 'all' || selectedDifficulty !== 'all' || selectedTag !== 'all' || searchQuery}
          <button
            class="text-sm text-secondary hover:text-secondary-container transition-colors"
            onclick={clearFilters}
          >
            Clear filters
          </button>
        {/if}
      </div>

      <div class="text-sm text-on-surface-variant">
        {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
      </div>
    </div>
  </section>

  <!-- Lesson Grid -->
  <section>
    <h2 class="font-headline text-2xl mb-6">
      {selectedLanguage === userLanguage && selectedDifficulty === 'all' && selectedTag === 'all' && !searchQuery
        ? 'All Lessons'
        : 'Filtered Lessons'}
    </h2>
    
    {#if filteredLessons.length > 0}
      <div class="space-y-16">
        <!-- progressive layout rendering -->
        {#if selectedLanguage === userLanguage && selectedDifficulty === 'all' && selectedTag === 'all' && !searchQuery}
          <div class="relative progressive-path pl-4 md:pl-8 border-l-2 border-surface-container-highest">
            {#each groupedLessons as stage, index}
              <div class="mb-14 relative">
                <!-- Timeline node marker -->
                <div class="absolute -left-[21px] md:-left-[37px] top-4 w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border-4 border-background text-primary font-bold z-10 shadow-[0_0_15px_rgba(240,165,0,0.2)]">
                  {index + 1}
                </div>
                
                <div class="mb-6 ml-6 p-6 bg-surface-container-low/50 backdrop-blur-sm rounded-xl border border-surface-container shadow-sm flex items-center justify-between">
                  <div>
                    <h3 class="font-headline text-2xl text-on-surface">{stage.title}</h3>
                    <p class="text-on-surface-variant text-sm mt-1.5">{stage.description}</p>
                  </div>
                  <div class="hidden sm:block text-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ml-6">
                  {#each stage.lessons as lesson}
                    <LessonCard
                      lesson={toLessonCardProps(lesson)}
                      href={`/learn/${lesson.id}`}
                    >
                      <div class="flex flex-wrap gap-2 mt-2">
                        {#each getLessonTags(lesson).slice(0, 3) as tag}
                          <span class="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-sm">
                            {tag}
                          </span>
                        {/each}
                      </div>
                      <div class="flex items-center gap-2 mt-3 text-amber-400 text-sm">
                        <span>{getDifficultyStars(lesson.difficulty)}</span>
                        <span class="text-on-surface-variant text-xs">({Math.round(lesson.content.length)} chars)</span>
                      </div>
                    </LessonCard>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <!-- Search UI layout for non-progressive filtered browsing -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each filteredLessons as lesson}
              <LessonCard
                lesson={toLessonCardProps(lesson)}
                href={`/learn/${lesson.id}`}
              >
                <div class="flex flex-wrap gap-2 mt-2">
                  {#each getLessonTags(lesson).slice(0, 3) as tag}
                    <span class="text-xs px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-sm">
                      {tag}
                    </span>
                  {/each}
                </div>
                <div class="flex items-center gap-2 mt-3 text-amber-400 text-sm">
                  <span>{getDifficultyStars(lesson.difficulty)}</span>
                  <span class="text-on-surface-variant text-xs">({lesson.content.length} chars)</span>
                </div>
              </LessonCard>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <div class="bg-surface-container-low p-12 text-center">
        <p class="text-on-surface-variant mb-4">No lessons found matching your filters.</p>
        <Button variant="secondary" onclick={clearFilters}>Clear Filters</Button>
      </div>
    {/if}
  </section>
</div>
