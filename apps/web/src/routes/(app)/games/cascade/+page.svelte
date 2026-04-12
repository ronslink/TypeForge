<script lang="ts">
    import { RaindropEngine } from '@typeforge/ui';
    import { getSupportedLanguages, getRandomWords } from '@typeforge/curriculum';
    import { getLanguageByCode } from '$lib/i18n/languages';
    import { confettiCelebration } from '@typeforge/ui';
  
    // Config State
    let isPlaying = $state(false);
    let selectedLanguage = $state('en');
    let generatedWords = $state<string[]>([]);
    
    // Results State
    let showResults = $state(false);
    let finalScore = $state(0);
    let finalAccuracy = $state(0);
  
    let availableLanguages = getSupportedLanguages()
      .map(code => getLanguageByCode(code))
      .filter(Boolean) as { code: string; nativeName: string }[];
  
    function startGame() {
      // Pull heavily padded deep linguistic dictionary pool representing all words defined in language
      const rawWords = getRandomWords(selectedLanguage, 250); 
      // Filter words longer than 12 chars to prevent canvas bleeding bugs
      generatedWords = rawWords.filter(w => w.length < 12 && w.length > 2);
  
      if (generatedWords.length < 10) {
        // Fallback for extremely sparse mappings
        generatedWords = ["error", "dictionary", "too", "small", "cascade", "failed"];
      }
  
      showResults = false;
      isPlaying = true;
    }
  
    function handleGameOver(score: number, accuracy: number) {
      isPlaying = false;
      finalScore = score;
      finalAccuracy = accuracy;
      showResults = true;
      if (score > 1000) {
         confettiCelebration();
      }
    }
  </script>
  
  <svelte:head>
    <title>Raindrop | TypeForge</title>
  </svelte:head>
  
  <div class="h-[calc(100vh-80px)] w-full max-w-screen-xl mx-auto flex flex-col p-4 md:p-8">
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-black uppercase tracking-tighter text-on-surface font-headline">Cascade Protocol</h1>
        <p class="text-on-surface-variant text-sm mt-1">Intercept dropping packets natively mapped to your localized language syntax.</p>
      </div>
      {#if isPlaying}
        <button 
          onclick={() => isPlaying = false}
          class="bg-surface-container hover:bg-surface-container-high px-4 py-2 font-bold uppercase tracking-wider text-sm rounded shadow-sm text-error transition-colors"
        >
          Abort Mission
        </button>
      {/if}
    </div>
  
    <div class="flex-1 flex flex-col items-center justify-center relative">
      {#if !isPlaying && !showResults}
        <div class="w-full max-w-md bg-surface-container-low p-8 border border-outline-variant/30 rounded-2xl shadow-xl flex flex-col gap-6 text-center">
          <div class="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-4xl mb-2">
            🌧️
          </div>
          <div>
            <h2 class="text-2xl font-black font-headline text-on-surface mb-2">Initialize Cascade</h2>
            <p class="text-sm text-on-surface-variant leading-relaxed">Ensure you validate the correct word array. Dropped packets will strictly fail terminal boundaries and breach the floor. You have 3 lives.</p>
          </div>
  
          <div class="flex flex-col gap-2 text-left">
            <label for="lang" class="text-xs uppercase tracking-widest font-bold text-on-surface-variant ml-1">Dictionaries</label>
            <select id="lang" bind:value={selectedLanguage} class="bg-surface-container px-4 py-3 border border-transparent focus:border-primary focus:outline-none rounded-xl text-on-surface shadow-inner font-bold font-body appearance-none cursor-pointer">
              {#each availableLanguages as lang}
                <option value={lang.code}>{lang.nativeName}</option>
              {/each}
            </select>
          </div>
  
          <button 
            onclick={startGame}
            class="mt-4 bg-primary text-background font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-[0_4px_14px_rgba(255,197,108,0.4)] hover:-translate-y-1 hover:shadow-[0_6px_20px_rgba(255,197,108,0.6)] transition-all"
          >
            Deploy Drop
          </button>
        </div>
      {/if}
  
      {#if showResults}
        <div class="w-full max-w-md bg-surface-container-low p-8 border border-outline-variant/30 rounded-2xl shadow-xl flex flex-col gap-6 text-center animate-in fade-in slide-in-from-bottom-8">
           <h2 class="text-4xl font-black text-primary font-headline uppercase tracking-tighter">Terminal Breach</h2>
           
           <div class="grid grid-cols-2 gap-4 my-2">
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant/20 shadow-inner">
                <div class="text-xs uppercase font-bold text-on-surface-variant tracking-wider mb-1">Total Score</div>
                <div class="text-3xl font-black text-on-surface">{finalScore}</div>
              </div>
              <div class="bg-surface-container p-4 rounded-xl border border-outline-variant/20 shadow-inner">
                <div class="text-xs uppercase font-bold text-on-surface-variant tracking-wider mb-1">Accuracy</div>
                <div class="text-3xl font-black {finalAccuracy > 90 ? 'text-primary' : 'text-error'}">{finalAccuracy}%</div>
              </div>
           </div>
  
           <button 
             onclick={startGame}
             class="bg-surface-container hover:bg-surface-container-high border border-outline-variant/50 text-on-surface font-bold uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
           >
             🔄 Run Again
           </button>
        </div>
      {/if}
  
      {#if isPlaying}
        <RaindropEngine 
          words={generatedWords} 
          onGameOver={handleGameOver} 
          class="shadow-2xl animate-in fade-in zoom-in-95 duration-500" 
        />
      {/if}
    </div>
  </div>
