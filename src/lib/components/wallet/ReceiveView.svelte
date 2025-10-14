<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import type { NDKCashuDeposit } from '@nostr-dev-kit/wallet';
  import QRCode from './QRCode.svelte';

  const wallet = ndk.$wallet;

  let activeTab = $state<'paste' | 'mint'>('mint');
  let tokenInput = $state('');
  let mintAmount = $state('');
  let isProcessing = $state(false);
  let error = $state('');
  let success = $state<{ amount: number } | null>(null);
  let depositInstance = $state<NDKCashuDeposit | null>(null);
  let depositInvoice = $state<string | null>(null);
  let isCheckingPayment = $state(false);

  let availableMints = $derived(wallet.mints || []);
  let selectedMint = $state<string>('');

  $effect(() => {
    if (availableMints.length > 0 && !selectedMint) {
      selectedMint = availableMints[0].url;
    }
  });

  async function handleReceive() {
    if (!tokenInput.trim()) return;

    isProcessing = true;
    error = '';

    try {
      await wallet.receiveToken(tokenInput.trim());

      success = { amount: 0 };
      tokenInput = '';
    } catch (e: any) {
      error = e.message || 'Failed to receive token';
      console.error(e);
    } finally {
      isProcessing = false;
    }
  }

  async function handleMint() {
    const amount = Number(mintAmount);
    if (!amount || amount <= 0) return;

    if (!selectedMint) {
      error = 'No mint selected';
      return;
    }

    isProcessing = true;
    error = '';

    try {
      const deposit = wallet.deposit(amount, selectedMint);

      if (!deposit) {
        throw new Error('Failed to create deposit request');
      }

      depositInstance = deposit;

      deposit.on('success', () => {
        success = { amount };
        mintAmount = '';
        depositInstance = null;
        depositInvoice = null;
        isCheckingPayment = false;
        isProcessing = false;
      });

      deposit.on('error', (err) => {
        error = err.message || 'Deposit failed';
        isCheckingPayment = false;
        isProcessing = false;
      });

      const bolt11 = await deposit.start();
      depositInvoice = bolt11;

    } catch (e: any) {
      error = e.message || 'Failed to create mint request';
      console.error(e);
    } finally {
      isProcessing = false;
    }
  }

  function setPresetAmount(amount: number) {
    mintAmount = amount.toString();
  }

  async function checkMintQuote() {
    if (!depositInstance) return;

    isCheckingPayment = true;
    error = '';

    try {
      await depositInstance.check();
    } catch (e: any) {
      error = e.message || 'Failed to check payment status';
      console.error(e);
    } finally {
      isCheckingPayment = false;
    }
  }

  function copyInvoice() {
    if (depositInvoice) {
      navigator.clipboard.writeText(depositInvoice);
    }
  }

  function cancelMint() {
    depositInstance = null;
    depositInvoice = null;
    isCheckingPayment = false;
    error = '';
  }

  function reset() {
    success = null;
    error = '';
  }
</script>

<div class="receive-view">
  {#if success}
    <div class="success-screen">
      <div class="success-backdrop"></div>
      <div class="success-content">
        <div class="success-ring">
          <div class="success-checkmark">✓</div>
        </div>
        <h3 class="success-title">Payment Received!</h3>
        <p class="success-amount">{new Intl.NumberFormat('en-US').format(success.amount)} sats</p>
        <button class="primary" onclick={reset}>
          Continue
        </button>
      </div>
    </div>
  {:else}
    <div class="tabs">
      <button
        class:active={activeTab === 'mint'}
        onclick={() => activeTab = 'mint'}
      >
        Deposit
      </button>
      <button
        class:active={activeTab === 'paste'}
        onclick={() => activeTab = 'paste'}
      >
        Paste Token
      </button>
    </div>

    {#if activeTab === 'paste'}
      <div class="tab-content">
        <div class="form-section">
          <label for="token">Cashu Token</label>
          <textarea
            id="token"
            bind:value={tokenInput}
            placeholder="Paste cashu token here..."
            rows="6"
          ></textarea>
          <p class="hint">Paste a cashu token to redeem it into your wallet</p>
        </div>

        {#if error}
          <div class="error-message">{error}</div>
        {/if}

        <button
          class="primary"
          onclick={handleReceive}
          disabled={!tokenInput.trim() || isProcessing}
        >
          {#if isProcessing}
            Processing...
          {:else}
            Redeem Token
          {/if}
        </button>
      </div>
    {:else}
      <div class="tab-content">
        {#if !depositInstance}
          <div class="form-section">
            <label for="mint">Select Mint</label>
            <select id="mint" bind:value={selectedMint}>
              {#each availableMints as mint}
                <option value={mint.url}>{mint.url}</option>
              {/each}
            </select>
            {#if availableMints.length === 0}
              <p class="hint">No mints configured in your wallet</p>
            {/if}
          </div>

          <div class="form-section">
            <label for="amount">Amount (sats)</label>
            <div class="amount-input-group">
              <input
                id="amount"
                type="number"
                bind:value={mintAmount}
                placeholder="100"
                min="1"
              />
              <span class="amount-unit">sats</span>
            </div>

            <div class="preset-buttons">
              <button type="button" class="preset-btn" onclick={() => setPresetAmount(1000)}>1k</button>
              <button type="button" class="preset-btn" onclick={() => setPresetAmount(5000)}>5k</button>
              <button type="button" class="preset-btn" onclick={() => setPresetAmount(10000)}>10k</button>
              <button type="button" class="preset-btn" onclick={() => setPresetAmount(21000)}>21k</button>
              <button type="button" class="preset-btn" onclick={() => setPresetAmount(100000)}>100k</button>
            </div>
          </div>

          {#if error}
            <div class="error-message">{error}</div>
          {/if}

          <button
            class="primary"
            onclick={handleMint}
            disabled={!mintAmount || Number(mintAmount) <= 0 || !selectedMint || isProcessing}
          >
            {#if isProcessing}
              Creating Deposit...
            {:else}
              Create Deposit
            {/if}
          </button>
        {:else}
          <div class="quote-display">
            <h4>Lightning Invoice</h4>
            <p class="quote-amount">{Number(mintAmount).toLocaleString()} sats</p>

            {#if depositInvoice}
              <div class="qr-container">
                <div class="qr-wrapper">
                  <QRCode value={depositInvoice.toUpperCase()} size={280} />
                </div>
              </div>

              <div class="invoice-box">
                <label>Invoice String</label>
                <div class="invoice-text">{depositInvoice}</div>
                <button class="copy-button" onclick={copyInvoice}>
                  <span class="copy-icon">📋</span> Copy Invoice
                </button>
              </div>

              <div class="waiting-status">
                <div class="spinner"></div>
                <p>Waiting for payment...</p>
              </div>
            {/if}

            <div class="quote-actions">
              <button onclick={cancelMint}>
                Cancel
              </button>
            </div>

            {#if error}
              <div class="error-message">{error}</div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}
  {/if}
</div>

<style>
  .receive-view {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
    padding: 0.25rem;
    background: var(--color-muted);
    border-radius: 12px;
  }

  .tabs button {
    padding: 0.75rem 1rem;
    background: transparent;
    border: none;
    border-radius: 8px;
    transition: all 0.2s;
    color: var(--color-foreground);
  }

  .tabs button.active {
    background: var(--color-primary);
    color: white;
    font-weight: 600;
  }

  .tab-content {
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

  input, textarea, select {
    width: 100%;
    padding: 0.875rem 1rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    color: var(--color-foreground);
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  input:focus, textarea:focus, select:focus {
    outline: none;
    border-color: var(--color-primary);
    background: var(--color-muted);
  }

  select {
    cursor: pointer;
  }

  select option {
    background: var(--color-card);
    color: var(--color-foreground);
  }

  textarea {
    min-height: 120px;
    resize: vertical;
    font-family: monospace;
    font-size: 0.75rem;
  }

  .hint {
    font-size: 0.875rem;
    color: var(--color-muted-foreground);
    margin: 0;
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

  .preset-buttons {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }

  .preset-btn {
    flex: 1;
    padding: 0.5rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-primary);
    transition: all 0.2s;
  }

  .preset-btn:hover {
    background: var(--color-card);
    border-color: var(--color-primary);
    transform: translateY(-1px);
  }

  .success-screen {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .success-backdrop {
    position: absolute;
    inset: 0;
    background: var(--color-background);
    opacity: 0.95;
    animation: fadeIn 0.4s ease-out;
  }

  .success-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;
    padding: 2rem;
  }

  .success-ring {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: var(--color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .success-checkmark {
    font-size: 4rem;
    color: white;
    animation: checkmarkPop 0.4s 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }

  .success-title {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--color-foreground);
    animation: fadeSlideUp 0.4s 0.5s ease-out both;
  }

  .success-amount {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0;
    animation: fadeSlideUp 0.4s 0.6s ease-out both;
  }

  .success-screen button {
    width: 100%;
    max-width: 200px;
    animation: fadeSlideUp 0.4s 0.7s ease-out both;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes checkmarkPop {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }

  @keyframes fadeSlideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .quote-display {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem 0;
  }

  .quote-display h4 {
    text-align: center;
    margin: 0;
    font-size: 1.25rem;
    color: var(--color-foreground);
  }

  .quote-amount {
    text-align: center;
    font-size: 2rem;
    font-weight: 700;
    color: var(--color-primary);
    margin: 0;
  }

  .qr-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  }

  .qr-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background: white;
    padding: 0.5rem;
    border-radius: 8px;
  }

  .waiting-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .waiting-status p {
    margin: 0;
    color: var(--color-foreground);
    font-weight: 500;
  }

  .invoice-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 1rem;
  }

  .invoice-box label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted-foreground);
    font-weight: 600;
  }

  .invoice-text {
    font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
    font-size: 0.7rem;
    word-break: break-all;
    color: var(--color-foreground);
    line-height: 1.6;
    padding: 1rem;
    background: var(--color-muted);
    border-radius: 8px;
    max-height: 100px;
    overflow-y: auto;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .copy-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    color: var(--color-primary);
    font-weight: 600;
  }

  .copy-button:hover {
    background: var(--color-card);
    border-color: var(--color-primary);
  }

  .copy-icon {
    font-size: 1.1rem;
  }

  .checking-status {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1rem;
    background: var(--color-muted);
    border: 1px solid var(--color-border);
    border-radius: 12px;
  }

  .checking-status p {
    margin: 0;
    color: var(--color-foreground);
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid var(--color-muted);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .quote-actions {
    display: flex;
    gap: 0.75rem;
  }

  .quote-actions button {
    flex: 1;
  }
</style>
