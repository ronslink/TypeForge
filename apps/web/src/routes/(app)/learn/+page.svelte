<script lang="ts">
  import { goto } from '$app/navigation';
  import { LessonCard, Button, Badge } from '@typeforge/ui';
  import { LESSON_CATALOG, type RegistryLesson } from '@typeforge/curriculum';
  import { getLanguageByCode, type Language } from '$lib/i18n/languages';
  import type { PageData } from './$types';

  interface Props {
    data?: PageData;
  }

  let { data: _data = {} as PageData }: Props = $props();

  // User preferences from onboarding (would come from data/user store in production)
  let userLanguage = $state('en');

  // Filter states
  let selectedLanguage = $state('all');
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
  function getLessonTags(lesson: RegistryLesson): string[] {
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
  function toLessonCardProps(lesson: RegistryLesson) {
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
      title: language?.nativeName || lesson.language,
      description: lesson.title,
      difficulty: difficultyMap[lesson.difficulty] || 'beginner',
      language: language?.nativeName || lesson.language,
      duration: Math.max(1, Math.round(lesson.content.length / 100)), // Estimate based on content length
      progress: undefined,
    };
  }

  // Get difficulty stars display
  function getDifficultyStars(level: number): string {
    return '★'.repeat(level) + '☆'.repeat(5 - level);
  }

  // Handle lesson card click
  function handleLessonClick(lessonId: string) {
    goto(`/learn/${lessonId}`);
  }

  // Clear all filters
  function clearFilters() {
    selectedLanguage = 'all';
    selectedDifficulty = 'all';
    selectedTag = 'all';
    searchQuery = '';
  }
</script>

<svelte:head>
  <title>Learn — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <!-- Header -->
  <div class="mb-8">
    <h1 class="font-headline text-4xl mb-2">Learn</h1>
    <p class="text-on-surface-variant">Choose a lesson to practice your typing skills.</p>
  </div>

  <!-- Recommended Section -->
  {#if recommendedLessons.length > 0 && selectedLanguage === 'all' && selectedDifficulty === 'all' && selectedTag === 'all' && !searchQuery}
    <section class="mb-12">
      <div class="flex items-center gap-3 mb-6">
        <h2 class="font-headline text-2xl">Recommended for You</h2>
        <Badge variant="default">{getLanguageByCode(userLanguage)?.nativeName}</Badge>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each recommendedLessons as lesson}
          <LessonCard
            lesson={toLessonCardProps(lesson)}
            onclick={() => handleLessonClick(lesson.id)}
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

        <!-- Language Filter -->
        <select
          bind:value={selectedLanguage}
          class="bg-surface-container px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
        >
          <option value="all">All Languages</option>
          {#each languages as lang}
            <option value={lang.code}>{lang.nativeName}</option>
          {/each}
        </select>

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
      {selectedLanguage === 'all' && selectedDifficulty === 'all' && selectedTag === 'all' && !searchQuery
        ? 'All Lessons'
        : 'Filtered Lessons'}
    </h2>
    
    {#if filteredLessons.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filteredLessons as lesson}
          <LessonCard
            lesson={toLessonCardProps(lesson)}
            onclick={() => handleLessonClick(lesson.id)}
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
    {:else}
      <div class="bg-surface-container-low p-12 text-center">
        <p class="text-on-surface-variant mb-4">No lessons found matching your filters.</p>
        <Button variant="secondary" onclick={clearFilters}>Clear Filters</Button>
      </div>
    {/if}
  </section>
</div>
