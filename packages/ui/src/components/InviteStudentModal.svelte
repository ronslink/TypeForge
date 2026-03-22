<script lang="ts">
  import Button from './Button.svelte';
  import Badge from './Badge.svelte';

  interface PendingInvitation {
    id: string;
    email: string;
    classId?: string;
    className?: string;
    invitedAt: Date;
    expiresAt: Date;
  }

  interface ClassOption {
    id: string;
    name: string;
  }

  interface Props {
    classes?: ClassOption[];
    pendingInvitations?: PendingInvitation[];
    onInvite: (email: string, classId?: string) => void;
    onClose: () => void;
    onCancelInvite?: (invitationId: string) => void;
  }

  let {
    classes = [],
    pendingInvitations = [],
    onInvite,
    onClose,
    onCancelInvite,
  }: Props = $props();

  // Form state
  let email = $state('');
  let selectedClassId = $state('');
  let emailError = $state('');
  let isSubmitting = $state(false);
  let showSuccess = $state(false);

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validateEmail(): boolean {
    if (!email.trim()) {
      emailError = 'Email is required';
      return false;
    }
    if (!emailRegex.test(email)) {
      emailError = 'Please enter a valid email address';
      return false;
    }
    emailError = '';
    return true;
  }

  async function handleSubmit() {
    if (!validateEmail()) return;

    isSubmitting = true;
    
    try {
      await onInvite(email, selectedClassId || undefined);
      showSuccess = true;
      email = '';
      selectedClassId = '';
      
      setTimeout(() => {
        showSuccess = false;
      }, 3000);
    } catch (error) {
      emailError = 'Failed to send invitation. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function handleCancelInvite(invitationId: string) {
    onCancelInvite?.(invitationId);
  }

  function getDaysUntilExpiry(expiresAt: Date): number {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
</script>

<div class="modal-overlay" role="button" tabindex="0" onclick={onClose} onkeydown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose(); }}>
  <div class="modal-content" role="dialog" aria-modal="true" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} tabindex="-1">
    <!-- Header -->
    <header class="modal-header">
      <h2 class="modal-title">Invite Student</h2>
      <button class="close-btn" onclick={onClose} aria-label="Close">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6 6 18"/>
          <path d="m6 6 12 12"/>
        </svg>
      </button>
    </header>

    <!-- Success Message -->
    {#if showSuccess}
      <div class="success-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>Invitation sent successfully!</span>
      </div>
    {/if}

    <!-- Invite Form -->
    <form class="invite-form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div class="form-group">
        <label for="invite-email">Email Address</label>
        <input
          id="invite-email"
          type="email"
          placeholder="student@example.com"
          bind:value={email}
          class:error={!!emailError}
          disabled={isSubmitting}
        />
        {#if emailError}
          <span class="error-message">{emailError}</span>
        {/if}
      </div>

      {#if classes.length > 0}
        <div class="form-group">
          <label for="invite-class">Add to Class (Optional)</label>
          <select id="invite-class" bind:value={selectedClassId} disabled={isSubmitting}>
            <option value="">-- Select a class --</option>
            {#each classes as classOption}
              <option value={classOption.id}>{classOption.name}</option>
            {/each}
          </select>
        </div>
      {/if}

      <div class="form-actions">
        <Button variant="ghost" onclick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" disabled={isSubmitting}>
          {#if isSubmitting}
            <span class="spinner"></span>
            Sending...
          {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="m12 5 7 7-7 7"/>
            </svg>
            Send Invite
          {/if}
        </Button>
      </div>
    </form>

    <!-- Pending Invitations -->
    {#if pendingInvitations.length > 0}
      <section class="pending-section">
        <h3 class="section-title">Pending Invitations</h3>
        <div class="pending-list">
          {#each pendingInvitations as invitation (invitation.id)}
            <div class="pending-item">
              <div class="pending-info">
                <span class="pending-email">{invitation.email}</span>
                {#if invitation.className}
                  <Badge variant="secondary">{invitation.className}</Badge>
                {/if}
                <span class="pending-expiry">
                  Expires in {getDaysUntilExpiry(invitation.expiresAt)} days
                </span>
              </div>
              <button
                class="cancel-btn"
                onclick={() => handleCancelInvite(invitation.id)}
                title="Cancel invitation"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          {/each}
        </div>
      </section>
    {/if}
  </div>
</div>

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    width: 100%;
    max-width: 480px;
    max-height: 90vh;
    overflow-y: auto;
    background: linear-gradient(135deg, #1a1a1f 0%, #151519 100%);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 1.25rem;
    font-weight: 700;
    color: #f5f5f5;
    margin: 0;
  }

  .close-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #f5f5f5;
  }

  .success-message {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 1rem 1.5rem 0;
    padding: 1rem;
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.3);
    border-radius: 4px;
    color: #4ade80;
    animation: slideDown 0.3s ease;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .invite-form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 0.5rem;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #f5f5f5;
    font-size: 0.9375rem;
    transition: all 0.2s ease;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #f0a500;
    box-shadow: 0 0 0 2px rgba(240, 165, 0, 0.2);
  }

  .form-group input.error {
    border-color: #ef4444;
  }

  .form-group input::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }

  .error-message {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: #ef4444;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #f5f5f5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .pending-section {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .section-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #f5f5f5;
    margin: 0 0 1rem 0;
  }

  .pending-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .pending-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .pending-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .pending-email {
    font-size: 0.875rem;
    font-weight: 500;
    color: #f5f5f5;
  }

  .pending-expiry {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .cancel-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: 4px;
    color: rgba(255, 255, 255, 0.4);
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .cancel-btn:hover {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
  }
</style>
