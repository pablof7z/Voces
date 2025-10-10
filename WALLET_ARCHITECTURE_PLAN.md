# Wallet Architecture Plan (REVISED)
## Leveraging ndk-wallet Through ndk-svelte5 in Voces

---

## Critical Discovery: ndk-wallet Already Has Everything!

### ndk-wallet Core (What Actually Exists)
**Location:** `@nostr-dev-kit/ndk-wallet`

**Complete Implementation:**
- ✅ `NDKCashuWallet` - Full NIP-60 Cashu wallet
  - ✅ `deposit(amount, mint)` - Returns `NDKCashuDeposit` instance
  - ✅ `receiveToken(token, description)` - Redeems Cashu tokens
  - ✅ `lnPay(payment)` - Lightning payments
  - ✅ `cashuPay(payment)` - Cashu payments
  - ✅ `start(opts)` - Auto-loads from Nostr events
  - ✅ `stop()` - Cleanup
  - ✅ `NDKCashuWallet.from(event)` - Discover existing wallet
  - ✅ Mint management (add/remove via `mints` array)
  - ✅ P2PK key management
  - ✅ Relay configuration (NIP-60 via kind 10019, NIP-65 fallback)
  - ✅ State management via `WalletState` class
  - ✅ Balance tracking (`balance`, `mintBalances`)
  - ✅ Event emitter (ready, balance_updated, insufficient_balance, warning)

- ✅ `NDKCashuDeposit` - Lightning invoice generation
  - ✅ `start()` - Creates mint quote and returns LN invoice
  - ✅ Auto-polling for payment confirmation
  - ✅ Events: 'success', 'error'
  - ✅ Creates quote event (kind 5303) for persistence

- ✅ `NDKNutzapMonitor` - Nutzap monitoring
  - ✅ Auto-discovery of nutzaps from relays
  - ✅ Proof redemption
  - ✅ State persistence via `NDKNutzapMonitorStore`
  - ✅ Events: 'seen', 'redeemed', 'failed', 'state_changed'

### ndk-svelte5 Wallet Store (Thin Svelte Wrapper)
**Location:** `@nostr-dev-kit/ndk-svelte5/stores/wallet.svelte.ts`

**Current Features:**
- ✅ Wraps `NDKWallet` (NDKCashuWallet, NDKNWCWallet, WebLN)
- ✅ Svelte 5 reactivity ($state)
- ✅ Transaction history tracking
- ✅ Nutzap event handling
- ✅ `init(ndk)`, `set(wallet)`, `pay()`

**Missing Exposed Functionality:**
- ❌ Doesn't expose `deposit()` method
- ❌ Doesn't expose `receiveToken()` method
- ❌ No auto-initialization with discovery
- ❌ No localStorage persistence
- ❌ Doesn't expose mint management
- ❌ No balance polling (relies on events only)

---

## Revised Architecture: Expose What Exists, Don't Rebuild

### Philosophy
**Don't Re-implement. Just Expose.**

ndk-wallet has all the business logic. ndk-svelte5 just needs to make it reactive and convenient.

---

## Phase 1: Minimal Enhancement to ndk-svelte5

**Location:** `ndk-svelte5/src/lib/stores/wallet.svelte.ts`

### 1.1 Add New Methods (Thin Wrappers)

```typescript
class WalletStore {
  // ... existing properties

  // NEW: Expose deposit
  deposit(amount: number, mint?: string): NDKCashuDeposit | undefined {
    if (!(this.currentWallet instanceof NDKCashuWallet)) return undefined;
    
    const targetMint = mint || this.currentWallet.mints[0];
    return this.currentWallet.deposit(amount, targetMint);
  }

  // NEW: Expose receiveToken
  async receiveToken(token: string, description?: string): Promise<void> {
    if (!(this.currentWallet instanceof NDKCashuWallet)) {
      throw new Error('Cashu wallet required');
    }
    
    await this.currentWallet.receiveToken(token, description);
    await this.updateBalance();
  }

  // NEW: Auto-initialize
  async initialize(
    ndk: NDK, 
    user: NDKUser,
    config?: { mints?: string[]; nutzapMonitorEnabled?: boolean }
  ): Promise<void> {
    // Try to find existing wallet
    const existingEvent = await ndk.fetchEvent({
      kinds: [NDKKind.CashuWallet],
      authors: [user.pubkey]
    });

    let wallet: NDKCashuWallet;

    if (existingEvent) {
      // Load from event
      wallet = await NDKCashuWallet.from(existingEvent) as NDKCashuWallet;
    } else {
      // Create new wallet
      wallet = new NDKCashuWallet(ndk);
      if (config?.mints) {
        wallet.mints = config.mints;
      }
    }

    // Start wallet (loads state from Nostr)
    await wallet.start();

    // Set wallet in store
    this.set(wallet);

    // Start nutzap monitor if requested
    if (config?.nutzapMonitorEnabled) {
      const monitor = new NDKNutzapMonitor(ndk, user, {
        store: this.getNutzapMonitorStore()
      });
      monitor.wallet = wallet;
      await this.startNutzapMonitor(monitor);
    }
  }

  // NEW: Get mint balance (expose from NDKCashuWallet)
  getMintBalances(): Map<string, number> {
    if (!(this.currentWallet instanceof NDKCashuWallet)) return new Map();
    return new Map(Object.entries(this.currentWallet.mintBalances));
  }

  // NEW: Add mint
  addMint(mint: string): void {
    if (!(this.currentWallet instanceof NDKCashuWallet)) return;
    if (!this.currentWallet.mints.includes(mint)) {
      this.currentWallet.mints.push(mint);
    }
  }

  // NEW: Remove mint
  removeMint(mint: string): void {
    if (!(this.currentWallet instanceof NDKCashuWallet)) return;
    this.currentWallet.mints = this.currentWallet.mints.filter(m => m !== mint);
  }

  // NEW: Get mints
  get mints(): string[] {
    if (!(this.currentWallet instanceof NDKCashuWallet)) return [];
    return this.currentWallet.mints;
  }

  // Helper for nutzap monitor store
  private getNutzapMonitorStore(): NDKNutzapMonitorStore {
    return {
      getAllNutzaps: async () => {
        // Convert our Map to the format expected
        const map = new Map<NDKEventId, NDKNutzapState>();
        for (const nutzap of this.nutzaps.pending) {
          map.set(nutzap.id, { status: NdkNutzapStatus.PENDING });
        }
        for (const nutzap of this.nutzaps.redeemed) {
          map.set(nutzap.id, { status: NdkNutzapStatus.REDEEMED });
        }
        for (const nutzap of this.nutzaps.failed) {
          map.set(nutzap.id, { status: NdkNutzapStatus.FAILED });
        }
        return map;
      },
      setNutzapState: async (id, state) => {
        // Update our tracking
      }
    };
  }
}
```

### 1.2 Add localStorage Persistence (Optional)

```typescript
class WalletStore {
  private saveToLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    const state = {
      mints: this.mints,
      nutzapStates: Array.from((await this.getNutzapMonitorStore().getAllNutzaps()).entries())
    };
    
    localStorage.setItem('ndk-wallet-state', JSON.stringify(state));
  }

  private loadFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = localStorage.getItem('ndk-wallet-state');
      if (stored) {
        const data = JSON.parse(stored);
        // Will be applied during initialization
      }
    } catch (e) {
      console.error('Failed to load wallet state:', e);
    }
  }
}
```

---

## Phase 2: Update Voces to Use Enhanced Store

### 2.1 Delete Custom Wallet Code

**Remove:**
- ❌ `src/lib/stores/wallet.svelte.ts`
- ❌ `src/lib/wallet/` (entire directory)
- ❌ `src/lib/utils/walletLogger.ts`
- ❌ `src/lib/utils/walletErrors.ts`

### 2.2 Integrate ndk-svelte5 Wallet

**Update:** `src/lib/ndk.svelte.ts`

```typescript
import { NDKSvelte, initStores } from '@nostr-dev-kit/ndk-svelte5';
import { wallet } from '@nostr-dev-kit/ndk-svelte5/stores';
import { sessions } from '@nostr-dev-kit/ndk-svelte5/stores';

const _ndk = new NDKSvelte({
  explicitRelayUrls: [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://relay.primal.net',
  ],
});

// Initialize stores
initStores();

// Auto-initialize wallet when user logs in
$effect(() => {
  if (sessions.current && !wallet.wallet) {
    wallet.initialize(_ndk, sessions.current.user, {
      mints: ['https://nofees.testnut.cashu.space'],
      nutzapMonitorEnabled: true,
    });
  }
});

export const ndk = _ndk;
```

### 2.3 Create Wallet UI Components

**Component Structure:**
```
src/lib/components/wallet/
├── WalletWidget.svelte          # Main wallet display
├── BalanceCard.svelte            # Balance display
├── DepositModal.svelte           # Lightning deposit UI
├── ReceiveTokenModal.svelte      # Cashu token redemption
├── SendModal.svelte              # Payment UI
├── MintManager.svelte            # Mint list/add/remove
├── TransactionList.svelte        # Transaction history
└── NutzapMonitor.svelte          # Nutzap status display
```

#### Example: `DepositModal.svelte`

```svelte
<script lang="ts">
  import { wallet } from '@nostr-dev-kit/ndk-svelte5/stores';
  import type { NDKCashuDeposit } from '@nostr-dev-kit/ndk-wallet';
  import QRCode from '@svelte-components/qr-code'; // or your QR component

  let amount = $state(1000);
  let invoice = $state<string | null>(null);
  let deposit = $state<NDKCashuDeposit | undefined>();
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  async function handleDeposit() {
    isLoading = true;
    error = null;

    try {
      deposit = wallet.deposit(amount);
      
      if (!deposit) {
        throw new Error('Failed to create deposit');
      }

      // Listen for events
      deposit.on('success', (token) => {
        console.log('Deposit successful!', token);
        invoice = null;
        deposit = undefined;
      });

      deposit.on('error', (err) => {
        error = err;
        isLoading = false;
      });

      // Start deposit and get invoice
      invoice = await deposit.start();
    } catch (e) {
      error = e.message;
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="modal">
  {#if !invoice}
    <h2>Deposit Funds</h2>
    <input type="number" bind:value={amount} min="1" />
    <button onclick={handleDeposit} disabled={isLoading}>
      {isLoading ? 'Creating...' : 'Create Invoice'}
    </button>
  {:else}
    <h2>Pay this invoice</h2>
    <QRCode value={invoice} />
    <div class="invoice-text">{invoice}</div>
    <button onclick={() => navigator.clipboard.writeText(invoice)}>
      Copy Invoice
    </button>
    <p class="hint">Waiting for payment...</p>
  {/if}

  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>
```

#### Example: `ReceiveTokenModal.svelte`

```svelte
<script lang="ts">
  import { wallet } from '@nostr-dev-kit/ndk-svelte5/stores';

  let token = $state('');
  let description = $state('');
  let isReceiving = $state(false);
  let success = $state(false);
  let error = $state<string | null>(null);

  async function handleReceive() {
    isReceiving = true;
    error = null;

    try {
      await wallet.receiveToken(token, description);
      success = true;
      token = '';
      description = '';
    } catch (e) {
      error = e.message;
    } finally {
      isReceiving = false;
    }
  }
</script>

<div class="modal">
  <h2>Receive Cashu Token</h2>

  {#if success}
    <div class="success">
      Token received successfully!
    </div>
  {/if}

  <textarea
    bind:value={token}
    placeholder="Paste Cashu token here (cashuA...)"
    rows="4"
  ></textarea>

  <input
    type="text"
    bind:value={description}
    placeholder="Description (optional)"
  />

  <button onclick={handleReceive} disabled={isReceiving || !token}>
    {isReceiving ? 'Receiving...' : 'Receive Token'}
  </button>

  {#if error}
    <div class="error">{error}</div>
  {/if}
</div>
```

---

## Implementation Timeline

### Week 1: ndk-svelte5 Enhancement
**Days 1-2:** Add new methods to wallet store (deposit, receiveToken, initialize, etc.)
**Days 3-4:** Add localStorage persistence
**Day 5:** Test with nutsack example app
**Days 6-7:** Documentation and polish

### Week 2: Voces Integration
**Days 1-2:** Remove custom wallet code, integrate ndk-svelte5 store
**Days 3-5:** Build wallet UI components
**Days 6-7:** Integration testing, bug fixes, polish

---

## Success Criteria

### ndk-svelte5
- ✅ `wallet.initialize()` auto-discovers existing wallets
- ✅ `wallet.deposit()` creates Lightning invoices
- ✅ `wallet.receiveToken()` redeems Cashu tokens
- ✅ Mint management works (add/remove)
- ✅ Nutzap monitoring tracks and redeems zaps
- ✅ State persists across page reloads

### Voces
- ✅ Wallet initializes on login
- ✅ Deposit flow works (create invoice → QR → auto-redeem)
- ✅ Receive token flow works
- ✅ Payment flow works
- ✅ Transaction history displays
- ✅ Mint manager works
- ✅ Error states show clearly
- ✅ UI matches voces-reference design

---

## Final API Reference

### ndk-svelte5 Wallet Store

```typescript
import { wallet } from '@nostr-dev-kit/ndk-svelte5/stores';

// Initialize (auto-discovers existing wallet)
await wallet.initialize(ndk, user, {
  mints: ['https://mint.example.com'],
  nutzapMonitorEnabled: true,
});

// Reactive state
wallet.balance // number
wallet.connected // boolean
wallet.type // 'nip-60' | 'nwc' | 'webln'
wallet.history // Transaction[]
wallet.nutzaps // { pending, redeemed, failed }
wallet.mints // string[]

// Operations
const deposit = wallet.deposit(1000, 'https://mint.com');
const invoice = await deposit.start(); // Returns LN invoice
deposit.on('success', (token) => { /* ... */ });

await wallet.receiveToken('cashuAey...');
await wallet.pay({ amount: 500, recipient: 'npub...' });

// Mint management
wallet.addMint('https://new-mint.com');
wallet.removeMint('https://old-mint.com');
wallet.getMintBalances(); // Map<mint, balance>

// Cleanup
wallet.clear();
```

---

## Key Differences from Original Plan

**ORIGINAL PLAN:**
- Create custom wallet utilities (logger, errors, retry logic)
- Build wallet operations layer
- Re-implement initialization logic
- Handle nutzap monitoring manually

**REVISED PLAN:**
- Use ndk-wallet as-is (it's production-ready)
- Just add thin wrappers in ndk-svelte5
- Expose existing methods reactively
- Build UI components only

**BENEFITS:**
- ✅ 90% less code to write
- ✅ Leverage battle-tested ndk-wallet
- ✅ Faster implementation (2 weeks vs 4-6 weeks)
- ✅ Easier maintenance
- ✅ Benefit from ndk-wallet improvements automatically

---

## Implementation Status

### Completed ✅

1. ✅ Enhanced ndk-svelte5 wallet store with missing features
   - Added `deposit(amount, mint?)` method
   - Added `receiveToken(token, description?)` method
   - Added `initialize(ndk, user, config?)` method
   - Added `addMint(mint)`, `removeMint(mint)`, `mints` getter
   - Added `getMintBalances()` method
   - All methods are thin wrappers around ndk-wallet core functionality

2. ✅ Refactored Voces to use enhanced ndk-svelte5 wallet
   - Removed custom wallet code:
     - `src/lib/stores/wallet.svelte.ts`
     - `src/lib/wallet/` (entire directory)
     - `src/lib/utils/walletLogger.ts`
     - `src/lib/utils/walletErrors.ts`
   - Updated `src/lib/ndk.svelte.ts` to import and export wallet store
   - Added auto-initialization via $effect when user logs in
   - Configured default mint: `https://mint.minibits.cash/Bitcoin`
   - Enabled nutzap monitoring by default

3. ✅ Built wallet UI components in Voces
   - ✅ `BalanceCard.svelte` - Balance display with wallet type indicator
   - ✅ `DepositModal.svelte` - Lightning deposit UI with QR code generation
   - ✅ `ReceiveTokenModal.svelte` - Cashu token redemption interface
   - ✅ `SendModal.svelte` - Payment UI with amount, recipient, and comment fields
   - ✅ `MintManager.svelte` - Mint list/add/remove with balance per mint
   - ✅ `TransactionList.svelte` - Transaction history with status indicators
   - ✅ `NutzapMonitor.svelte` - Nutzap status display with pending/redeemed/failed counts
   - ✅ `WalletWidget.svelte` - Main wallet display combining all components
   - ✅ `WalletPage.svelte` - Wallet page wrapper
   - ✅ Added `/wallet` route to App.svelte
   - ✅ Added wallet navigation link to Layout sidebar

### Next Steps

4. Test wallet functionality with real mints and transactions
5. Deploy and validate in production environment

---

This plan provides a clear, minimal path to wallet functionality that leverages existing, production-ready code rather than re-implementing it.
