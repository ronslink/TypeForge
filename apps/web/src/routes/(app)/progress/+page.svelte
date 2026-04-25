<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { ProgressRing, StatCard, WeaknessHeatmap } from '@typeforge/ui';
  import { createApiClient } from '@typeforge/api/client';

  // Auth state
  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);

  // Data states
  let progress: any = $state(null);
  let stats: any = $state(null);
  let weakKeys: Array<{ key: string; accuracy: number; masteryLevel: number; totalAttempts: number; lastPracticedAt: string | null }> = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  // Canvas reference for WPM chart
  let chartCanvas: HTMLCanvasElement;

  // Level calculation: every 1000 XP = 1 level
  function calculateLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  }
  function calculateLevelProgress(xp: number): number {
    return ((xp % 1000) / 1000) * 100;
  }

  // Format date for display
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function formatLanguage(code: string): string {
    const map: Record<string, string> = {
      en: 'English', es: 'Spanish', fr: 'French', de: 'German',
      it: 'Italian', pt: 'Portuguese', ru: 'Russian',
      zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
    };
    return map[code] || code.toUpperCase();
  }

  function formatRelative(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  // Improvement label
  function improvementLabel(pct: number): string {
    if (pct > 0) return `+${pct}% vs last week`;
    if (pct < 0) return `${pct}% vs last week`;
    return 'Same as last week';
  }

  function improvementColor(pct: number): string {
    if (pct > 0) return 'text-green-400';
    if (pct < 0) return 'text-error';
    return 'text-on-surface-variant';
  }

  // Draw WPM history chart
  function drawChart(sessions: any[]) {
    if (!chartCanvas || sessions.length === 0) return;
    const c = chartCanvas.getContext('2d');
    if (!c) return;

    const chartData = sessions
      .filter((s) => s.wpm != null)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .slice(-20);

    if (chartData.length === 0) return;

    const W = chartCanvas.width, H = chartCanvas.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 50 };
    const cW = W - pad.left - pad.right;
    const cH = H - pad.top - pad.bottom;

    c.clearRect(0, 0, W, H);

    const maxW = Math.max(...chartData.map((s) => s.wpm || 0), 80);
    const minW = Math.min(...chartData.map((s) => s.wpm || 0), 0);
    const range = maxW - minW || 1;

    // Grid
    c.strokeStyle = 'rgba(255,255,255,0.07)';
    c.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = pad.top + (cH * i) / 5;
      c.beginPath(); c.moveTo(pad.left, y); c.lineTo(W - pad.right, y); c.stroke();
      c.fillStyle = 'rgba(202,196,208,0.5)';
      c.font = '11px "Space Grotesk",monospace';
      c.textAlign = 'right';
      c.fillText(`${Math.round(maxW - (range * i) / 5)}`, pad.left - 8, y + 4);
    }

    // Gradient area
    const grad = c.createLinearGradient(0, pad.top, 0, pad.top + cH);
    grad.addColorStop(0, 'rgba(255,197,108,0.25)');
    grad.addColorStop(1, 'rgba(255,197,108,0)');

    const x = (i: number) => pad.left + (cW * i) / Math.max(chartData.length - 1, 1);
    const y = (wpm: number) => pad.top + cH - ((wpm - minW) / range) * cH;

    if (chartData.length > 1) {
      // Line
      c.strokeStyle = '#ffc56c';
      c.lineWidth = 2.5;
      c.lineJoin = 'round';
      c.beginPath();
      chartData.forEach((s, i) => i === 0 ? c.moveTo(x(i), y(s.wpm || 0)) : c.lineTo(x(i), y(s.wpm || 0)));
      c.stroke();

      // Fill
      c.fillStyle = grad;
      c.beginPath();
      c.moveTo(pad.left, pad.top + cH);
      chartData.forEach((s, i) => c.lineTo(x(i), y(s.wpm || 0)));
      c.lineTo(pad.left + cW, pad.top + cH);
      c.closePath();
      c.fill();
    }

    // Dots
    chartData.forEach((s, i) => {
      c.fillStyle = '#111319';
      c.beginPath(); c.arc(x(i), y(s.wpm || 0), 5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#ffc56c';
      c.beginPath(); c.arc(x(i), y(s.wpm || 0), 3, 0, Math.PI * 2); c.fill();
    });

    // X labels
    c.fillStyle = 'rgba(202,196,208,0.5)';
    c.font = '10px "Space Grotesk",monospace';
    c.textAlign = 'center';
    [0, Math.floor(chartData.length / 2), chartData.length - 1].forEach((i) => {
      if (i < chartData.length) {
        const d = new Date(chartData[i].startedAt);
        c.fillText(`${d.getMonth() + 1}/${d.getDate()}`, x(i), H - pad.bottom + 20);
      }
    });
  }

  // Fetch all data in parallel
  onMount(async () => {
    if (!isSignedIn) { loading = false; return; }
    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const h = new Headers(init?.headers);
        if (token) h.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: h });
      };
      const api = createApiClient('/', authFetch);

      const [progressRes, statsRes, weakRes] = await Promise.all([
        api.api.v1.progress.$get(),
        api.api.v1.progress.stats.$get(),
        authFetch('/api/v1/progress/weakness'),
      ]);

      if (progressRes.ok) progress = await progressRes.json();
      if (statsRes.ok)    stats    = await statsRes.json();
      if (weakRes.ok) {
        const j = await weakRes.json();
        weakKeys = j.weakKeys ?? [];
      }
    } catch (e) {
      error = 'Failed to load progress data';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  $effect(() => {
    if (progress?.history && chartCanvas) drawChart(progress.history);
  });

  let currentLevel  = $derived(progress ? calculateLevel(progress.xp) : 1);
  let levelProgress = $derived(progress ? calculateLevelProgress(progress.xp) : 0);
  let recentSessions = $derived(progress?.history?.slice(0, 10) || []);

  // Map API weakness shape → WeaknessHeatmap shape
  let heatmapData = $derived(
    weakKeys.map((k) => ({
      key:       k.key,
      accuracy:  k.accuracy,
      frequency: k.totalAttempts,
      avgTime:   0,
    }))
  );

  // Top 5 worst keys for the drill CTA
  let topWeakKeys = $derived(
    weakKeys.slice(0, 5).map((k) => k.key.toUpperCase())
  );
</script>

<svelte:head>
  <title>Progress — TypeForge</title>
  <meta name="description" content="Track your typing performance, WPM trends, accuracy, streak, and key weaknesses." />
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-2">Your Progress</h1>
  <p class="text-on-surface-variant text-sm mb-10">Track your speed, accuracy, streaks, and key-level mastery.</p>

  {#if !isSignedIn}
    <div class="bg-surface-container p-12 text-center border border-outline-variant/30">
      <div class="mb-6"><ProgressRing progress={0} size={120} /></div>
      <h2 class="font-headline text-2xl mb-4">Sign in to see your progress</h2>
      <p class="text-on-surface-variant mb-6 max-w-md mx-auto text-sm">
        Track your WPM, accuracy, and streak. Your data is saved when you sign in.
      </p>
      <button
        onclick={() => ctx?.clerk?.openSignIn({ fallbackRedirectUrl: '/progress' })}
        class="notched-button bg-primary text-on-primary px-6 py-3 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors"
      >
        Sign In
      </button>
    </div>

  {:else if loading}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-pulse">
      {#each [1,2,3,4] as _}
        <div class="h-24 bg-surface-container rounded"></div>
      {/each}
    </div>
    <div class="h-64 bg-surface-container rounded animate-pulse mb-6"></div>
    <div class="h-48 bg-surface-container rounded animate-pulse"></div>

  {:else if error}
    <div class="bg-surface-container p-12 text-center">
      <p class="text-error mb-4">{error}</p>
      <button
        onclick={() => window.location.reload()}
        class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold"
      >Retry</button>
    </div>

  {:else}

    <!-- ──────────────────────────────────── Top hero ────────────────────────────────── -->
    <div class="hero-strip mb-10">
      <!-- Level ring -->
      <div class="level-card">
        <div class="relative">
          <ProgressRing progress={levelProgress} size={140} strokeWidth={10} variant="primary" showLabel={false} />
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="font-label text-5xl font-bold text-primary leading-none">{currentLevel}</span>
            <span class="font-label text-xs text-on-surface-variant uppercase tracking-widest mt-1">Level</span>
          </div>
        </div>
        <p class="text-xs text-on-surface-variant mt-3 text-center">
          {progress?.xp ?? 0} XP · {1000 - ((progress?.xp ?? 0) % 1000)} to next
        </p>
      </div>

      <!-- Stats grid -->
      <div class="stats-grid">
        <StatCard label="Total Sessions" value={progress?.totalSessions ?? 0} variant="default" />
        <StatCard label="Avg WPM"        value={Math.round(progress?.avgWpm ?? 0)} variant="primary" />
        <StatCard label="Avg Accuracy"   value={`${Math.round(progress?.avgAccuracy ?? 0)}%`} variant="secondary" />
        <StatCard label="Streak"         value={progress?.streak ?? 0} unit="days" variant="primary" />
      </div>
    </div>

    <!-- ──────────────────────────────── This week vs last ───────────────────────────── -->
    {#if stats}
      <div class="bg-surface-container border border-outline-variant/20 p-6 mb-8">
        <div class="flex items-center justify-between mb-5">
          <h2 class="font-headline text-xl">Weekly Comparison</h2>
          <span class="text-xs {improvementColor(stats.improvement)} font-bold uppercase tracking-wider">
            {improvementLabel(stats.improvement)}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <!-- This week -->
          <div class="week-card this-week">
            <div class="week-label">This week</div>
            <div class="week-metrics">
              <div class="metric">
                <span class="metric-val">{stats.thisWeek.sessions}</span>
                <span class="metric-key">sessions</span>
              </div>
              <div class="metric">
                <span class="metric-val text-primary">{Math.round(stats.thisWeek.wpm)}</span>
                <span class="metric-key">avg WPM</span>
              </div>
              <div class="metric">
                <span class="metric-val text-secondary">{Math.round(stats.thisWeek.accuracy)}%</span>
                <span class="metric-key">accuracy</span>
              </div>
            </div>
          </div>

          <!-- Last week -->
          <div class="week-card last-week">
            <div class="week-label text-on-surface-variant">Last week</div>
            <div class="week-metrics">
              <div class="metric">
                <span class="metric-val text-on-surface-variant">{stats.lastWeek.sessions}</span>
                <span class="metric-key">sessions</span>
              </div>
              <div class="metric">
                <span class="metric-val text-on-surface-variant">{Math.round(stats.lastWeek.wpm)}</span>
                <span class="metric-key">avg WPM</span>
              </div>
              <div class="metric">
                <span class="metric-val text-on-surface-variant">{Math.round(stats.lastWeek.accuracy)}%</span>
                <span class="metric-key">accuracy</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- ──────────────────────────────────── WPM Chart ──────────────────────────────── -->
    <div class="bg-surface-container border border-outline-variant/20 p-6 mb-8">
      <h2 class="font-headline text-xl mb-4">WPM Over Time</h2>
      <div class="h-64 w-full">
        {#if progress?.history && progress.history.length > 0}
          <canvas bind:this={chartCanvas} width={800} height={256} class="w-full h-full"></canvas>
        {:else}
          <div class="h-full flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/20 min-h-[200px]">
            <p class="font-label text-sm uppercase tracking-widest text-on-surface-variant/50">No sessions yet</p>
            <p class="font-body text-xs text-on-surface-variant/40 mt-2">Complete a lesson to start tracking your WPM.</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- ──────────────────────────────── Key Weakness Heatmap ───────────────────────── -->
    <div class="bg-surface-container border border-outline-variant/20 mb-8">
      {#if weakKeys.length > 0}
        <WeaknessHeatmap weaknesses={heatmapData} showLabels={true}>
          <!-- Weak key drill CTA -->
          <div class="drill-cta">
            <div>
              <p class="text-sm font-bold text-on-surface mb-1">
                Your weakest keys: {#each topWeakKeys as k, i}<span class="key-chip">{k}</span>{#if i < topWeakKeys.length - 1} {/if}{/each}
              </p>
              <p class="text-xs text-on-surface-variant">Practice these with a targeted adaptive drill.</p>
            </div>
            <a
              href="/practice"
              class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-xs font-bold uppercase tracking-wider hover:bg-primary-fixed-dim transition-colors whitespace-nowrap"
            >
              Drill Weak Keys →
            </a>
          </div>
        </WeaknessHeatmap>

      {:else}
        <!-- No weakness data yet -->
        <div class="p-8 text-center border-2 border-dashed border-outline-variant/20 m-6">
          <p class="font-label text-sm uppercase tracking-widest text-on-surface-variant/50 mb-2">Key Weakness Map</p>
          <p class="font-body text-xs text-on-surface-variant/40 max-w-xs mx-auto">
            Complete more lessons so we can identify which keys need attention.
          </p>
        </div>
      {/if}
    </div>

    <!-- ──────────────────────────────────── Session Table ──────────────────────────── -->
    <div class="bg-surface-container border border-outline-variant/20 p-6">
      <h2 class="font-headline text-xl mb-4">Recent Sessions</h2>
      {#if recentSessions.length > 0}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-outline-variant">
                <th class="text-left py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Date</th>
                <th class="text-left py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Language</th>
                <th class="text-right py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">WPM</th>
                <th class="text-right py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant">Accuracy</th>
                <th class="text-right py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant hidden sm:table-cell">Duration</th>
              </tr>
            </thead>
            <tbody>
              {#each recentSessions as session}
                <tr class="border-b border-outline-variant/40 hover:bg-surface-container-high/40 transition-colors">
                  <td class="py-3 px-4 font-body text-sm text-on-surface-variant">{formatDate(session.startedAt)}</td>
                  <td class="py-3 px-4 font-body text-sm">{formatLanguage(session.languageCode)}</td>
                  <td class="py-3 px-4 text-right font-bold text-primary">{session.wpm ?? '--'}</td>
                  <td class="py-3 px-4 text-right text-sm {(session.accuracy ?? 0) >= 95 ? 'text-green-400' : (session.accuracy ?? 0) >= 80 ? 'text-secondary' : 'text-error'}">
                    {session.accuracy ? `${Math.round(session.accuracy)}%` : '--'}
                  </td>
                  <td class="py-3 px-4 text-right text-sm text-on-surface-variant hidden sm:table-cell">
                    {session.durationSeconds ? `${Math.round(session.durationSeconds / 60)}m` : '--'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <div class="py-12 text-center border-2 border-dashed border-outline-variant/20">
          <p class="font-label text-sm uppercase tracking-widest text-on-surface-variant/50">No sessions yet</p>
          <a href="/learn" class="inline-block mt-4 text-primary text-sm hover:underline">Start your first lesson →</a>
        </div>
      {/if}
    </div>

  {/if}
</div>

<style>
  /* Hero layout */
  .hero-strip {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
  }
  .level-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }
  .stats-grid {
    flex: 1;
    min-width: 260px;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  /* Week comparison */
  .week-card {
    background: var(--surface-container-low, #1d2025);
    border: 1px solid var(--outline-variant, #48464f);
    border-radius: 0.5rem;
    padding: 1.25rem;
  }
  .week-card.this-week { border-color: rgba(255,197,108,0.3); }
  .week-label {
    font-family: 'Space Grotesk', monospace;
    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--primary, #ffc56c);
    margin-bottom: 0.75rem;
  }
  .week-card.last-week .week-label { color: var(--on-surface-variant, #cac4d0); }
  .week-metrics { display: flex; gap: 1.5rem; flex-wrap: wrap; }
  .metric { display: flex; flex-direction: column; }
  .metric-val { font-family: 'Space Grotesk', monospace; font-size: 1.5rem; font-weight: 800; line-height: 1; }
  .metric-key { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant, #cac4d0); margin-top: 0.2rem; }

  /* Drill CTA */
  .drill-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
    padding: 1rem 1.5rem;
    background: rgba(255,197,108,0.06);
    border-top: 1px solid rgba(255,197,108,0.15);
    margin-top: 1rem;
  }
  .key-chip {
    display: inline-block;
    background: rgba(255,197,108,0.15);
    color: var(--primary, #ffc56c);
    font-family: 'Space Grotesk', monospace;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    border: 1px solid rgba(255,197,108,0.25);
  }

  /* Shared */
  .notched-button {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
    display: inline-block;
  }

  .animate-pulse { animation: pulse 2s cubic-bezier(0.4,0,0.6,1) infinite; }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

  @media (max-width: 640px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .week-metrics { gap: 1rem; }
  }
</style>
