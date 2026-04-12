<script lang="ts">
  import { SignUp } from 'svelte-clerk';
</script>

<svelte:head>
  <title>Sign Up - TypeForge</title>
</svelte:head>

<div class="clerk-container w-full">
  <SignUp fallbackRedirectUrl="/learn" routing="path" path="/sign-up" />
</div>

<style>
  /* Global overrides to make Clerk blend in perfectly with Kinetic Foundry */
  :global(.clerk-container .cl-card) {
    background: transparent;
    box-shadow: none;
    border: none;
  }
  :global(.clerk-container .cl-headerTitle) {
    color: var(--primary, #ffc56c);
    font-family: 'Newsreader', serif;
    font-size: 1.5rem;
  }
  :global(.clerk-container .cl-headerSubtitle) {
    color: rgba(255, 255, 255, 0.6);
    font-family: 'Manrope', sans-serif;
  }
  :global(.clerk-container .cl-formButtonPrimary) {
    background: var(--primary, #ffc56c);
    color: var(--on-primary, #442c00);
    border-radius: 4px;
    font-family: 'Space Grotesk', monospace;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  :global(.clerk-container .cl-formButtonPrimary:hover) {
    background: #ffb13e;
  }
  :global(.clerk-container .cl-socialButtonsBlockButton) {
    border-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  :global(.clerk-container .cl-socialButtonsBlockButtonText) {
    font-weight: 600;
  }
  :global(.clerk-container .cl-dividerLine) {
    background: rgba(255, 255, 255, 0.1);
  }
  :global(.clerk-container .cl-dividerText) {
    color: rgba(255, 255, 255, 0.4);
  }
  :global(.clerk-container .cl-formFieldLabel) {
    color: rgba(255, 255, 255, 0.7);
  }
  :global(.clerk-container .cl-formFieldInput) {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
  :global(.clerk-container .cl-footerActionText) {
    color: rgba(255, 255, 255, 0.6);
  }
  :global(.clerk-container .cl-footerActionLink) {
    color: var(--primary, #ffc56c);
  }
</style>
