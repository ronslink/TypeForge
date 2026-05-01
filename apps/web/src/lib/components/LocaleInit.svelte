<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { useClerkContext } from 'svelte-clerk';
  import { initLocale, setUiLocale, type UiLocale } from '$lib/stores/locale';

  const ctx = useClerkContext();

  // Immediately apply server-detected locale so SSR content matches
  // the Accept-Language header. This avoids a flash of English for
  // non-English speakers on first load.
  // If the user has a localStorage override (e.g. they live abroad and
  // manually picked a different language), getPersistedLocale() inside
  // initLocale will respect that over the server detection.
  const serverLocale = (page.data as any)?.detectedLocale as string | undefined;

  // Eagerly set the locale before mount (synchronous) so the first
  // paint already uses the right language. initLocale handles the
  // full priority: DB > localStorage > browser > server > 'en'.
  $effect.pre(() => {
    // Only run once on hydration to set a sensible initial value.
    // initLocale in onMount will finalize the decision.
    if (serverLocale) {
      setUiLocale(serverLocale as UiLocale);
    }
  });

  // Full initialisation on mount — fetches DB preference for signed-in users
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
