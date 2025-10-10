<script lang="ts">
  import type { WalletAPI } from '$lib/utils/useWallet.svelte';

  interface Props {
    wallet: WalletAPI;
  }

  let { wallet }: Props = $props();

  const balance = $derived(wallet.balance || 0);

  function formatBalance(sats: number): string {
    return new Intl.NumberFormat('en-US').format(sats);
  }
</script>

<div class="balance-card">
  <div class="balance-amount">
    <span class="amount gradient-text">{formatBalance(balance)}</span>
    <span class="unit">sats</span>
  </div>

  {#if wallet.status === 'loading'}
    <div class="status-badge loading">
      <div class="spinner"></div>
      <span>Loading wallet...</span>
    </div>
  {:else if wallet.status === 'error'}
    <div class="status-badge error">
      ⚠️ Error loading wallet
    </div>
  {/if}
</div>

<style>
  .balance-card {
    position: relative;
    padding: 2rem 1rem;
    text-align: center;
  }

  .balance-amount {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  .amount {
    font-size: 4rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }

  .gradient-text {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .unit {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.5);
    font-weight: 600;
  }

  .status-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 500;
  }

  .status-badge.loading {
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.2);
    color: #f97316;
  }

  .status-badge.error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
  }

  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(249, 115, 22, 0.2);
    border-top-color: #f97316;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 640px) {
    .amount {
      font-size: 3rem;
    }

    .unit {
      font-size: 1.25rem;
    }
  }
</style>
