<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { ProgressRing, StatCard } from '@typeforge/ui';
  import { createApiClient } from '@typeforge/api/client';
  import type { ProgressResponse, ProgressStatsResponse, Session } from '@typeforge/api/client';

  // Auth state
  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);

  // Data states
  let progress: ProgressResponse | null = $state(null);
  let stats: ProgressStatsResponse | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  // Canvas reference for WPM chart
  let chartCanvas: HTMLCanvasElement;

  // Level calculation: every 1000 XP = 1 level
  function calculateLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1;
  }

  // Calculate progress to next level (0-100)
  function calculateLevelProgress(xp: number): number {
    const levelXp = xp % 1000;
    return (levelXp / 1000) * 100;
  }

  // Format date for display
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Format language code for display
  function formatLanguage(code: string): string {
    const languages: Record<string, string> = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      de: 'German',
      it: 'Italian',
      pt: 'Portuguese',
      ru: 'Russian',
      zh: 'Chinese',
      ja: 'Japanese',
      ko: 'Korean',
    };
    return languages[code] || code.toUpperCase();
  }

  // Draw WPM history chart on canvas
  function drawChart(sessions: Session[]) {
    if (!chartCanvas || sessions.length === 0) return;

    const ctx = chartCanvas.getContext('2d');
    if (!ctx) return;

    // Get last 20 sessions with WPM data, sorted by date
    const chartData = sessions
      .filter((s) => s.wpm !== null && s.wpm !== undefined)
      .sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime())
      .slice(-20);

    if (chartData.length === 0) return;

    const width = chartCanvas.width;
    const height = chartCanvas.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate scales
    const maxWpm = Math.max(...chartData.map((s) => s.wpm || 0), 100);
    const minWpm = Math.min(...chartData.map((s) => s.wpm || 0), 0);
    const wpmRange = maxWpm - minWpm || 1;

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = 'rgba(225, 226, 234, 0.6)';
      ctx.font = '11px "Space Grotesk", monospace';
      ctx.textAlign = 'right';
      const wpmValue = Math.round(maxWpm - (wpmRange * i) / 5);
      ctx.fillText(`${wpmValue}`, padding.left - 8, y + 4);
    }

    // Draw line chart
    if (chartData.length > 1) {
      ctx.strokeStyle = '#ffc56c'; // Primary amber
      ctx.lineWidth = 2;
      ctx.beginPath();

      chartData.forEach((session, index) => {
        const x = padding.left + (chartWidth * index) / (chartData.length - 1);
        const wpm = session.wpm || 0;
        const y = padding.top + chartHeight - ((wpm - minWpm) / wpmRange) * chartHeight;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw area under line
      ctx.fillStyle = 'rgba(255, 197, 108, 0.1)';
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartHeight);

      chartData.forEach((session, index) => {
        const x = padding.left + (chartWidth * index) / (chartData.length - 1);
        const wpm = session.wpm || 0;
        const y = padding.top + chartHeight - ((wpm - minWpm) / wpmRange) * chartHeight;
        ctx.lineTo(x, y);
      });

      ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
      ctx.closePath();
      ctx.fill();
    }

    // Draw data points
    chartData.forEach((session, index) => {
      const x = padding.left + (chartWidth * index) / (chartData.length - 1);
      const wpm = session.wpm || 0;
      const y = padding.top + chartHeight - ((wpm - minWpm) / wpmRange) * chartHeight;

      // Outer circle
      ctx.fillStyle = '#111319';
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Inner circle
      ctx.fillStyle = '#ffc56c';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // X-axis labels (show first, middle, last dates)
    ctx.fillStyle = 'rgba(225, 226, 234, 0.6)';
    ctx.font = '10px "Space Grotesk", monospace';
    ctx.textAlign = 'center';

    const labelIndices = [0, Math.floor(chartData.length / 2), chartData.length - 1];
    labelIndices.forEach((i) => {
      if (i < chartData.length) {
        const x = padding.left + (chartWidth * i) / (chartData.length - 1);
        const date = new Date(chartData[i].startedAt);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, height - padding.bottom + 20);
      }
    });

    // Axis titles
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = 'rgba(225, 226, 234, 0.8)';
    ctx.font = '12px "Space Grotesk", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WPM', 0, 0);
    ctx.restore();
  }

  // Fetch data on mount
  onMount(async () => {
    if (!isSignedIn) {
      loading = false;
      return;
    }

    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const defaultHeaders = new Headers(init?.headers);
        if (token) defaultHeaders.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: defaultHeaders });
      };
      const api = createApiClient('/', authFetch);

      const [progressRes, statsRes] = await Promise.all([
        api.api.v1.progress.$get(),
        api.api.v1.progress.stats.$get(),
      ]);

      if (progressRes.ok) {
        progress = await progressRes.json();
      }

      if (statsRes.ok) {
        stats = await statsRes.json();
      }
    } catch (e) {
      error = 'Failed to load progress data';
      console.error('Error fetching progress:', e);
    } finally {
      loading = false;
    }
  });

  // Redraw chart when progress data changes
  $effect(() => {
    if (progress?.history && chartCanvas) {
      drawChart(progress.history);
    }
  });

  // Derived values
  let currentLevel = $derived(progress ? calculateLevel(progress.xp) : 1);
  let levelProgress = $derived(progress ? calculateLevelProgress(progress.xp) : 0);
  let recentSessions = $derived(progress?.history?.slice(0, 10) || []);
</script>

<svelte:head>
  <title>Progress — TypeForge</title>
</svelte:head>

<div class="max-w-7xl mx-auto px-6 py-12">
  <h1 class="font-headline text-4xl mb-8">Your Progress</h1>

  {#if !isSignedIn}
    <!-- Not signed in state -->
    <div class="bg-surface-container p-12 text-center">
      <div class="mb-6">
        <ProgressRing progress={0} size={120} />
      </div>
      <h2 class="font-headline text-2xl mb-4">Sign in to see your progress</h2>
      <p class="text-on-surface-variant mb-6 max-w-md mx-auto">
        Track your typing speed, accuracy, and streak. Your progress is saved when you sign in.
      </p>
      <button
        onclick={() => ctx?.clerk?.openSignIn({ redirectUrl: '/progress' })}
        class="notched-button bg-primary text-on-primary px-6 py-3 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors"
      >
        Sign In
      </button>
    </div>
  {:else if loading}
    <!-- Loading state -->
    <div class="bg-surface-container p-12 text-center">
      <div class="animate-pulse">
        <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-surface-container-high"></div>
        <div class="h-8 bg-surface-container-high rounded w-48 mx-auto mb-4"></div>
        <div class="h-4 bg-surface-container-high rounded w-64 mx-auto"></div>
      </div>
    </div>
  {:else if error}
    <!-- Error state -->
    <div class="bg-surface-container p-12 text-center">
      <p class="text-error mb-4">{error}</p>
      <button
        onclick={() => window.location.reload()}
        class="notched-button bg-primary text-on-primary px-4 py-2 font-label text-sm font-bold hover:bg-primary-fixed-dim transition-colors"
      >
        Retry
      </button>
    </div>
  {:else}
    <!-- Progress Ring Section -->
    <div class="flex flex-col items-center mb-12">
      <div class="relative">
        <ProgressRing
          progress={levelProgress}
          size={180}
          strokeWidth={12}
          variant="primary"
          showLabel={false}
        />
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="font-label text-6xl font-bold text-primary">{currentLevel}</span>
          <span class="font-label text-sm text-on-surface-variant uppercase tracking-widest mt-1"
            >Level</span
          >
        </div>
      </div>
      <div class="mt-4 text-center">
        <span class="font-label text-sm text-on-surface-variant">
          {progress?.xp || 0} XP • {1000 - ((progress?.xp || 0) % 1000)} XP to next level
        </span>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      <StatCard label="Total Sessions" value={progress?.totalSessions || 0} variant="default" />
      <StatCard label="Avg WPM" value={Math.round(progress?.avgWpm || 0)} variant="primary" />
      <StatCard
        label="Avg Accuracy"
        value={`${Math.round(progress?.avgAccuracy || 0)}%`}
        variant="secondary"
      />
      <StatCard
        label="Current Streak"
        value={progress?.streak || 0}
        unit="days"
        variant="primary"
      />
    </div>

    <!-- WPM History Chart -->
    <div class="bg-surface-container p-6 mb-8">
      <h2 class="font-headline text-xl mb-4">WPM Over Time</h2>
      <div class="h-64 w-full">
        {#if progress?.history && progress.history.length > 0}
          <canvas bind:this={chartCanvas} width={800} height={256} class="w-full h-full"></canvas>
        {:else}
          <div class="h-full flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/30 bg-surface-container-low min-h-[200px] mt-2">
            <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4">monitoring</span>
            <p class="font-label text-sm uppercase tracking-widest text-on-surface-variant/60">No Kinetic Data Found</p>
            <p class="font-body text-xs text-on-surface-variant mt-2 max-w-xs text-center">Complete your first practice session to initialize your WPM telemetry graph.</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- Recent Sessions -->
    <div class="bg-surface-container p-6">
      <h2 class="font-headline text-xl mb-4">Recent Sessions</h2>
      {#if recentSessions.length > 0}
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-outline-variant">
                <th
                  class="text-left py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant"
                  >Date</th
                >
                <th
                  class="text-left py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant"
                  >Language</th
                >
                <th
                  class="text-right py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant"
                  >WPM</th
                >
                <th
                  class="text-right py-3 px-4 font-label text-xs uppercase tracking-widest text-on-surface-variant"
                  >Accuracy</th
                >
              </tr>
            </thead>
            <tbody>
              {#each recentSessions as session}
                <tr
                  class="border-b border-outline-variant/50 hover:bg-surface-container-high/50 transition-colors"
                >
                  <td class="py-3 px-4 font-body text-sm">{formatDate(session.startedAt)}</td>
                  <td class="py-3 px-4 font-body text-sm">{formatLanguage(session.languageCode)}</td
                  >
                  <td class="py-3 px-4 font-body text-sm text-right font-bold text-primary">
                    {session.wpm || '--'}
                  </td>
                  <td class="py-3 px-4 font-body text-sm text-right">
                    {session.accuracy ? `${Math.round(session.accuracy)}%` : '--'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="text-on-surface-variant">No sessions yet. Start typing to track your progress!</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  .max-w-7xl {
    max-width: 80rem;
  }

  .notched-button {
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>
