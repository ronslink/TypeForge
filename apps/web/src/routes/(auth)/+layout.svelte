<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="min-h-screen w-full flex flex-col items-center justify-center bg-background grid-texture relative p-6">
  <!-- Glowing orb behind the form -->
  <div class="absolute w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full z-0 pointer-events-none"></div>
  
  <div class="z-10 w-full max-w-md flex flex-col items-center">
    <!-- Optional Logo/Branding -->
    <a href="/" class="mb-8 block hover:scale-105 transition-transform">
      <span class="text-2xl font-black tracking-tighter text-primary-container uppercase font-label">TYPINGSCHOLAR</span>
    </a>
    
    <!-- Auth Component Container -->
    <div class="w-full relative shadow-2xl rounded-2xl glass-panel amber-glow border border-primary/20">
      {@render children()}
    </div>
  </div>
</div>

<style>
  .grid-texture {
    background-image: radial-gradient(circle, rgba(240, 165, 0, 0.05) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .glass-panel {
    backdrop-filter: blur(20px);
    background: rgba(29, 32, 37, 0.6);
  }
  .amber-glow {
    box-shadow: 0 0 25px rgba(240, 165, 0, 0.15);
  }
  .font-label {
    font-family: 'Space Grotesk', monospace;
  }
</style>
