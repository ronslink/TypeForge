<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { createApiClient } from '@typeforge/api/client';
  import { ClassRoster } from '@typeforge/ui';

  const ctx = useClerkContext();
  let isSignedIn = $derived(!!ctx?.user);
  
  let organizationData = $state<any>(null);
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

      // 2. Fetch members
      const membersRes = await api.api.v1.organisations[":id"].members.$get({
        param: { id: activeOrgId }
      });
      if (membersRes.ok) {
        const payload = await membersRes.json();
        // ensure dates are properly parsed for UI comparison
        membersList = payload.members.map((m: any) => ({
             ...m,
             lastActive: m.lastActive ? new Date(m.lastActive) : null
        }));
      }
    } catch (e) {
      error = 'Failed to load class roster data';
      console.error(e);
    } finally {
      loading = false;
    }
  });
</script>

<svelte:head>
  <title>Class Roster — TypeForge</title>
</svelte:head>

<div class="px-4 mt-8">
  {#if loading}
    <div class="h-64 flex items-center justify-center">
      <div class="text-on-surface-variant font-label animate-pulse text-sm uppercase tracking-widest">Loading Roster...</div>
    </div>
  {:else if error}
    <div class="text-error bg-error-container/20 p-4 border border-error-container rounded">
      {error}
    </div>
  {:else if !organizationData}
    <div class="bg-surface-container-low border-2 border-dashed border-outline-variant/30 flex flex-col items-center justify-center p-12 min-h-[300px] rounded-lg">
      <span class="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-4">group_off</span>
      <h2 class="font-headline text-xl mb-2">No Active Organization</h2>
      <p class="font-body text-sm text-on-surface-variant max-w-sm text-center">
        You are not currently a member of any organization. Ask your admin for an invite link.
      </p>
    </div>
  {:else}
    <ClassRoster students={membersList} />
  {/if}
</div>
