<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  interface Props {
    children: Snippet;
    data: LayoutData;
  }

  let { children, data }: Props = $props();
</script>

<div class="min-h-screen bg-background">
  <!-- Navigation -->
  <nav class="fixed top-0 w-full z-50 bg-surface/60 backdrop-blur-xl">
    <div class="flex justify-between items-center w-full px-8 py-4 max-w-screen-2xl mx-auto">
      <div class="flex items-center gap-8">
        <a href="/" class="text-xl font-black tracking-tighter text-primary uppercase font-label">
          TYPEFORGE
        </a>
        <div class="hidden md:flex gap-6 items-center">
          <a href="/learn" class="text-on-surface/70 hover:text-white transition-colors font-body text-sm">
            Learn
          </a>
          <a href="/practice" class="text-on-surface/70 hover:text-white transition-colors font-body text-sm">
            Practice
          </a>
          <a href="/progress" class="text-on-surface/70 hover:text-white transition-colors font-body text-sm">
            Progress
          </a>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <a href="/settings" class="text-on-surface/70 hover:text-white transition-colors">
          Settings
        </a>
        <!-- User menu placeholder -->
      </div>
    </div>
  </nav>

  <main class="pt-20">
    {@render children()}
  </main>
</div>
