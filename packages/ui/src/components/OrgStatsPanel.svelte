<script lang="ts">
  import ProgressBar from './ProgressBar.svelte';
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';

  interface OrgData {
    name: string;
    plan: 'free' | 'starter' | 'pro' | 'enterprise';
    seatsUsed: number;
    seatsTotal: number;
    totalStudents: number;
    totalSessions: number;
    avgWpm: number;
    avgAccuracy: number;
    growth: number; // Percentage growth
  }

  interface GrowthPoint {
    date: string;
    students: number;
  }

  interface Props {
    org: OrgData;
    growthData?: GrowthPoint[];
    onUpgrade?: () => void;
  }

  let { org, growthData = [], onUpgrade }: Props = $props();

  // Canvas ref for growth chart
  let growthCanvas: HTMLCanvasElement | undefined = $state();

  // Derived values
  const seatUsagePercent = $derived(
    org.seatsTotal > 0 ? Math.round((org.seatsUsed / org.seatsTotal) * 100) : 0
  );

  const isSeatsFull = $derived(org.seatsUsed >= org.seatsTotal);

  // Health Score (0-100) based on avg accuracy * engagement factor
  const healthScore = $derived(() => {
    const accuracyFactor = org.avgAccuracy / 100;
    const engagementFactor = Math.min(org.totalSessions / (org.totalStudents * 10 || 1), 1);
    const score = Math.round(accuracyFactor * engagementFactor * 100);
    return Math.min(100, Math.max(0, score));
  });

  const healthStatus = $derived(() => {
    const score = healthScore();
    if (score >= 80) return { label: 'Excellent', color: '#4ade80' };
    if (score >= 60) return { label: 'Good', color: '#f0a500' };
    if (score >= 40) return { label: 'Fair', color: '#ff8c42' };
    return { label: 'Needs Attention', color: '#ef4444' };
  });

  // Plan display
  const planDisplay = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };

  // Generate growth chart
  $effect(() => {
    if (!growthCanvas || growthData.length === 0) return;

    const ctx = growthCanvas.getContext('2d');
    if (!ctx) return;

    const width = growthCanvas.width;
    const height = growthCanvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // Find max students for scaling
    const maxStudents = Math.max(...growthData.map(d => d.students), 10);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * i / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw growth line
    ctx.strokeStyle = '#41e4c0';
    ctx.lineWidth = 3;
    ctx.beginPath();

    growthData.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * i / (growthData.length - 1 || 1);
      const y = height - padding - (point.students / maxStudents) * (height - 2 * padding);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();

    // Fill area under line
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fillStyle = 'rgba(65, 228, 192, 0.1)';
    ctx.fill();

    // Draw points
    growthData.forEach((point, i) => {
      const x = padding + (width - 2 * padding) * i / (growthData.length - 1 || 1);
      const y = height - padding - (point.students / maxStudents) * (height - 2 * padding);

      ctx.fillStyle = '#41e4c0';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '11px JetBrains Mono';
    ctx.textAlign = 'center';

    // X-axis labels (show first, middle, last)
    const labelIndices = [0, Math.floor(growthData.length / 2), growthData.length - 1];
    labelIndices.forEach(i => {
      if (growthData[i]) {
        const x = padding + (width - 2 * padding) * i / (growthData.length - 1 || 1);
        ctx.fillText(growthData[i].date, x, height - 12);
      }
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * i / 4;
      const value = Math.round(maxStudents * (4 - i) / 4);
      ctx.fillText(value.toString(), padding - 8, y + 4);
    }
  });
</script>

<div class="org-stats-panel">
  <!-- Header -->
  <header class="panel-header">
    <div class="org-info">
      <h2 class="org-name">{org.name}</h2>
      <Badge variant="primary">{planDisplay[org.plan]}</Badge>
    </div>
    {#if isSeatsFull}
      <div class="upgrade-prompt">
        <span class="upgrade-text">Seats full!</span>
        <Button variant="primary" size="sm" onclick={onUpgrade}>Upgrade</Button>
      </div>
    {/if}
  </header>

  <!-- Seat Usage -->
  <section class="seat-usage">
    <div class="usage-header">
      <span class="usage-label">Seat Usage</span>
      <span class="usage-value" class:full={isSeatsFull}>
        {org.seatsUsed} / {org.seatsTotal}
      </span>
    </div>
    <ProgressBar
      value={org.seatsUsed}
      max={org.seatsTotal}
      variant={isSeatsFull ? 'default' : 'primary'}
    />
  </section>

  <!-- Stats Grid -->
  <section class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{org.totalStudents}</span>
        <span class="stat-label">Total Students</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 8v4l3 3"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{org.totalSessions.toLocaleString()}</span>
        <span class="stat-label">Total Sessions</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{org.avgWpm}</span>
        <span class="stat-label">Avg WPM</span>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="stat-content">
        <span class="stat-value">{org.avgAccuracy}%</span>
        <span class="stat-label">Avg Accuracy</span>
      </div>
    </div>
  </section>

  <!-- Health Score -->
  <section class="health-section">
    <div class="health-header">
      <h3 class="health-title">Org Health Score</h3>
      <span class="health-status" style="color: {healthStatus().color}">
        {healthStatus().label}
      </span>
    </div>
    <div class="health-score-display">
      <div class="score-ring">
        <svg viewBox="0 0 100 100">
          <circle class="score-bg" cx="50" cy="50" r="45"/>
          <circle
            class="score-progress"
            cx="50"
            cy="50"
            r="45"
            style="stroke-dasharray: {283 * healthScore() / 100} 283; stroke: {healthStatus().color}"
          />
        </svg>
        <span class="score-value" style="color: {healthStatus().color}">{healthScore()}</span>
      </div>
      <div class="health-info">
        <p>Based on average accuracy and student engagement</p>
        {#if org.growth > 0}
          <div class="growth-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
            +{org.growth}% growth
          </div>
        {/if}
      </div>
    </div>
  </section>

  <!-- Growth Chart -->
  {#if growthData.length > 0}
    <section class="growth-section">
      <h3 class="section-title">Student Growth</h3>
      <canvas bind:this={growthCanvas} width={600} height={200}></canvas>
    </section>
  {/if}
</div>

<style>
  .org-stats-panel {
    padding: 1.5rem;
    background: linear-gradient(135deg, rgba(240, 165, 0, 0.03) 0%, rgba(0, 131, 143, 0.03) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .org-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .org-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.5rem;
    font-weight: 700;
    color: #f5f5f5;
    margin: 0;
  }

  .upgrade-prompt {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 4px;
  }

  .upgrade-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: #ef4444;
  }

  .seat-usage {
    margin-bottom: 1.5rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .usage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .usage-label {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .usage-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f0a500;
  }

  .usage-value.full {
    color: #ef4444;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(240, 165, 0, 0.1);
    border-radius: 8px;
    color: #f0a500;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f5f5f5;
  }

  .stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
  }

  .health-section {
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .health-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .health-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0;
  }

  .health-status {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .health-score-display {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .score-ring {
    position: relative;
    width: 100px;
    height: 100px;
    flex-shrink: 0;
  }

  .score-ring svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .score-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 8;
  }

  .score-progress {
    fill: none;
    stroke-width: 8;
    stroke-linecap: round;
    transition: stroke-dasharray 0.5s ease;
  }

  .score-value {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.75rem;
    font-weight: 700;
  }

  .health-info {
    flex: 1;
  }

  .health-info p {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.5);
    margin: 0 0 0.75rem 0;
  }

  .growth-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    background: rgba(74, 222, 128, 0.15);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #4ade80;
  }

  .growth-section {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 1rem 0;
  }

  canvas {
    display: block;
    width: 100%;
    height: auto;
  }
</style>
