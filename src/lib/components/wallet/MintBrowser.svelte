<script lang="ts">
  import { ndk } from '$lib/ndk.svelte';
  import { createMintDiscoveryStore, type MintMetadata } from '@nostr-dev-kit/wallet';
  import { onDestroy } from 'svelte';

  interface Props {
    onSelectMints: (mints: string[]) => void;
    onClose: () => void;
  }

  let { onSelectMints, onClose }: Props = $props();

  // Create mint discovery store
  const mintStore = createMintDiscoveryStore(ndk, {
    network: 'mainnet',
    timeout: 0, // No auto-timeout
  });

  let discoveredMints = $state<MintMetadata[]>([]);
  let selectedMints = $state<Set<string>>(new Set());
  let showManualInput = $state(false);
  let manualMintUrl = $state('');
  let manualMintError = $state('');

  // Subscribe to the Zustand store
  const unsubscribe = mintStore.subscribe((state) => {
    discoveredMints = state.mints;
  });

  onDestroy(() => {
    unsubscribe();
    mintStore.getState().stop();
  });

  function getHostnameFromUrl(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  function toggleMint(url: string) {
    const newSelection = new Set(selectedMints);
    if (newSelection.has(url)) {
      newSelection.delete(url);
    } else {
      newSelection.add(url);
    }
    selectedMints = newSelection;
  }

  function addManualMint() {
    const trimmedUrl = manualMintUrl.trim();

    // Validate URL
    try {
      const url = new URL(trimmedUrl);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        manualMintError = 'Please use https:// or http:// URL';
        return;
      }
    } catch {
      manualMintError = 'Please enter a valid mint URL';
      return;
    }

    // Check if already added
    if (selectedMints.has(trimmedUrl)) {
      manualMintError = 'This mint has already been selected';
      return;
    }

    if (discoveredMints.some((m) => m.url === trimmedUrl)) {
      manualMintError = 'This mint is already in the list below';
      return;
    }

    // Add to selected mints
    const newSelection = new Set(selectedMints);
    newSelection.add(trimmedUrl);
    selectedMints = newSelection;

    // Reset form
    manualMintUrl = '';
    showManualInput = false;
    manualMintError = '';
  }

  function toggleManualInput() {
    showManualInput = !showManualInput;
    manualMintUrl = '';
    manualMintError = '';
  }

  function handleAddSelected() {
    if (selectedMints.size === 0) return;
    onSelectMints(Array.from(selectedMints));
  }

  // Custom mints that were manually added (not in discovered list)
  const customMints = $derived(
    Array.from(selectedMints).filter(
      (mintUrl) => !discoveredMints.some((m) => m.url === mintUrl)
    )
  );
</script>

<div class="modal-backdrop" onclick={onClose}>
  <div class="modal-content" onclick={(e) => e.stopPropagation()}>
    <!-- Header -->
    <div class="modal-header">
      <h2>Browse Mints</h2>
      <button class="close-button" onclick={onClose}>✕</button>
    </div>

    <div class="modal-body">
      <!-- Info Card -->
      <div class="info-card">
        <div class="info-icon">ℹ️</div>
        <div class="info-text">
          Mints are custodial services that issue ecash tokens. Select multiple mints to spread risk.
        </div>
      </div>

      <!-- Manual mint input -->
      <div class="manual-mint-section">
        <button class="toggle-button" onclick={toggleManualInput}>
          <span>{showManualInput ? '−' : '+'}</span>
          Add Custom Mint
        </button>

        {#if showManualInput}
          <div class="manual-input-form">
            <input
              type="url"
              bind:value={manualMintUrl}
              placeholder="https://mint.example.com"
              class="mint-url-input"
            />
            <button class="add-button" onclick={addManualMint} disabled={!manualMintUrl.trim()}>
              Add
            </button>
          </div>

          {#if manualMintError}
            <div class="error-message">{manualMintError}</div>
          {/if}
        {/if}
      </div>

      <!-- Discovered mints -->
      {#if discoveredMints.length > 0}
        <div class="mint-list">
          {#each discoveredMints as mint}
            <button class="mint-item" class:selected={selectedMints.has(mint.url)} onclick={() => toggleMint(mint.url)}>
              <div class="checkbox-container">
                <div class="checkbox" class:checked={selectedMints.has(mint.url)}>
                  {#if selectedMints.has(mint.url)}
                    <div class="checkmark">✓</div>
                  {/if}
                </div>
              </div>

              <div class="mint-icon">
                {#if mint.icon}
                  <img src={mint.icon} alt={mint.name || mint.url} />
                {:else}
                  <div class="icon-placeholder">🏦</div>
                {/if}
              </div>

              <div class="mint-info">
                <div class="mint-name">{mint.name || getHostnameFromUrl(mint.url)}</div>
                {#if mint.description}
                  <div class="mint-description">
                    {mint.description}
                  </div>
                {/if}
                <div class="mint-url">{mint.url}</div>
                {#if mint.recommendations.length > 0}
                  <div class="mint-recommendations">
                    ⭐ Recommended by {mint.recommendations.length} user{mint.recommendations.length === 1
                      ? ''
                      : 's'}
                  </div>
                {/if}
                {#if mint.isOnline !== undefined}
                  <div class="mint-status" class:online={mint.isOnline}>
                    {mint.isOnline ? '🟢 Online' : '🔴 Offline'}
                  </div>
                {/if}
              </div>
            </button>
          {/each}
        </div>
      {:else}
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <p>Discovering mints from the network...</p>
          <p class="empty-hint">Add custom mints above or wait for discovery</p>
        </div>
      {/if}

      <!-- Custom mints section -->
      {#if customMints.length > 0}
        <div class="custom-mints-section">
          <h4>Custom Mints</h4>
          <div class="mint-list">
            {#each customMints as mintUrl}
              <div class="mint-item custom selected">
                <div class="mint-icon">
                  <div class="icon-placeholder">🏦</div>
                </div>

                <div class="mint-info">
                  <div class="mint-name">{getHostnameFromUrl(mintUrl)}</div>
                  <div class="mint-url">{mintUrl}</div>
                </div>

                <button class="remove-button" onclick={() => toggleMint(mintUrl)}>
                  ✕
                </button>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="modal-footer">
      {#if selectedMints.size > 0}
        <div class="selection-count">
          <span class="count-icon">✓</span>
          {selectedMints.size} mint{selectedMints.size === 1 ? '' : 's'} selected
        </div>
      {/if}

      <div class="action-buttons">
        <button class="button secondary" onclick={onClose}>
          Cancel
        </button>
        <button class="button primary" onclick={handleAddSelected} disabled={selectedMints.size === 0}>
          Add Selected Mints
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: linear-gradient(to bottom, #0a0a0a, #000000);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
  }

  .close-button {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .info-card {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    border-radius: 12px;
  }

  .info-icon {
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .info-text {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.5;
  }

  .manual-mint-section {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
  }

  .toggle-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9375rem;
    font-weight: 600;
    cursor: pointer;
    text-align: left;
  }

  .toggle-button span {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    background: rgba(249, 115, 22, 0.2);
    color: #f97316;
    border-radius: 6px;
    font-size: 1.125rem;
    font-weight: bold;
  }

  .manual-input-form {
    display: flex;
    gap: 0.5rem;
  }

  .mint-url-input {
    flex: 1;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    font-size: 0.875rem;
    font-family: monospace;
  }

  .mint-url-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .add-button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .add-button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .add-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    padding: 0.75rem;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #f87171;
    font-size: 0.875rem;
  }

  .mint-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .mint-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    width: 100%;
  }

  .mint-item:not(.custom):hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(249, 115, 22, 0.3);
    transform: translateY(-1px);
  }

  .mint-item.selected {
    background: rgba(249, 115, 22, 0.15);
    border-color: rgba(249, 115, 22, 0.5);
  }

  .mint-item.custom {
    cursor: default;
  }

  .mint-icon {
    width: 48px;
    height: 48px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(249, 115, 22, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mint-icon img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .icon-placeholder {
    font-size: 1.5rem;
  }

  .mint-info {
    flex: 1;
    min-width: 0;
  }

  .mint-name {
    font-size: 1rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.25rem;
  }

  .mint-description {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 0.25rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .mint-url {
    font-size: 0.8125rem;
    font-family: monospace;
    color: rgba(255, 255, 255, 0.5);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mint-recommendations {
    font-size: 0.8125rem;
    color: rgba(234, 179, 8, 0.9);
    margin-top: 0.25rem;
  }

  .mint-status {
    font-size: 0.75rem;
    color: rgba(239, 68, 68, 0.9);
    margin-top: 0.25rem;
  }

  .mint-status.online {
    color: rgba(34, 197, 94, 0.9);
  }

  .checkbox-container {
    display: flex;
    align-items: center;
    padding-left: 0.25rem;
  }

  .checkbox {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: rgba(255, 255, 255, 0.05);
  }

  .checkbox.checked {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    border-color: #f97316;
  }

  .checkmark {
    color: white;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1;
  }

  .remove-button {
    width: 32px;
    height: 32px;
    padding: 0;
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    color: #ef4444;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
    align-self: center;
  }

  .remove-button:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.02);
    border: 1px dashed rgba(255, 255, 255, 0.1);
    border-radius: 12px;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-state p {
    margin: 0.25rem 0;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-hint {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.4);
  }

  .custom-mints-section {
    padding-top: 0.5rem;
  }

  .custom-mints-section h4 {
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 0.75rem 0;
  }

  .modal-footer {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .selection-count {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem;
    background: rgba(249, 115, 22, 0.1);
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .count-icon {
    color: #f97316;
  }

  .action-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .button {
    flex: 1;
    padding: 0.875rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .button.primary {
    background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
    color: white;
  }

  .button.primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }

  .button.primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .button.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: white;
  }

  .button.secondary:hover {
    background: rgba(255, 255, 255, 0.08);
  }

  /* Scrollbar styling */
  .modal-body::-webkit-scrollbar {
    width: 8px;
  }

  .modal-body::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
  }

  .modal-body::-webkit-scrollbar-thumb {
    background: rgba(249, 115, 22, 0.5);
    border-radius: 4px;
  }

  .modal-body::-webkit-scrollbar-thumb:hover {
    background: rgba(249, 115, 22, 0.7);
  }
</style>
