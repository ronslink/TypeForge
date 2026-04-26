<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { InviteStudentModal } from '@typeforge/ui';

  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  
  let organizationData = $state<any>(null);
  let dashboardStats = $state<any>(null);
  let membersList = $state<any[]>([]);
  let seatData = $state<any>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let showInviteModal = $state(false);
  let orgId = $state<string | null>(null);
  let api = $state<any>(null);
  let removingUserId = $state<string | null>(null);

  onMount(async () => {
    if (!isSignedIn) { loading = false; return; }
    try {
      const token = await ctx?.session?.getToken();
      const authFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
        const defaultHeaders = new Headers(init?.headers);
        if (token) defaultHeaders.set('Authorization', `Bearer ${token}`);
        return fetch(input, { ...init, headers: defaultHeaders });
      };
      api = createApiClient('/', authFetch);
      await loadData();
    } catch (e) {
      error = 'Failed to load organization data';
      console.error(e);
    } finally {
      loading = false;
    }
  });

  async function loadData() {
    const orgsRes = await api.api.v1.organisations.$get();
    if (!orgsRes.ok) throw new Error('Failed to load organizations');
    const { organisations } = await orgsRes.json();
    if (!organisations || organisations.length === 0) return;

    orgId = organisations[0].org.id;
    organizationData = organisations[0].org;

    // Fetch dashboard stats, members, and seats in parallel
    const [dashboardRes, membersRes, seatsRes] = await Promise.all([
      api.api.v1.organisations[":id"].dashboard.$get({ param: { id: orgId } }),
      api.api.v1.organisations[":id"].members.$get({ param: { id: orgId } }),
      api.api.v1.organisations[":id"].seats.$get({ param: { id: orgId } }),
    ]);

    if (dashboardRes.ok) {
      const { stats } = await dashboardRes.json();
      dashboardStats = stats;
    }
    if (membersRes.ok) {
      const payload = await membersRes.json();
      membersList = payload.members.map((m: any) => ({
        ...m,
        lastActive: m.lastActive ? new Date(m.lastActive) : null,
        // Classify status for ClassRoster component
        status: !m.lastActive ? 'inactive' : (m.accuracy < 70 ? 'struggling' : 'active'),
      }));
    }
    if (seatsRes.ok) {
      const payload = await seatsRes.json();
      seatData = payload.seats;
    }
  }

  async function handleInviteStudent(email: string, classId?: string) {
    if (!orgId || !api) return;
    const res = await api.api.v1.organisations[":id"].invite.$post({
      param: { id: orgId },
      json: { email, classId, role: 'student' }
    });
    if (!res.ok) {
      const body = await res.json() as any;
      throw new Error(body?.error || 'Failed to send invite');
    }
  }

  async function handleRemoveStudent(userId: string) {
    if (!orgId || !api) return;
    removingUserId = userId;
    try {
      const res = await api.api.v1.organisations[":id"].seats[":userId"].$delete({
        param: { id: orgId, userId }
      });
      if (res.ok) {
        await loadData();
      }
    } finally {
      removingUserId = null;
    }
  }

  // Derived analytics
  let studentsByStatus = $derived({
    active: membersList.filter(m => m.status === 'active').length,
    struggling: membersList.filter(m => m.status === 'struggling').length,
    inactive: membersList.filter(m => m.status === 'inactive').length,
  });

  let seatUsagePct = $derived(
    seatData?.purchased > 0 ? Math.round((seatData.used / seatData.purchased) * 100) : 0
  );

  let topPerformers = $derived(
    [...membersList].sort((a, b) => b.wpm - a.wpm).slice(0, 3)
  );

  let atRiskStudents = $derived(
    membersList.filter(m => m.status === 'struggling')
  );
</script>

<svelte:head>
  <title>Teacher Dashboard — TypeForge</title>
</svelte:head>

{#if loading}
  <div class="h-64 flex items-center justify-center">
    <div class="text-on-surface-variant font-label animate-pulse text-sm uppercase tracking-widest">Loading Dashboard...</div>
  </div>
{:else if error}
  <div class="text-error bg-error-container/20 p-4 border border-error-container rounded">{error}</div>
{:else if !organizationData}
  <div class="bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 min-h-[300px] mt-8 rounded-lg">
    <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4">group_off</span>
    <h2 class="font-headline text-xl mb-2">No Active Organization</h2>
    <p class="font-body text-sm text-on-surface-variant max-w-sm text-center">
      You are not currently a member of any organization.
    </p>
  </div>
{:else}
  <div class="dashboard-root px-6 py-8 max-w-screen-xl mx-auto space-y-8">

    <!-- ── Header ─────────────────────────────────────────── -->
    <div class="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 class="font-headline text-3xl text-on-surface">{organizationData.name}</h1>
        <p class="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">Teacher Dashboard</p>
      </div>
      <button
        id="invite-student-btn"
        onclick={() => showInviteModal = true}
        class="notched-button bg-primary text-on-primary font-label font-bold text-sm px-6 py-3 flex items-center gap-2 hover:amber-glow transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
        </svg>
        Invite Student
      </button>
    </div>

    <!-- ── Seat Quota Bar ──────────────────────────────────── -->
    {#if seatData}
      <div class="seat-bar bg-surface-container-low border border-outline-variant/20 p-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <span class="font-label text-sm uppercase tracking-widest text-on-surface-variant">Seat Quota</span>
            <span class="font-mono text-sm font-bold {seatData.used >= seatData.purchased ? 'text-error' : 'text-primary'}">
              {seatData.used} / {seatData.purchased} seats used
            </span>
          </div>
          <div class="flex items-center gap-2 text-xs text-on-surface-variant">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            {seatData.cooldownDays}-day lock per seat
          </div>
        </div>
        <div class="h-2 bg-surface-container-high rounded-full overflow-hidden">
          <div
            class="h-full transition-all duration-500 rounded-full {seatUsagePct >= 100 ? 'bg-error' : seatUsagePct >= 80 ? 'bg-tertiary' : 'bg-primary'}"
            style="width: {Math.min(seatUsagePct, 100)}%"
          ></div>
        </div>
        {#if seatData.used >= seatData.purchased}
          <p class="text-error text-xs mt-2 font-label">All seats are in use. Remove a student or purchase more seats to invite new ones.</p>
        {:else}
          <p class="text-on-surface-variant text-xs mt-2">{seatData.purchased - seatData.used} seat{seatData.purchased - seatData.used !== 1 ? 's' : ''} available</p>
        {/if}
      </div>
    {/if}

    <!-- ── Stat Cards ──────────────────────────────────────── -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div class="stat-card">
        <span class="stat-icon bg-primary/10 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </span>
        <span class="font-headline text-3xl text-on-surface">{dashboardStats?.totalMembers ?? 0}</span>
        <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Students</span>
      </div>

      <div class="stat-card">
        <span class="stat-icon bg-secondary/10 text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
        </span>
        <span class="font-headline text-3xl text-on-surface">{dashboardStats?.averageWpm ?? 0}</span>
        <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Avg WPM</span>
      </div>

      <div class="stat-card">
        <span class="stat-icon bg-primary/10 text-primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </span>
        <span class="font-headline text-3xl text-on-surface">{dashboardStats?.averageAccuracy ?? 0}%</span>
        <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Avg Accuracy</span>
      </div>

      <div class="stat-card">
        <span class="stat-icon bg-surface-container-high text-on-surface-variant">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        </span>
        <span class="font-headline text-3xl text-on-surface">{dashboardStats?.totalLessonsCompleted ?? 0}</span>
        <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Lessons Done</span>
      </div>

      <div class="stat-card {(dashboardStats?.atRiskCount ?? 0) > 0 ? 'border-error/40 bg-error/5' : ''}">
        <span class="stat-icon {(dashboardStats?.atRiskCount ?? 0) > 0 ? 'bg-error/10 text-error' : 'bg-surface-container-high text-on-surface-variant'}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        </span>
        <span class="font-headline text-3xl {(dashboardStats?.atRiskCount ?? 0) > 0 ? 'text-error' : 'text-on-surface'}">{dashboardStats?.atRiskCount ?? 0}</span>
        <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">At Risk</span>
      </div>
    </div>

    <!-- ── Main Grid: Top Performers + At Risk ─────────────── -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Top Performers -->
      <div class="bg-surface-container-low border border-outline-variant/20 p-6">
        <h2 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Top Performers
        </h2>
        {#if topPerformers.length > 0}
          <div class="space-y-3">
            {#each topPerformers as student, i}
              <div class="flex items-center gap-4 py-2 border-b border-outline-variant/10 last:border-0">
                <span class="w-6 h-6 flex items-center justify-center font-mono text-xs font-bold rounded-full {i === 0 ? 'bg-primary/20 text-primary' : i === 1 ? 'bg-secondary/20 text-secondary' : 'bg-surface-container-high text-on-surface-variant'}">{i + 1}</span>
                <div class="flex-1 min-w-0">
                  <p class="font-label text-sm text-on-surface truncate">{student.name}</p>
                  <p class="font-body text-xs text-on-surface-variant truncate">{student.email}</p>
                </div>
                <div class="flex gap-4 text-right shrink-0">
                  <div>
                    <p class="font-mono text-sm font-bold text-primary">{student.wpm}</p>
                    <p class="font-label text-xs text-on-surface-variant">WPM</p>
                  </div>
                  <div>
                    <p class="font-mono text-sm font-bold text-secondary">{student.accuracy}%</p>
                    <p class="font-label text-xs text-on-surface-variant">Acc</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-on-surface-variant text-sm font-body py-4 text-center">No session data yet</p>
        {/if}
      </div>

      <!-- At-Risk Students -->
      <div class="bg-surface-container-low border {atRiskStudents.length > 0 ? 'border-error/30' : 'border-outline-variant/20'} p-6">
        <h2 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
          Needs Attention <span class="ml-auto text-error">&lt;70% Accuracy</span>
        </h2>
        {#if atRiskStudents.length > 0}
          <div class="space-y-3">
            {#each atRiskStudents as student}
              <div class="flex items-center gap-4 py-2 border-b border-outline-variant/10 last:border-0">
                <div class="w-2 h-2 rounded-full bg-error shrink-0"></div>
                <div class="flex-1 min-w-0">
                  <p class="font-label text-sm text-on-surface truncate">{student.name}</p>
                  <p class="font-body text-xs text-on-surface-variant truncate">{student.email}</p>
                </div>
                <div class="flex gap-4 text-right shrink-0">
                  <div>
                    <p class="font-mono text-sm font-bold text-primary">{student.wpm}</p>
                    <p class="font-label text-xs text-on-surface-variant">WPM</p>
                  </div>
                  <div>
                    <p class="font-mono text-sm font-bold text-error">{student.accuracy}%</p>
                    <p class="font-label text-xs text-on-surface-variant">Acc</p>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="flex flex-col items-center justify-center py-8 text-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-primary/50"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <p class="font-label text-sm text-on-surface-variant">All students on track!</p>
          </div>
        {/if}
      </div>
    </div>

    <!-- ── Class Activity Breakdown ──────────────────────────── -->
    <div class="bg-surface-container-low border border-outline-variant/20 p-6">
      <h2 class="font-label text-sm uppercase tracking-widest text-on-surface-variant mb-5">Class Breakdown</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="text-center p-4 bg-primary/5 border border-primary/20 rounded">
          <div class="font-headline text-4xl text-primary mb-1">{studentsByStatus.active}</div>
          <div class="font-label text-xs uppercase tracking-widest text-on-surface-variant">On Track</div>
        </div>
        <div class="text-center p-4 bg-error/5 border border-error/20 rounded">
          <div class="font-headline text-4xl text-error mb-1">{studentsByStatus.struggling}</div>
          <div class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Struggling</div>
        </div>
        <div class="text-center p-4 bg-surface-container-high border border-outline-variant/20 rounded">
          <div class="font-headline text-4xl text-on-surface-variant mb-1">{studentsByStatus.inactive}</div>
          <div class="font-label text-xs uppercase tracking-widest text-on-surface-variant">No Activity</div>
        </div>
      </div>
    </div>

    <!-- ── Full Roster ─────────────────────────────────────── -->
    <div class="bg-surface-container-low border border-outline-variant/20 p-6">
      <div class="flex items-center justify-between mb-5">
        <h2 class="font-label text-sm uppercase tracking-widest text-on-surface-variant">Student Roster ({membersList.length})</h2>
        <a href="/org/roster" class="font-label text-xs text-primary hover:underline">View Full Roster →</a>
      </div>
      {#if membersList.length === 0}
        <div class="text-center py-10 text-on-surface-variant font-body text-sm">
          No students yet — invite your first student to get started.
        </div>
      {:else}
        <div class="roster-table w-full">
          <div class="roster-header grid grid-cols-[1fr_100px_100px_80px_120px] gap-2 pb-2 border-b border-outline-variant/20 font-label text-xs uppercase tracking-widest text-on-surface-variant">
            <span>Student</span>
            <span class="text-right">WPM</span>
            <span class="text-right">Accuracy</span>
            <span class="text-right">Streak</span>
            <span class="text-right">Action</span>
          </div>
          {#each membersList.slice(0, 10) as student}
            <div class="roster-row grid grid-cols-[1fr_100px_100px_80px_120px] gap-2 py-3 border-b border-outline-variant/10 last:border-0 items-center hover:bg-surface-container/40 transition-colors">
              <div class="min-w-0">
                <p class="font-label text-sm text-on-surface truncate">{student.name}</p>
                <p class="font-body text-xs text-on-surface-variant truncate">{student.email}</p>
              </div>
              <span class="font-mono text-sm font-bold text-primary text-right">{student.wpm}</span>
              <span class="font-mono text-sm font-bold text-right {student.accuracy >= 90 ? 'text-primary' : student.accuracy >= 70 ? 'text-secondary' : 'text-error'}">{student.accuracy}%</span>
              <span class="font-mono text-sm text-on-surface-variant text-right">{student.streak}🔥</span>
              <div class="flex justify-end">
                <button
                  onclick={() => handleRemoveStudent(student.id)}
                  disabled={removingUserId === student.id}
                  class="font-label text-xs px-3 py-1.5 border border-error/30 text-error hover:bg-error/10 transition-colors rounded disabled:opacity-50 disabled:cursor-wait"
                  title="Remove student (seat enters cooldown)"
                >
                  {removingUserId === student.id ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          {/each}
          {#if membersList.length > 10}
            <div class="pt-3 text-center">
              <a href="/org/roster" class="font-label text-xs text-primary hover:underline">View all {membersList.length} students →</a>
            </div>
          {/if}
        </div>
      {/if}
    </div>

  </div>

  <!-- ── Invite Modal ─────────────────────────────────────── -->
  {#if showInviteModal}
    <InviteStudentModal
      onInvite={handleInviteStudent}
      onClose={() => showInviteModal = false}
    />
  {/if}
{/if}

<style>
  .stat-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1.5rem 1rem;
    background: var(--surface-container-low);
    border: 1px solid rgba(255, 255, 255, 0.07);
    text-align: center;
    transition: border-color 0.2s;
  }

  .stat-card:hover {
    border-color: rgba(240, 165, 0, 0.2);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .seat-bar {
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
  }
</style>
