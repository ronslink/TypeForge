<script lang="ts">
  interface Props {
    wpm: number;
    accuracy: number;
    onViewCertificate?: () => void;
  }

  const { wpm, accuracy, onViewCertificate }: Props = $props();

  // Define the milestone requirements
  const milestones = [
    {
      id: 'intermediate',
      name: 'Intermediate',
      reqWpm: 35,
      reqAcc: 95,
      color: 'border-secondary text-secondary',
      bg: 'bg-secondary/10',
      icon: 'book',
      description: 'Solid foundation'
    },
    {
      id: 'proficient',
      name: 'Proficient',
      reqWpm: 60,
      reqAcc: 95,
      color: 'border-primary text-primary',
      bg: 'bg-primary/10',
      icon: 'award',
      description: 'Professional grade'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      reqWpm: 80,
      reqAcc: 98,
      color: 'border-tertiary text-tertiary',
      bg: 'bg-tertiary/10',
      icon: 'flame',
      description: 'Elite typist'
    }
  ];

  // Check if a milestone is unlocked
  function isUnlocked(reqWpm: number, reqAcc: number) {
    return wpm >= reqWpm && accuracy >= reqAcc;
  }

  const hasProficient = $derived(isUnlocked(60, 95));

</script>

<div class="milestones-container">
  <div class="flex items-center justify-between mb-6">
    <div>
      <h3 class="font-headline text-xl text-on-surface">Milestone Certifications</h3>
      <p class="text-sm text-on-surface-variant mt-1">Unlock badges by achieving WPM and Accuracy standards.</p>
    </div>
    {#if hasProficient && onViewCertificate}
      <button 
        class="notched-button bg-primary text-background px-4 py-2 font-label text-xs font-bold uppercase tracking-widest hover:-translate-y-0.5 transition-transform"
        onclick={onViewCertificate}
      >
        View Certificate →
      </button>
    {/if}
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each milestones as m}
      {@const unlocked = isUnlocked(m.reqWpm, m.reqAcc)}
      <div class="badge-card border {unlocked ? m.color : 'border-outline-variant/30 opacity-60 grayscale'} {unlocked ? m.bg : 'bg-surface-container'}">
        <div class="mb-4">
          <span class="milestone-icon mb-2 {unlocked ? m.color : 'text-on-surface-variant'}" aria-hidden="true">
            {#if m.icon === 'book'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
              </svg>
            {:else if m.icon === 'award'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="6" />
                <path d="M15.5 13 17 22l-5-3-5 3 1.5-9" />
              </svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A4.5 4.5 0 0 0 12 22a4.5 4.5 0 0 0 4.5-7.5c-1.5-2-1.25-4.25-.5-6.5-2.5 1.25-4.5 3.5-4 7-1.5-1-2.5-2.5-2.5-5-1.5 1.5-2.5 3-1 5z" />
              </svg>
            {/if}
          </span>
          <h4 class="font-headline text-lg {unlocked ? 'text-on-surface' : 'text-on-surface-variant'}">{m.name}</h4>
          <p class="text-xs font-label uppercase tracking-widest {unlocked ? 'text-on-surface-variant' : 'text-on-surface-variant/50'}">{m.description}</p>
        </div>
        <div class="flex flex-col gap-1 mt-auto">
          <div class="flex justify-between items-center text-sm">
            <span class="text-on-surface-variant">Speed</span>
            <span class="font-mono font-bold {unlocked ? '' : 'text-on-surface-variant'}">{m.reqWpm} WPM</span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-on-surface-variant">Accuracy</span>
            <span class="font-mono font-bold {unlocked ? '' : 'text-on-surface-variant'}">{m.reqAcc}%</span>
          </div>
        </div>
        {#if !unlocked}
          <div class="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center rounded transition-opacity duration-300">
            <span class="lock-icon text-on-surface-variant/80" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .milestones-container {
    background: var(--surface-container-low, #1d2025);
    border: 1px solid var(--outline-variant, #48464f);
    border-radius: 0.5rem;
    padding: 1.5rem;
  }
  .badge-card {
    position: relative;
    border-radius: 0.5rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    min-height: 180px;
    overflow: hidden;
    transition: all 0.3s ease;
  }
  .notched-button {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }
  .milestone-icon,
  .lock-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .milestone-icon {
    width: 2.5rem;
    height: 2.5rem;
  }
  .lock-icon {
    width: 2rem;
    height: 2rem;
  }
  .milestone-icon svg,
  .lock-icon svg {
    width: 100%;
    height: 100%;
  }
</style>
