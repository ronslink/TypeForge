<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { OrgDashboard } from '@typeforge/ui';

  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  
  let organizationData = $state<any>(null);
  let dashboardStats = $state<any>(null);
  let membersList = $state<any[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

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

      // 1. Fetch user's organizations
      const orgsRes = await api.api.v1.organisations.$get();
      if (!orgsRes.ok) throw new Error('Failed to load organizations');
      
      const { organisations } = await orgsRes.json();
      
      if (!organisations || organisations.length === 0) {
         loading = false;
         return;
      }

      const activeOrgId = organisations[0].org.id;
      organizationData = organisations[0].org;

      // 2. Fetch dashboard stats
      const dashboardRes = await api.api.v1.organisations[":id"].dashboard.$get({
        param: { id: activeOrgId }
      });
      if (dashboardRes.ok) {
        const { stats } = await dashboardRes.json();
        dashboardStats = stats;
      }

      // 3. Fetch members
      const membersRes = await api.api.v1.organisations[":id"].members.$get({
        param: { id: activeOrgId }
      });
      if (membersRes.ok) {
        const payload = await membersRes.json();
        membersList = payload.members;
      }
    } catch (e) {
      error = 'Failed to load organization data';
      console.error(e);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Org Overview — TypeForge</title>
</svelte:head>

{#if loading}
  <div class="h-64 flex items-center justify-center">
    <div class="text-on-surface-variant font-label animate-pulse text-sm uppercase tracking-widest">Loading Dashboard...</div>
  </div>
{:else if error}
  <div class="text-error bg-error-container/20 p-4 border border-error-container rounded">
    {error}
  </div>
{:else if !organizationData}
  <div class="bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 min-h-[300px] mt-8 rounded-lg">
    <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4">group_off</span>
    <h2 class="font-headline text-xl mb-2">No Active Organization</h2>
    <p class="font-body text-sm text-on-surface-variant max-w-sm text-center">
      You are not currently a member of any organization. Ask your admin for an invite link or create a new organization from the user portal.
    </p>
  </div>
{:else}
  <OrgDashboard 
    orgName={organizationData.name}
    stats={dashboardStats}
    members={membersList}
  />
{/if}
