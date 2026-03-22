<script lang="ts">
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';

  interface LessonResult {
    lessonId: string;
    lessonTitle: string;
    completedAt: Date;
    wpm: number;
    accuracy: number;
  }

  interface StudentReport {
    id: string;
    name: string;
    email: string;
    enrolledAt: Date;
    totalSessions: number;
    avgWpm: number;
    avgAccuracy: number;
    streak: number;
    keyMastery: Record<string, number>;
    recentLessons: LessonResult[];
    weakAreas: string[];
  }

  interface Props {
    student: StudentReport;
    onSendEncouragement?: (studentId: string) => void;
  }

  let { student, onSendEncouragement }: Props = $props();

  // Canvas refs
  let wpmCanvas: HTMLCanvasElement | undefined = $state();
  let accuracyCanvas: HTMLCanvasElement | undefined = $state();
  let heatmapCanvas: HTMLCanvasElement | undefined = $state();

  // Generate WPM trend chart
  $effect(() => {
    if (!wpmCanvas || student.recentLessons.length === 0) return;
    
    const ctx = wpmCanvas.getContext('2d');
    if (!ctx) return;

    const width = wpmCanvas.width;
    const height = wpmCanvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * i / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw WPM line
    const lessons = [...student.recentLessons].reverse();
    const maxWpm = Math.max(...lessons.map(l => l.wpm), 100);
    const minWpm = Math.min(...lessons.map(l => l.wpm), 0);
    const range = maxWpm - minWpm || 1;

    ctx.strokeStyle = '#f0a500';
    ctx.lineWidth = 3;
    ctx.beginPath();

    lessons.forEach((lesson, i) => {
      const x = padding + (width - 2 * padding) * i / (lessons.length - 1 || 1);
      const y = height - padding - ((lesson.wpm - minWpm) / range) * (height - 2 * padding);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      // Draw point
      ctx.fillStyle = '#f0a500';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.stroke();

    // Draw labels
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    lessons.forEach((lesson, i) => {
      const x = padding + (width - 2 * padding) * i / (lessons.length - 1 || 1);
      const date = new Date(lesson.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      ctx.fillText(date, x, height - 10);
    });
  });

  // Generate accuracy pie chart
  $effect(() => {
    if (!accuracyCanvas) return;
    
    const ctx = accuracyCanvas.getContext('2d');
    if (!ctx) return;

    const width = accuracyCanvas.width;
    const height = accuracyCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    const accuracy = student.avgAccuracy;
    const remaining = 100 - accuracy;

    // Draw background circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw accuracy arc
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + (accuracy / 100) * Math.PI * 2;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.strokeStyle = accuracy >= 90 ? '#4ade80' : accuracy >= 70 ? '#f0a500' : '#ef4444';
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw center text
    ctx.fillStyle = '#f5f5f5';
    ctx.font = 'bold 32px JetBrains Mono';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${accuracy}%`, centerX, centerY);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = '12px Inter';
    ctx.fillText('Accuracy', centerX, centerY + 20);
  });

  // Generate key mastery heatmap
  $effect(() => {
    if (!heatmapCanvas) return;
    
    const ctx = heatmapCanvas.getContext('2d');
    if (!ctx) return;

    const width = heatmapCanvas.width;
    const height = heatmapCanvas.height;

    ctx.clearRect(0, 0, width, height);

    const keys = Object.entries(student.keyMastery).sort((a, b) => b[1] - a[1]);
    const cols = 10;
    const cellWidth = (width - 40) / cols;
    const cellHeight = 30;
    const gap = 4;

    keys.slice(0, 30).forEach(([key, mastery], i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = 20 + col * (cellWidth + gap);
      const y = 20 + row * (cellHeight + gap);

      // Color based on mastery
      let color: string;
      if (mastery >= 95) color = 'rgba(74, 222, 128, 0.6)';
      else if (mastery >= 85) color = 'rgba(240, 165, 0, 0.6)';
      else if (mastery >= 70) color = 'rgba(255, 140, 66, 0.6)';
      else color = 'rgba(239, 68, 68, 0.6)';

      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellWidth, cellHeight);

      // Key label
      ctx.fillStyle = '#f5f5f5';
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(key.toUpperCase(), x + cellWidth / 2, y + cellHeight / 2 - 6);

      // Mastery percentage
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(`${mastery}%`, x + cellWidth / 2, y + cellHeight / 2 + 8);
    });
  });

  function handlePrint() {
    window.print();
  }

  function handleSendEncouragement() {
    onSendEncouragement?.(student.id);
  }
</script>

<div class="progress-report">
  <!-- Header -->
  <header class="report-header">
    <div class="student-info">
      <h2 class="student-name">{student.name}</h2>
      <p class="student-email">{student.email}</p>
      <p class="enrollment-date">
        Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
      </p>
    </div>
    <div class="header-actions">
      <Button variant="secondary" onclick={handleSendEncouragement}>
        Send Encouragement
      </Button>
      <Button variant="ghost" onclick={handlePrint}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 6 2 18 2 18 9"/>
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <rect x="6" y="14" width="12" height="8"/>
        </svg>
        Print
      </Button>
    </div>
  </header>

  <!-- Stats Grid -->
  <section class="stats-overview">
    <div class="stat-card">
      <span class="stat-value">{student.totalSessions}</span>
      <span class="stat-label">Total Sessions</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{student.avgWpm}</span>
      <span class="stat-label">Avg WPM</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{student.avgAccuracy}%</span>
      <span class="stat-label">Avg Accuracy</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{student.streak}</span>
      <span class="stat-label">Day Streak</span>
    </div>
  </section>

  <!-- Charts Section -->
  <section class="charts-section">
    <div class="chart-container">
      <h3 class="chart-title">WPM Trend</h3>
      <canvas bind:this={wpmCanvas} width={500} height={200}></canvas>
    </div>
    <div class="chart-container">
      <h3 class="chart-title">Accuracy</h3>
      <canvas bind:this={accuracyCanvas} width={200} height={200}></canvas>
    </div>
  </section>

  <!-- Key Mastery Heatmap -->
  <section class="heatmap-section">
    <h3 class="section-title">Key Mastery</h3>
    <canvas bind:this={heatmapCanvas} width={600} height={120}></canvas>
    <div class="heatmap-legend">
      <div class="legend-item">
        <div class="legend-color" style="background: rgba(74, 222, 128, 0.6);"></div>
        <span>95%+ Excellent</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: rgba(240, 165, 0, 0.6);"></div>
        <span>85-94% Good</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: rgba(255, 140, 66, 0.6);"></div>
        <span>70-84% Fair</span>
      </div>
      <div class="legend-item">
        <div class="legend-color" style="background: rgba(239, 68, 68, 0.6);"></div>
        <span>&lt;70% Needs Work</span>
      </div>
    </div>
  </section>

  <!-- Weak Areas -->
  {#if student.weakAreas.length > 0}
    <section class="weak-areas-section">
      <h3 class="section-title">Areas for Improvement</h3>
      <div class="weak-areas-list">
        {#each student.weakAreas as area}
          <Badge variant="error">{area}</Badge>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Recent Lessons -->
  <section class="recent-lessons">
    <h3 class="section-title">Recent Lessons</h3>
    <table class="lessons-table">
      <thead>
        <tr>
          <th>Lesson</th>
          <th>Completed</th>
          <th>WPM</th>
          <th>Accuracy</th>
        </tr>
      </thead>
      <tbody>
        {#each student.recentLessons.slice(0, 5) as lesson}
          <tr>
            <td>{lesson.lessonTitle}</td>
            <td>{new Date(lesson.completedAt).toLocaleDateString()}</td>
            <td class="wpm-cell">{lesson.wpm}</td>
            <td class="accuracy-cell">
              <span class:high={lesson.accuracy >= 90} class:medium={lesson.accuracy >= 70 && lesson.accuracy < 90} class:low={lesson.accuracy < 70}>
                {lesson.accuracy}%
              </span>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
</div>

<style>
  .progress-report {
    padding: 2rem;
    background: linear-gradient(135deg, rgba(240, 165, 0, 0.02) 0%, rgba(0, 131, 143, 0.02) 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .student-name {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.75rem;
    font-weight: 700;
    color: #f5f5f5;
    margin: 0 0 0.5rem 0;
  }

  .student-email {
    font-size: 0.9375rem;
    color: rgba(255, 255, 255, 0.6);
    margin: 0 0 0.25rem 0;
  }

  .enrollment-date {
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.4);
    margin: 0;
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;
  }

  .stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    padding: 1.25rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    text-align: center;
  }

  .stat-value {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 2rem;
    font-weight: 700;
    color: #41e4c0;
  }

  .stat-label {
    display: block;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 0.25rem;
  }

  .charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 2rem;
  }

  .chart-container {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .chart-title {
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

  .heatmap-section {
    margin-bottom: 2rem;
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

  .heatmap-legend {
    display: flex;
    gap: 1.5rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  .weak-areas-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .weak-areas-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .recent-lessons {
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .lessons-table {
    width: 100%;
    border-collapse: collapse;
  }

  .lessons-table th {
    text-align: left;
    padding: 0.75rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .lessons-table td {
    padding: 0.75rem;
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .wpm-cell {
    font-family: 'JetBrains Mono', monospace;
    color: #f0a500;
  }

  .accuracy-cell span {
    font-family: 'JetBrains Mono', monospace;
  }

  .accuracy-cell .high {
    color: #4ade80;
  }

  .accuracy-cell .medium {
    color: #f0a500;
  }

  .accuracy-cell .low {
    color: #ef4444;
  }

  /* Print styles */
  @media print {
    .progress-report {
      background: white;
      border: none;
    }

    .header-actions {
      display: none;
    }

    .stat-card {
      background: #f5f5f5;
      border: 1px solid #ddd;
    }

    .chart-container,
    .heatmap-section,
    .weak-areas-section,
    .recent-lessons {
      background: #f5f5f5;
      border: 1px solid #ddd;
      break-inside: avoid;
    }
  }
</style>
