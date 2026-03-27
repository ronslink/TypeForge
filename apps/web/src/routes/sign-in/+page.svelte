<script lang="ts">
  import { SignIn } from 'svelte-clerk';
</script>

<svelte:head>
  <title>Sign In — TypeForge</title>
</svelte:head>

<div class="min-h-screen bg-surface-dim flex items-center justify-center p-6">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <a href="/" class="text-3xl font-black tracking-tighter text-primary uppercase font-label">
        TYPEFORGE
      </a>
      <p class="mt-4 font-body text-on-surface-variant">
        Sign in to continue your typing journey
      </p>
    </div>

    <div class="bg-surface-container-low p-8">
      <SignIn routing="path" path="/sign-in" />
    </div>
  </div>
</div>
