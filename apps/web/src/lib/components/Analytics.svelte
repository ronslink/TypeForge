<script lang="ts">
  import { env as publicEnv } from '$env/dynamic/public';

  const plausibleDomain = $derived(publicEnv.PUBLIC_PLAUSIBLE_DOMAIN);
  const analyticsEnabled = $derived(
    publicEnv.PUBLIC_ENABLE_ANALYTICS === 'true' && plausibleDomain
  );
</script>

<svelte:head>
  {#if analyticsEnabled}
    <script defer data-domain={plausibleDomain} src="https://plausible.io/js/script.js"></script>
  {/if}
</svelte:head>
