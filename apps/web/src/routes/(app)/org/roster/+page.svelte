<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { ClassRoster, InviteStudentModal } from '@typeforge/ui';

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
      error = 'Failed to load class roster data';
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
      throw new Error(body?.error || 'Failed to send invite');
    }
    await loadData();
  }

  async function handleRemoveStudent() {
    // Handled inline by ClassRoster component's onStudentClick
    // Refreshed after action
    await loadData();
  }

  let seatUsagePct = $derived(
    seatData?.purchased > 0 ? Math.round((seatData.used / seatData.purchased) * 100) : 0
  );
</script>

<svelte:head>
  <title>Class Roster — TypeForge</title>
</svelte:head>

{#if loading}
  <div class="h-64 flex items-center justify-center">
    <div class="text-on-surface-variant font-label animate-pulse text-sm uppercase tracking-widest">Loading Roster...</div>
  </div>
{:else if error}
  <div class="text-error bg-error-container/20 p-4 border border-error-container rounded">{error}</div>
{:else if !organizationData}
  <div class="bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 min-h-[300px] rounded-lg">
    <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4">group_off</span>
    <h2 class="font-headline text-xl mb-2">No Active Organization</h2>
    <p class="font-body text-sm text-on-surface-variant max-w-sm text-center">
      You are not currently a member of any organization. Ask your admin for an invite link.
    </p>
  </div>
{:else}
  <div class="px-6 py-6 max-w-screen-xl mx-auto space-y-6">

    <!-- Header -->
    <div class="flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="font-headline text-2xl text-on-surface">Class Roster</h1>
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
        Invite Student
      </button>
    </div>

    <!-- Seat Quota Bar -->
    {#if seatData}
      <div class="seat-info-bar flex items-center gap-4 bg-surface-container-low border border-outline-variant/20 px-5 py-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between mb-1.5">
            <span class="font-label text-xs uppercase tracking-widest text-on-surface-variant">Seat Quota</span>
            <span class="font-mono text-xs font-bold {seatData.used >= seatData.purchased ? 'text-error' : 'text-primary'}">
              {seatData.used} / {seatData.purchased}
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
          {seatData.cooldownDays}-day lock on removed seats
        </div>
      </div>
    {/if}

    <!-- Roster Component -->
    <ClassRoster students={membersList} />
  </div>

  {#if showInviteModal}
    <InviteStudentModal
      onInvite={handleInviteStudent}
      onClose={() => showInviteModal = false}
    />
  {/if}
{/if}
