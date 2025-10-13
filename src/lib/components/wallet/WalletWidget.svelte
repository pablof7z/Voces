<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { useWallet } from '$lib/utils/useWallet.svelte';
  import BalanceCard from './BalanceCard.svelte';
  import SendView from './SendView.svelte';
  import ReceiveView from './ReceiveView.svelte';

  const wallet = useWallet(ndk);

  type TabView = 'wallet' | 'send' | 'receive' | 'scan';
  let currentTab = $state<TabView>('wallet');
</script>

<div class="wallet-container">
  <div class="wallet-content">
    <div class="wallet-card">
      <h1 class="gradient-text">Wallet</h1>

      {#if currentTab === 'wallet'}
        <div class="balance-section">
          <BalanceCard {wallet} />
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
      {:else if currentTab === 'send'}
        <SendView {wallet} onBack={() => currentTab = 'wallet'} />
      {:else if currentTab === 'receive'}
        <ReceiveView {wallet} onBack={() => currentTab = 'wallet'} />
      {:else if currentTab === 'scan'}
        <!-- Scan QR - redirect to send for now, can be enhanced later with camera -->
        <SendView {wallet} onBack={() => currentTab = 'wallet'} />
      {/if}
    </div>
  </div>
</div>

<style>
  .wallet-container {
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
  }

  .wallet-content {
    width: 100%;
    max-width: 600px;
  }

  .wallet-card {
    background: rgba(20, 20, 20, 0.6);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 2.5rem;
    box-shadow:
      0 20px 60px rgba(0, 0, 0, 0.4),
      0 0 0 1px rgba(249, 115, 22, 0.05);
  }

  h1 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 2rem 0;
    text-align: center;
  }

  .gradient-text {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
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
    padding: 2rem 1.5rem;
    background: rgba(30, 30, 30, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    cursor: pointer;
    transition: all 0.2s;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    font-weight: 600;
  }

  .action-btn:hover {
    background: rgba(40, 40, 40, 0.9);
    border-color: rgba(249, 115, 22, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }

  .action-btn:active {
    transform: translateY(0);
  }

  .action-btn.send:hover {
    border-color: rgba(249, 115, 22, 0.5);
    background: rgba(249, 115, 22, 0.1);
  }

  .action-btn.receive:hover {
    border-color: rgba(34, 197, 94, 0.5);
    background: rgba(34, 197, 94, 0.1);
  }

  .action-btn.scan:hover {
    border-color: rgba(168, 85, 247, 0.5);
    background: rgba(168, 85, 247, 0.1);
  }

  .action-icon {
    font-size: 2rem;
    line-height: 1;
    transition: transform 0.2s;
  }

  .action-icon-svg {
    width: 2rem;
    height: 2rem;
    transition: transform 0.2s;
  }

  .action-btn:hover .action-icon,
  .action-btn:hover .action-icon-svg {
    transform: scale(1.15);
  }

  .action-btn.send .action-icon {
    color: #f97316;
  }

  .action-btn.receive .action-icon {
    color: #22c55e;
  }

  .action-btn.scan .action-icon-svg {
    color: #a855f7;
  }

  .action-label {
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  @media (max-width: 640px) {
    .wallet-container {
      padding: 1rem;
      align-items: flex-start;
    }

    .wallet-card {
      padding: 1.5rem;
    }

    h1 {
      font-size: 1.5rem;
    }

    .action-btn {
      padding: 1.5rem 1rem;
    }
  }
</style>
