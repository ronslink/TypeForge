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
      icon: 'school',
      description: 'Solid foundation'
    },
    {
      id: 'proficient',
      name: 'Proficient',
      reqWpm: 60,
      reqAcc: 95,
      color: 'border-primary text-primary',
      bg: 'bg-primary/10',
      icon: 'workspace_premium',
      description: 'Professional grade'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      reqWpm: 80,
      reqAcc: 98,
      color: 'border-tertiary text-tertiary',
      bg: 'bg-tertiary/10',
      icon: 'local_fire_department',
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
          <span class="material-symbols-outlined text-4xl mb-2 {unlocked ? m.color : 'text-on-surface-variant'}">{m.icon}</span>
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
            <span class="material-symbols-outlined text-on-surface-variant/80 text-3xl">lock</span>
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
</style>
