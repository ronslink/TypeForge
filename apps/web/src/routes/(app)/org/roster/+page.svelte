<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { ClassRoster, InviteStudentModal } from '@typeforge/ui';
  import { t } from '$lib/stores/locale';

  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  
  let organizationData = $state<any>(null);
  let membersList = $state<any[]>([]);
  let seatData = $state<any>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let showInviteModal = $state(false);
  let orgId = $state<string | null>(null);
  let api = $state<any>(null);
  let selectedStudent = $state<any | null>(null);
  let selectedPerformance = $state<any | null>(null);
  let performanceLoading = $state(false);
  let performanceError = $state<string | null>(null);

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
      error = $t('org_roster_load_failed');
      console.error(e);
    } finally {
      loading = false;
    }
  });

  async function loadData() {
    const orgsRes = await api.api.v1.organisations.$get();
    if (!orgsRes.ok) throw new Error($t('org_load_failed'));
    const { organisations } = await orgsRes.json();
    if (!organisations || organisations.length === 0) return;

    orgId = organisations[0].org.id;
    organizationData = organisations[0].org;

    const [membersRes, seatsRes] = await Promise.all([
      api.api.v1.organisations[":id"].members.$get({ param: { id: orgId } }),
      api.api.v1.organisations[":id"].seats.$get({ param: { id: orgId } }),
    ]);

    if (membersRes.ok) {
      const payload = await membersRes.json();
      membersList = payload.members.map((m: any) => ({
        ...m,
        lastActive: m.lastActive ? new Date(m.lastActive) : null,
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
      throw new Error(body?.error || $t('org_invite_failed'));
    }
    await loadData();
  }

  async function handleRemoveStudent() {
    // Handled inline by ClassRoster component's onStudentClick
    // Refreshed after action
    await loadData();
  }

  async function handleStudentClick(student: any) {
    selectedStudent = student;
    selectedPerformance = null;
    performanceError = null;
    if (!orgId || !api) return;

    performanceLoading = true;
    try {
      const res = await api.api.v1.organisations[":id"].members[":userId"].performance.$get({
        param: { id: orgId, userId: student.id },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || $t('org_student_drilldown_failed'));
      }
      selectedPerformance = await res.json();
    } catch (e: any) {
      performanceError = e?.message || $t('org_student_drilldown_failed');
    } finally {
      performanceLoading = false;
    }
  }

  function closeStudentDrilldown() {
    selectedStudent = null;
    selectedPerformance = null;
    performanceError = null;
  }

  function formatDate(value: string | Date | null | undefined) {
    if (!value) return $t('org_never');
    return new Date(value).toLocaleDateString();
  }

  function formatDuration(seconds: number | null | undefined) {
    if (!seconds) return '0m';
    const minutes = Math.max(1, Math.round(seconds / 60));
    return `${minutes}m`;
  }

  function getPerformanceDiagnosis() {
    const summary = selectedPerformance?.summary;
    const weakKeys = selectedPerformance?.weakKeys ?? [];
    if (!summary || summary.sessions === 0) return $t('org_student_diagnosis_no_sessions');
    if (summary.avgAccuracy < 70) return $t('org_student_diagnosis_accuracy');
    if (weakKeys.some((key: any) => Number(key.masteryLevel) < 60)) return $t('org_student_diagnosis_keys');
    if (summary.avgWpm < 20 && summary.avgAccuracy >= 85) return $t('org_student_diagnosis_speed');
    return $t('org_student_diagnosis_on_track');
  }

  let usedSeats = $derived(seatData?.activeMembers ?? seatData?.used ?? 0);
  let seatUsagePct = $derived(
    seatData?.purchased > 0 ? Math.round((usedSeats / seatData.purchased) * 100) : 0
  );
  let studentMembers = $derived(membersList.filter(m => m.role === 'student'));
</script>

<svelte:head>
  <title>{$t('org_roster_title')} — TypeForge</title>
</svelte:head>

{#if loading}
  <div class="h-64 flex items-center justify-center">
    <div class="text-on-surface-variant font-label animate-pulse text-sm uppercase tracking-widest">{$t('org_roster_loading')}</div>
  </div>
{:else if error}
  <div class="text-error bg-error-container/20 p-4 border border-error-container rounded">{error}</div>
{:else if !organizationData}
  <div class="bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 min-h-[300px] rounded-lg">
    <span class="inline-flex w-10 h-10 text-on-surface-variant/30 mb-4" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H8" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <line x1="3" y1="3" x2="21" y2="21" />
      </svg>
    </span>
    <h2 class="font-headline text-xl mb-2">{$t('org_no_org')}</h2>
    <p class="font-body text-sm text-on-surface-variant max-w-sm text-center">
      {$t('org_no_org_roster_desc')}
    </p>
  </div>
{:else}
  <div class="px-6 py-6 max-w-screen-xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="font-headline text-2xl text-on-surface">{$t('org_roster_title')}</h1>
        <p class="font-label text-xs uppercase tracking-widest text-on-surface-variant mt-1">{organizationData.name}</p>
      </div>
      <button
        id="roster-invite-btn"
        onclick={() => showInviteModal = true}
        class="notched-button bg-primary text-on-primary font-label font-bold text-sm px-5 py-2.5 flex items-center gap-2 hover:amber-glow transition-all duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/>
        </svg>
        {$t('org_invite_student')}
      </button>
    </div>

    <!-- Seat Quota Bar -->
    {#if seatData}
      <div class="seat-info-bar flex items-center gap-4 bg-surface-container-low border border-outline-variant/20 px-5 py-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">{$t('org_seat_quota')}</span>
            <span class="font-mono text-xs font-bold {usedSeats >= seatData.purchased ? 'text-error' : 'text-primary'}">
              {$t('org_seats_used', { used: usedSeats, total: seatData.purchased })}
            </span>
          </div>
          <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
            <div
              class="h-full transition-all duration-500 rounded-full {seatUsagePct >= 100 ? 'bg-error' : seatUsagePct >= 80 ? 'bg-tertiary' : 'bg-primary'}"
              style="width: {Math.min(seatUsagePct, 100)}%"
            ></div>
          </div>
        </div>
        <div class="font-label text-xs text-on-surface-variant shrink-0 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
          {$t('org_lock_removed_seats', { days: seatData.cooldownDays })}
        </div>
      </div>
    {/if}

    {#if selectedStudent}
      <section class="student-drilldown bg-surface-container-low border border-outline-variant/30 rounded-lg overflow-hidden">
        <div class="flex items-start justify-between gap-4 p-5 border-b border-outline-variant/20">
          <div class="min-w-0">
            <p class="font-label text-xs uppercase tracking-widest text-primary">{$t('org_student_drilldown_title')}</p>
            <h2 class="font-headline text-xl text-on-surface mt-1 truncate">{selectedStudent.name}</h2>
            <p class="font-body text-sm text-on-surface-variant truncate">{selectedStudent.email}</p>
          </div>
          <button
            type="button"
            class="w-9 h-9 inline-flex items-center justify-center rounded border border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
            onclick={closeStudentDrilldown}
            aria-label={$t('org_close_drilldown')}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {#if performanceLoading}
          <div class="p-6 text-sm font-label uppercase tracking-widest text-on-surface-variant animate-pulse">
            {$t('org_student_drilldown_loading')}
          </div>
        {:else if performanceError}
          <div class="m-5 text-error bg-error-container/20 p-4 border border-error-container rounded">
            {performanceError}
          </div>
        {:else}
          {@const summary = selectedPerformance?.summary}
          {@const recentSessions = selectedPerformance?.recentSessions ?? []}
          {@const weakKeys = selectedPerformance?.weakKeys ?? []}
          {@const trend = selectedPerformance?.trend ?? []}
          <div class="p-5 space-y-5">
            <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div class="metric-tile">
                <span>{$t('progress_total_sessions')}</span>
                <strong>{summary?.sessions ?? selectedStudent.lessonsCompleted ?? 0}</strong>
              </div>
              <div class="metric-tile">
                <span>{$t('org_avg_wpm')}</span>
                <strong>{summary?.avgWpm ?? selectedStudent.wpm ?? 0}</strong>
              </div>
              <div class="metric-tile">
                <span>{$t('org_avg_accuracy')}</span>
                <strong>{summary?.avgAccuracy ?? selectedStudent.accuracy ?? 0}%</strong>
              </div>
              <div class="metric-tile">
                <span>{$t('org_best_wpm')}</span>
                <strong>{summary?.bestWpm ?? 0}</strong>
              </div>
              <div class="metric-tile">
                <span>{$t('org_last_active')}</span>
                <strong class="text-base">{formatDate(selectedStudent.lastActive)}</strong>
              </div>
            </div>

            <div class="diagnosis-box">
              <p class="font-label text-xs uppercase tracking-widest text-primary">{$t('org_what_is_happening')}</p>
              <p class="font-body text-sm text-on-surface mt-2">{getPerformanceDiagnosis()}</p>
            </div>

            <div class="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div>
                <h3 class="section-label">{$t('org_recent_sessions')}</h3>
                {#if recentSessions.length > 0}
                  <div class="overflow-x-auto">
                    <table class="drilldown-table">
                      <thead>
                        <tr>
                          <th>{$t('progress_date')}</th>
                          <th>{$t('progress_language')}</th>
                          <th>{$t('org_wpm')}</th>
                          <th>{$t('org_accuracy_short')}</th>
                          <th>{$t('lesson_time')}</th>
                          <th>{$t('practice_errors')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {#each recentSessions as session}
                          <tr>
                            <td>{formatDate(session.completedAt)}</td>
                            <td>{session.languageCode}</td>
                            <td>{Math.round(session.wpm ?? 0)}</td>
                            <td>{Math.round(session.accuracy ?? 0)}%</td>
                            <td>{formatDuration(session.durationSeconds)}</td>
                            <td>{session.errors ?? 0}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {:else}
                  <div class="empty-panel">{$t('org_no_recent_sessions')}</div>
                {/if}
              </div>

              <div class="space-y-5">
                <div>
                  <h3 class="section-label">{$t('org_weak_keys')}</h3>
                  {#if weakKeys.length > 0}
                    <div class="weak-key-list">
                      {#each weakKeys as key}
                        <div class="weak-key-row">
                          <span class="keycap">{key.key}</span>
                          <div class="min-w-0 flex-1">
                            <div class="flex justify-between text-xs font-label text-on-surface-variant">
                              <span>{key.layoutId}</span>
                              <span>{key.masteryLevel}%</span>
                            </div>
                            <div class="h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1.5">
                              <div class="h-full bg-primary rounded-full" style="width: {Math.max(0, Math.min(100, key.masteryLevel))}%"></div>
                            </div>
                          </div>
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <div class="empty-panel">{$t('org_no_weak_keys')}</div>
                  {/if}
                </div>

                <div>
                  <h3 class="section-label">{$t('org_14_day_trend')}</h3>
                  {#if trend.length > 0}
                    <div class="trend-strip" aria-label={$t('org_14_day_trend')}>
                      {#each trend as day}
                        <div
                          class="trend-bar"
                          style="height: {Math.max(10, Math.min(100, Number(day.avgAccuracy ?? 0)))}%"
                          title={`${formatDate(day.date)} · ${Math.round(day.avgWpm ?? 0)} WPM · ${Math.round(day.avgAccuracy ?? 0)}%`}
                        ></div>
                      {/each}
                    </div>
                  {:else}
                    <div class="empty-panel">{$t('org_no_trend_data')}</div>
                  {/if}
                </div>
              </div>
            </div>
          </div>
        {/if}
      </section>
    {/if}

    <!-- Roster Component -->
    <ClassRoster students={studentMembers} onStudentClick={handleStudentClick} />
  </div>

  {#if showInviteModal}
    <InviteStudentModal
      onInvite={handleInviteStudent}
      onClose={() => showInviteModal = false}
    />
  {/if}
{/if}

<style>
  .metric-tile {
    display: flex;
    min-height: 76px;
    flex-direction: column;
    justify-content: center;
    gap: 0.35rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    padding: 0.9rem;
    border-radius: 6px;
  }

  .metric-tile span,
  .section-label {
    font-family: var(--font-label, inherit);
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, rgba(255, 255, 255, 0.6));
  }

  .metric-tile strong {
    font-family: var(--font-mono, monospace);
    font-size: 1.45rem;
    line-height: 1;
    color: var(--color-on-surface, #f5f5f5);
  }

  .diagnosis-box,
  .empty-panel {
    border: 1px solid rgba(240, 165, 0, 0.2);
    background: rgba(240, 165, 0, 0.07);
    border-radius: 6px;
    padding: 1rem;
  }

  .empty-panel {
    color: var(--color-on-surface-variant, rgba(255, 255, 255, 0.6));
    font-size: 0.9rem;
  }

  .drilldown-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .drilldown-table th,
  .drilldown-table td {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0.75rem;
    text-align: left;
    white-space: nowrap;
  }

  .drilldown-table th {
    font-family: var(--font-label, inherit);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-on-surface-variant, rgba(255, 255, 255, 0.6));
  }

  .weak-key-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
  }

  .weak-key-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .keycap {
    display: inline-flex;
    min-width: 2.2rem;
    height: 2.2rem;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(255, 255, 255, 0.16);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    font-family: var(--font-mono, monospace);
    font-weight: 700;
    color: var(--color-on-surface, #f5f5f5);
  }

  .trend-strip {
    display: flex;
    align-items: end;
    gap: 0.35rem;
    height: 120px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.03);
    border-radius: 6px;
    padding: 0.75rem;
  }

  .trend-bar {
    flex: 1;
    min-width: 8px;
    background: linear-gradient(180deg, #41e4c0 0%, #f0a500 100%);
    border-radius: 3px 3px 0 0;
  }
</style>
