<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';

  const wallet = ndk.$wallet;

  let amount = $state('');
  let memo = $state('');
  let recipient = $state('');
  let isSending = $state(false);
  let token = $state<string | null>(null);
  let error = $state('');

  const balance = $derived(wallet.balance || 0);
  const amountNum = $derived(Number(amount) || 0);
  const canSend = $derived(amountNum > 0 && amountNum <= balance && !isSending);

  function formatBalance(sats: number): string {
    return new Intl.NumberFormat('en-US').format(sats);
  }

  async function handleSend() {
    if (!canSend) return;

    isSending = true;
    error = '';

    try {
      // Use wallet to generate token
      token = await wallet.send(amountNum, memo || undefined);
    } catch (e: any) {
      error = e.message || 'Failed to send';
      console.error(e);
    } finally {
      isSending = false;
    }
  }

  function copyToken() {
    if (token) {
      navigator.clipboard.writeText(token);
    }
  }

  function reset() {
    amount = '';
    memo = '';
    recipient = '';
    token = null;
    error = '';
  }
</script>

<div class="send-view">
  {#if !token}
    <div class="send-form">
      <div class="form-section">
        <label for="amount">Amount</label>
        <div class="amount-input-group">
          <input
            id="amount"
            type="number"
            bind:value={amount}
            placeholder="0"
            min="1"
            max={balance}
          />
          <span class="amount-unit">sats</span>
        </div>
        <div class="balance-info">
          Available: {formatBalance(balance)} sats
        </div>
      </div>

      <div class="form-section">
        <label for="memo">Memo (optional)</label>
        <textarea
          id="memo"
          bind:value={memo}
          placeholder="What's this for?"
        ></textarea>
      </div>

      {#if error}
        <div class="error-message">
          {error}
        </div>
      {/if}

      <button
        class="primary"
        onclick={handleSend}
        disabled={!canSend}
      >
        {#if isSending}
          Generating Token...
        {:else}
          Generate Token
        {/if}
      </button>
    </div>
  {:else}
    <div class="token-result">
      <div class="success-icon">✓</div>
      <h3>Token Generated!</h3>
      <p class="success-message">{formatBalance(amountNum)} sats ready to send</p>

      <div class="token-display">
        <div class="token-text">{token}</div>
        <button class="copy-button" onclick={copyToken}>
          📋 Copy
        </button>
      </div>

      {#if memo}
        <div class="memo-display">
          <strong>Memo:</strong> {memo}
        </div>
      {/if}

      <div class="actions">
        <button class="primary" onclick={reset}>Send Another</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .send-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .send-form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-foreground);
  }

  input, textarea {
    width: 100%;
    padding: 0.875rem 1rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-foreground);
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: var(--color-primary);
    background: var(--color-muted);
  }

  textarea {
    min-height: 80px;
    resize: vertical;
  }

  .amount-input-group {
    position: relative;
    display: flex;
    align-items: center;
  }

  .amount-input-group input {
    padding-right: 60px;
  }

  .amount-unit {
    position: absolute;
    right: 1rem;
    color: var(--color-muted-foreground);
    font-weight: 600;
    pointer-events: none;
  }

  .balance-info {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
  }

  .error-message {
    background: var(--color-destructive);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    padding: 0.75rem;
    color: var(--color-foreground);
    font-size: 0.875rem;
  }

  button {
    padding: 0.875rem 1.5rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-foreground);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  button:hover:not(:disabled) {
    background: var(--color-muted);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button.primary {
    background: var(--color-primary);
    border: none;
    color: white;
  }

  button.primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .token-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem 1rem;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    color: white;
  }

  h3 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-foreground);
  }

  .success-message {
    color: var(--color-muted-foreground);
    text-align: center;
  }

  .token-display {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1rem;
  }

  .token-text {
    font-family: monospace;
    font-size: 0.75rem;
    word-break: break-all;
    color: var(--color-foreground);
    line-height: 1.5;
  }

  .copy-button {
    width: 100%;
  }

  .memo-display {
    width: 100%;
    padding: 1rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 0.875rem;
    color: var(--color-foreground);
  }

  .actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  .actions button {
    flex: 1;
  }
</style>
