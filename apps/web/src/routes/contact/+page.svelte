<script lang="ts">
  import TopNavBar from '$lib/components/TopNavBar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let formState = $state<'idle' | 'submitting' | 'success' | 'error'>('idle');
  let errorMessage = $state<string | null>(null);

  // Form fields
  let name = $state('');
  let email = $state('');
  let organisation = $state('');
  let role = $state('');
  let studentCount = $state('');
  let useCase = $state('');
  let message = $state('');

  async function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    formState = 'submitting';
    errorMessage = null;

    // Basic validation
    if (!name.trim() || !email.trim() || !message.trim()) {
      formState = 'error';
      errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      formState = 'error';
      errorMessage = 'Please enter a valid email address.';
      return;
    }

    // Simulate submission (in production this would call an API endpoint)
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Success
    formState = 'success';
  }
</script>

<svelte:head>
  <title>Contact Sales — TypingScholar</title>
  <meta name="description" content="Get in touch with TypingScholar's sales team for school or institutional pricing, bulk licensing, and custom deployments." />
</svelte:head>

<div class="min-h-screen bg-background text-on-background grid-texture flex flex-col">
  <TopNavBar />
  <main class="pt-20 flex-1">
    <section class="py-24 px-6 md:px-8 max-w-3xl mx-auto">

      <div class="text-center mb-16">
        <div class="flex justify-center mb-6">
          <div class="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-3xl">school</span>
          </div>
        </div>
        <h1 class="font-headline text-5xl md:text-6xl tracking-tight mb-4">Talk to our team</h1>
        <p class="font-body text-xl text-on-surface-variant max-w-xl mx-auto">
          School or institutional pricing? Bulk licensing? Custom deployment? Tell us about your needs and we'll get back to you within one business day.
        </p>
      </div>

      {#if formState === 'success'}
        <div class="bg-surface-container-low border border-primary/30 rounded-2xl p-10 text-center">
          <div class="flex justify-center mb-6">
            <div class="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-primary text-3xl">check_circle</span>
            </div>
          </div>
          <h2 class="font-headline text-2xl mb-3">Message sent</h2>
          <p class="font-body text-on-surface-variant mb-6">
            Thanks, <strong>{name}</strong>. We'll review your {organisation ? `inquiry for ${organisation}` : 'inquiry'} and respond to <strong>{email}</strong> within one business day.
          </p>
          <a href="/" class="notched-button bg-primary text-on-primary px-6 py-3 font-label font-bold hover:bg-primary-fixed-dim transition-colors inline-block">
            Back to home
          </a>
        </div>

      {:else}
        <form onsubmit={handleSubmit} class="bg-surface-container-low border border-outline-variant/20 rounded-2xl p-8 md:p-10">
          <div class="grid md:grid-cols-2 gap-6 mb-6">
            <!-- Name -->
            <div>
              <label for="name" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                Full Name <span class="text-primary">*</span>
              </label>
              <input
                id="name"
                type="text"
                bind:value={name}
                required
                placeholder="Jane Smith"
                class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="email" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                Work Email <span class="text-primary">*</span>
              </label>
              <input
                id="email"
                type="email"
                bind:value={email}
                required
                placeholder="jane@school.edu"
                class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Organisation -->
            <div>
              <label for="organisation" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                Organisation
              </label>
              <input
                id="organisation"
                type="text"
                bind:value={organisation}
                placeholder="St. Jude Academy"
                class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Role -->
            <div>
              <label for="role" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                Your Role
              </label>
              <input
                id="role"
                type="text"
                bind:value={role}
                placeholder="Technology Coordinator"
                class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <!-- Student count -->
            <div>
              <label for="studentCount" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                Number of Students
              </label>
              <select
                id="studentCount"
                bind:value={studentCount}
                class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select range</option>
                <option value="1-50">1 – 50</option>
                <option value="51-200">51 – 200</option>
                <option value="201-500">201 – 500</option>
                <option value="501-1000">501 – 1,000</option>
                <option value="1001-5000">1,001 – 5,000</option>
                <option value="5000+">5,000+</option>
              </select>
            </div>

            <!-- Use case -->
            <div>
              <label for="useCase" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
                Primary Use Case
              </label>
              <select
                id="useCase"
                bind:value={useCase}
                class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface focus:outline-none focus:border-primary transition-colors"
              >
                <option value="">Select one</option>
                <option value="classroom">Classroom typing instruction</option>
                <option value="self-paced">Self-paced student practice</option>
                <option value="assessment">Assessment & benchmarking</option>
                <option value="language-learning">Multi-language training</option>
                <option value="pilot">Pilot / trial evaluation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <!-- Message -->
          <div class="mb-8">
            <label for="message" class="font-label text-xs uppercase tracking-widest text-on-surface-variant mb-2 block">
              Tell us more <span class="text-primary">*</span>
            </label>
            <textarea
              id="message"
              bind:value={message}
              required
              rows="5"
              placeholder="Describe your goals, timeline, specific requirements, or any questions you have..."
              class="w-full bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 py-3 font-body text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors resize-none"
            ></textarea>
          </div>

          {#if errorMessage}
            <div class="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg">
              <p class="font-body text-sm text-error">{errorMessage}</p>
            </div>
          {/if}

          <button
            type="submit"
            disabled={formState === 'submitting'}
            class="notched-button w-full bg-primary text-on-primary py-4 font-label font-bold text-sm uppercase tracking-widest hover:bg-primary-fixed-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {#if formState === 'submitting'}
              Sending...
            {:else}
              Send message
            {/if}
          </button>

          <p class="font-body text-xs text-on-surface-variant/50 text-center mt-4">
            By submitting you agree to be contacted by our sales team. We don't share your data with third parties.
          </p>
        </form>
      {/if}

    </section>
  </main>
  <Footer />
</div>