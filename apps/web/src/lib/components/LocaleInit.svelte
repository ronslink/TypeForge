<script lang="ts">
  import { onMount } from 'svelte';
  import { useClerkContext } from 'svelte-clerk';
  import { initLocale } from '$lib/stores/locale';

  const ctx = useClerkContext();

  // Initialise UI locale on app boot — runs once in the browser
  onMount(async () => {
    let dbLocale: string | null = null;
    let orgLocale: string | null = null;

    // If authenticated, fetch the user's saved locale and their org's default
    try {
      const token = await ctx?.session?.getToken();
      if (token) {
        const res = await fetch('/api/v1/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const payload = await res.json();
          dbLocale = payload.user?.locale ?? null;
          orgLocale = payload.orgDefaultUiLocale ?? null;
        }
      }
    } catch {}

    initLocale(dbLocale, orgLocale);
  });
</script>
