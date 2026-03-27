<script lang="ts">
  import { SignUp } from 'svelte-clerk';
</script>

<svelte:head>
  <title>Sign Up — TypeForge</title>
</svelte:head>

<div class="min-h-screen bg-surface-dim flex items-center justify-center p-6">
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <a href="/" class="text-3xl font-black tracking-tighter text-primary uppercase font-label">
        TYPEFORGE
      </a>
      <p class="mt-4 font-body text-on-surface-variant">
        Create your account and start typing
      </p>
    </div>

    <div class="bg-surface-container-low p-8">
      <SignUp routing="path" path="/sign-up" />
    </div>
  </div>
</div>
