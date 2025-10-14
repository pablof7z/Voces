<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import BalanceCard from './BalanceCard.svelte';
  import SendView from './SendView.svelte';
  import ReceiveView from './ReceiveView.svelte';

  type TabView = 'wallet' | 'send' | 'receive' | 'scan';
  let currentTab = $state<TabView>('wallet');
</script>

<div class="wallet-container">
  <!-- Header -->
  <div class="wallet-header">
    {#if currentTab !== 'wallet'}
      <button class="back-btn" onclick={() => currentTab = 'wallet'}>
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    {/if}
    <h1>
      {#if currentTab === 'wallet'}
        Wallet
      {:else if currentTab === 'send' || currentTab === 'scan'}
        Send
      {:else if currentTab === 'receive'}
        Receive
      {/if}
    </h1>
  </div>

  <!-- Content -->
  <div class="wallet-content">
    {#if currentTab === 'wallet'}
      <div class="balance-section">
        <BalanceCard />
      </div>

      <div class="action-buttons">
        <button class="action-btn send" onclick={() => currentTab = 'send'}>
          <span class="action-icon">↑</span>
          <span class="action-label">Send</span>
        </button>
        <button class="action-btn scan" onclick={() => currentTab = 'scan'}>
          <svg class="action-icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="4" y="4" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none" rx="1"/>
            <rect x="14" y="4" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none" rx="1"/>
            <rect x="4" y="14" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none" rx="1"/>
            <rect x="14" y="14" width="6" height="6" stroke="currentColor" stroke-width="2" fill="none" rx="1"/>
          </svg>
          <span class="action-label">Scan QR</span>
        </button>
        <button class="action-btn receive" onclick={() => currentTab = 'receive'}>
          <span class="action-icon">↓</span>
          <span class="action-label">Receive</span>
        </button>
      </div>
    {:else if currentTab === 'send' || currentTab === 'scan'}
      <SendView />
    {:else if currentTab === 'receive'}
      <ReceiveView />
    {/if}
  </div>
</div>

<style>
  .wallet-container {
    width: 100%;
  }

  .wallet-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-border);
    background: var(--color-background);
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .back-btn {
    padding: 0.5rem;
    background: transparent;
    border: none;
    color: var(--color-foreground);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    border-radius: 8px;
  }

  .back-btn:hover {
    background: var(--color-muted);
  }

  .back-btn svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: var(--color-foreground);
  }

  .wallet-content {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    padding: 1rem;
  }

  .balance-section {
    margin-bottom: 2rem;
  }

  .action-buttons {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.75rem;
  }

  .action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    padding: 1.5rem 1rem;
    background: var(--color-card);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    color: var(--color-foreground);
    font-size: 0.9rem;
    font-weight: 600;
  }

  .action-btn:hover {
    background: var(--color-muted);
    border-color: var(--color-primary);
    transform: translateY(-2px);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .action-icon {
    font-size: 1.75rem;
    line-height: 1;
    transition: transform 0.2s;
    color: var(--color-primary);
  }

  .action-icon-svg {
    width: 1.75rem;
    height: 1.75rem;
    transition: transform 0.2s;
    color: var(--color-primary);
  }

  .action-btn:hover .action-icon,
  .action-btn:hover .action-icon-svg {
    transform: scale(1.1);
  }

  .action-label {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted-foreground);
  }

  @media (max-width: 640px) {
    .wallet-container {
      padding: 0.5rem;
    }

    .wallet-card {
      padding: 1.5rem;
      border-radius: 8px;
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .action-btn {
      padding: 1.25rem 0.75rem;
      gap: 0.5rem;
    }

    .action-icon {
      font-size: 1.5rem;
    }

    .action-icon-svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    .action-label {
      font-size: 0.75rem;
    }
  }
</style>
