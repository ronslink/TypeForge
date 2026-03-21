<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();
</script>

<svelte:head>
  <title>TypeForge — Multilingual Adaptive Typing</title>
</svelte:head>

<section class="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
  <div class="absolute top-1/4 -right-24 w-96 h-96 bg-primary-container/10 blur-[120px] rounded-full"></div>
  <div class="absolute bottom-1/4 -left-24 w-96 h-96 bg-secondary-container/5 blur-[120px] rounded-full"></div>
  
  <div class="max-w-4xl text-center z-10">
    <h1 class="font-headline text-6xl md:text-8xl tracking-tight leading-tight mb-8">
      Master typing in <span class="italic text-primary">any</span> language
    </h1>
    <p class="text-on-surface-variant text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
      A high-fidelity industrial foundry for digital precision. Engineer your speed with zero-latency 
      feedback and adaptive multilingual mastery.
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <a 
        href="/learn" 
        class="notched-button bg-primary-container text-on-primary-container px-10 py-4 font-label font-bold text-lg tracking-wider hover:amber-glow transition-all"
      >
        Start free today
      </a>
      <a 
        href="/institutional" 
        class="font-label text-on-surface hover:text-primary transition-colors flex items-center gap-2 group"
      >
        Institutional Access
        <span class="group-hover:translate-x-1 transition-transform">→</span>
      </a>
    </div>
  </div>
</section>

<style>
  .notched-button {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }
  .amber-glow:hover {
    box-shadow: 0 0 15px rgba(240, 165, 0, 0.2);
  }
</style>
