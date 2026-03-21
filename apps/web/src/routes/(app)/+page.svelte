<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>Dashboard — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-8">Welcome back</h1>
  
  <!-- Stats Overview -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Today's Practice</span>
      <div class="font-label text-4xl text-secondary font-bold mt-2">0 min</div>
    </div>
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Current Streak</span>
      <div class="font-label text-4xl text-primary font-bold mt-2">0 days</div>
    </div>
    <div class="bg-surface-container-low p-6">
      <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Average WPM</span>
      <div class="font-label text-4xl text-secondary font-bold mt-2">--</div>
    </div>
  </div>

  <!-- Continue Learning -->
  <section class="mb-12">
    <h2 class="font-headline text-2xl mb-6">Continue Learning</h2>
    <div class="bg-surface-container p-8">
      <p class="text-on-surface-variant">No lessons in progress. Start a new lesson!</p>
      <a href="/learn" class="inline-block mt-4 bg-primary-container text-on-primary-container px-6 py-3 font-label font-bold">
        Browse Lessons
      </a>
    </div>
  </section>

  <!-- Recent Activity -->
  <section>
    <h2 class="font-headline text-2xl mb-6">Recent Activity</h2>
    <div class="bg-surface-container p-8">
      <p class="text-on-surface-variant">No recent activity. Start typing to see your progress!</p>
    </div>
  </section>
</div>
