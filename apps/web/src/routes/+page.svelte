<script lang="ts">
  import { onMount } from 'svelte';

  // Typing demo state
  const demoText = "Refining the intellectual velocity through disciplined precision.";
  let typedText = $state("Refining the intellectual ");
  let currentWpm = $state(124);
  let currentAccuracy = $state(98.2);
  let streak = $state(412);
  let hasStartedTyping = false;

  onMount(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key.length > 1 && e.key !== 'Backspace') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ' ') e.preventDefault();
      
      if (e.key === 'Backspace') {
        typedText = typedText.slice(0, -1);
        return;
      }
      
      if (typedText.length >= demoText.length) return;
      
      const expectedChar = demoText[typedText.length];
      if (e.key === expectedChar) {
        typedText += e.key;
        streak += 1;
        if (!hasStartedTyping) hasStartedTyping = true;
        if (Math.random() > 0.6 && currentWpm < 160) currentWpm += 1;
        if (currentAccuracy < 100 && streak > 10) currentAccuracy = Math.min(100, currentAccuracy + 0.1);
      } else {
        streak = 0;
        if (currentAccuracy > 0) currentAccuracy = Math.max(0, currentAccuracy - 0.5);
      }
      currentAccuracy = Math.round(currentAccuracy * 10) / 10;
    };
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<svelte:head>
  <title>TYPING SCHOLAR | Kinetic Foundry</title>
</svelte:head>

<div class="max-w-[1600px] w-full mx-auto">
  <!-- Header Section: Asymmetric Editorial -->
  <header class="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
    <div class="max-w-2xl">
      <div class="font-label text-primary text-xs tracking-[0.4em] mb-4">SYSTEM_STATUS: ACTIVE</div>
      <h1 class="font-headline text-6xl font-light italic leading-tight text-on-surface">
        Refining the <span class="font-bold text-primary-fixed">intellectual velocity</span> through disciplined precision.
      </h1>
    </div>
    <div class="w-full md:w-auto bg-surface-container-low p-8 flex flex-col items-end text-right min-w-[280px] border border-outline-variant/10">
      <div class="font-label text-slate-500 text-[10px] tracking-[0.2em] mb-2">CURRENT_LATENCY</div>
      <div class="font-label text-secondary text-5xl font-bold">14ms</div>
      <div class="mt-4 font-label text-slate-600 text-[10px] max-w-[180px] leading-relaxed uppercase">
        Neural interface calibrated to network protocol 8.2
      </div>
    </div>
  </header>

  <!-- Interactive Typing Demo (The "Practice" structure embedded on Landing) -->
  <div class="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mb-24">
    <!-- Typing Canvas -->
    <div class="col-span-1 md:col-span-8 flex flex-col gap-8">
      <div class="flex items-baseline justify-between">
        <h2 class="font-headline text-4xl italic text-on-surface/40 select-none">Global Launch Sequence</h2>
        <span class="font-label text-[10px] tracking-[0.3em] text-outline-variant uppercase hidden md:inline">Module: Interactive Preview</span>
      </div>
      <!-- Typing Area -->
      <div class="relative group">
        <!-- Technical Overlay (Crosshairs) -->
        <div class="absolute -top-4 -left-4 w-8 h-8 border-t border-l border-outline-variant/30"></div>
        <div class="absolute -bottom-4 -right-4 w-8 h-8 border-b border-r border-outline-variant/30"></div>
        
        <div class="bg-surface-container-lowest p-12 notch-bottom-right border-b-2 border-primary-container relative min-h-[400px]">
          <div class="font-headline text-3xl leading-relaxed tracking-tight text-on-surface/30 relative">
            <!-- Dynamically rendered text -->
            <span class="text-secondary">{typedText}</span>
            <span class="text-on-surface/90 border-l-2 border-primary animate-pulse ml-[1px]">{demoText.slice(typedText.length, typedText.length + 1)}</span>
            <span>{demoText.slice(typedText.length + 1)}</span>
                                
            <div class="mt-12 text-on-surface/40 font-body text-base max-w-lg">
              Start typing on your keyboard to instantly test the zero-latency neural engine. No signup required to begin calibration.
            </div>
          </div>
          <!-- Hidden input for focus capture if needed -->
          <input autofocus class="absolute inset-0 opacity-0 cursor-default" type="text" />
        </div>
        
        <div class="mt-4 flex justify-between items-center">
          <span class="font-label text-[10px] tracking-widest text-outline-variant">LIVE INTERACTIVE DEMO</span>
          <div class="flex gap-2">
            <span class="w-2 h-2 shadow-[0_0_8px_rgba(65,228,192,0.5)]" class:bg-secondary={streak > 5} class:bg-outline-variant={streak <= 5}></span>
            <span class="w-2 h-2 bg-outline-variant"></span>
            <span class="w-2 h-2 bg-outline-variant"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Instrument Cluster (Sidebar Metrics) -->
    <aside class="col-span-1 md:col-span-4 sticky top-32">
      <div class="glass-panel p-8 flex flex-col gap-10">
        <!-- Velocity -->
        <div class="flex flex-col">
          <span class="font-label text-[10px] tracking-[0.3em] text-outline uppercase mb-2">Velocity (WPM)</span>
          <div class="flex items-baseline gap-2">
            <span class="font-label text-6xl font-bold text-secondary">{currentWpm}</span>
            <span class="font-label text-xs text-secondary/50">AVG: 72</span>
          </div>
          <div class="mt-4 h-1 w-full bg-surface-container-highest overflow-hidden">
            <div class="h-full bg-secondary transition-all duration-300" style="width: {Math.min(currentWpm / 1.5, 100)}%"></div>
          </div>
        </div>
        
        <!-- Calibration -->
        <div class="flex flex-col">
          <span class="font-label text-[10px] tracking-[0.3em] text-outline uppercase mb-2">Calibration (ACC)</span>
          <div class="flex items-baseline gap-2">
            <span class="font-label text-6xl font-bold text-primary">{currentAccuracy}</span>
            <span class="font-label text-xs text-primary/50">%</span>
          </div>
        </div>
        
        <!-- Action -->
        <div class="pt-6 border-t border-outline-variant/15 flex flex-col gap-4">
          <button class="w-full py-4 font-label text-xs tracking-[0.2em] bg-primary text-on-primary hover:bg-primary-fixed transition-colors flex items-center justify-center gap-3 font-bold notched-button">
            CREATE ACCOUNT
          </button>
        </div>
      </div>
      
      <!-- Ambient Decoration -->
      <div class="mt-8 p-6 bg-surface-container-lowest/50 border-l-2 border-outline-variant/20 hidden md:block">
        <p class="font-label text-[10px] leading-relaxed text-outline-variant uppercase">
          Notice: Guest sessions do not persist calibration data to the neural archive. Create an account to permanently sync performance matrices.
        </p>
      </div>
    </aside>
  </div>

  <!-- Lesson Categories: High-Density Bento Grid -->
  <section class="mb-24">
    <div class="flex justify-between items-baseline mb-12 border-b border-outline-variant/10 pb-4">
      <h2 class="font-headline text-3xl italic text-on-surface">Archival Categories</h2>
      <div class="font-label text-slate-500 text-[10px] tracking-[0.2em]">FILTER: [ ALL_DATA ]</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-1">
      <!-- Large Card -->
      <div class="md:col-span-2 md:row-span-2 bg-surface-container-low p-12 group cursor-pointer hover:bg-surface-container-high transition-colors flex flex-col justify-between">
        <div>
          <div class="font-label text-primary text-[10px] tracking-[0.4em] mb-8">FEATURED_PROTOCOL</div>
          <h3 class="font-headline text-5xl mb-6 text-on-surface">Classic Literature</h3>
          <p class="font-body text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
            Master the cadence of the giants. From Austen to Zola, refine your syntax through the most elegant arrangements of the human language.
          </p>
        </div>
        <div class="flex items-center justify-between">
          <div class="font-label text-xs tracking-widest text-secondary flex items-center">
            <span class="material-symbols-outlined text-sm mr-2">book_2</span>
            428 MODULES
          </div>
          <span class="material-symbols-outlined text-primary group-hover:translate-x-2 transition-transform">arrow_forward</span>
        </div>
      </div>
      <!-- Small Card 1 -->
      <div class="bg-surface-container-lowest p-8 group cursor-pointer hover:bg-surface-container flex flex-col justify-between aspect-square">
        <div class="font-label text-slate-500 text-[9px] tracking-[0.3em]">SCIENCE_JOURNAL</div>
        <div>
          <h3 class="font-label font-bold text-lg mb-2 text-on-surface">SYNAPTIC_VOID</h3>
          <div class="font-label text-secondary text-[10px]">DIFFICULTY: HIGH</div>
        </div>
        <div class="pt-4 border-t border-outline-variant/10">
          <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">science</span>
        </div>
      </div>
      <!-- Small Card 2 -->
      <div class="bg-surface-container-lowest p-8 group cursor-pointer hover:bg-surface-container flex flex-col justify-between aspect-square">
        <div class="font-label text-slate-500 text-[9px] tracking-[0.3em]">LEGAL_CODEX</div>
        <div>
          <h3 class="font-label font-bold text-lg mb-2 text-on-surface">PRECEDENT_88</h3>
          <div class="font-label text-secondary text-[10px]">DIFFICULTY: EXPERT</div>
        </div>
        <div class="pt-4 border-t border-outline-variant/10">
          <span class="material-symbols-outlined text-on-surface-variant group-hover:text-primary">gavel</span>
        </div>
      </div>
      <!-- Medium Card (Horizontal) -->
      <div class="md:col-span-2 bg-surface-container-lowest p-8 group cursor-pointer hover:bg-surface-container flex items-center justify-between">
        <div class="flex items-center space-x-8">
          <div class="w-16 h-16 bg-surface-container-high flex items-center justify-center">
            <span class="material-symbols-outlined text-secondary">code</span>
          </div>
          <div>
            <div class="font-label text-slate-500 text-[9px] tracking-[0.3em]">TECHNICAL_LABS</div>
            <h3 class="font-label font-bold text-xl uppercase text-on-surface">Assembly Protocol</h3>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA Section -->
  <section class="p-20 bg-surface-container-low relative overflow-hidden flex flex-col items-center text-center">
    <div class="dot-grid absolute inset-0"></div>
    <div class="relative z-10 max-w-xl">
      <h2 class="font-headline text-5xl italic mb-6 text-on-surface">Ready to initiate calibration?</h2>
      <p class="font-body text-slate-400 mb-12">
        System diagnostics confirm optimal readiness. The Kinetic Foundry awaits your next sequence of high-precision inputs.
      </p>
      <button class="notched-button px-12 py-5 bg-primary-container text-on-primary font-label text-sm font-bold tracking-[0.2em] glow-amber inline-flex items-center group">
        START NEW SESSION
        <span class="material-symbols-outlined ml-4 group-hover:translate-x-1 transition-transform">play_arrow</span>
      </button>
    </div>
  </section>
</div>
