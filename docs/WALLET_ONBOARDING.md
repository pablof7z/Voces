# Automatic Wallet Creation During Onboarding

## Overview

Wallets are now automatically created during user signup/onboarding with the following behavior:

### For Users With Invites

When a user signs up through an invite link:

1. The system fetches the inviter's wallet configuration (kind 17375 event)
2. Extracts the inviter's:
   - **Mints**: List of Cashu mint URLs
   - **Relays**: Wallet-specific relays (or falls back to `WALLET_DEFAULT_RELAYS`)
3. Creates a new wallet for the new user with the **same configuration**
4. Publishes the wallet (kind 17375) to Nostr

**Fallback**: If the inviter doesn't have a wallet or it can't be fetched, creates a default wallet.

### For Users Without Invites

Users who sign up without an invite get a wallet with default configuration:
- **Default Mint**: `https://mint.minibits.cash/Bitcoin`
- **Default Relays**:
  - `wss://relay.primal.net`
  - `wss://relay.nostr.band`

## Implementation Details

### Files Modified

1. **`src/lib/utils/relayUtils.ts`**
   - Added `WALLET_DEFAULT_RELAYS` constant with default wallet relays

2. **`src/lib/stores/onboarding.svelte.ts`**
   - Added `createWalletFromInviter()` method
   - Added `createDefaultWallet()` method
   - Imports `NDKCashuWallet` from `@nostr-dev-kit/wallet`
   - Imports `NDKKind` from `@nostr-dev-kit/ndk`
   - Imports `WALLET_DEFAULT_RELAYS` from `relayUtils`
   - Uses explicit relay set for all wallet creation

3. **`src/routes/onboarding/+page.svelte`**
   - Calls `createWalletFromInviter()` during invite processing (for invited users)
   - Calls `createDefaultWallet()` during onboarding completion (for non-invited users)

### Flow

#### Invited Users

```
User clicks invite link
  ↓
Onboarding starts at Step 3 (Features)
  ↓
Login with generated keypair
  ↓
$effect triggers invite processing:
  1. publishInviteConfirmation()
  2. copyInviterContacts()
  3. publishRelayList()
  4. createWalletFromInviter() ← NEW
     - Fetches inviter's wallet (kind 17375)
     - Parses mints and relays
     - Creates new wallet with same config
     - Publishes to Nostr
```

#### Non-Invited Users

```
User starts onboarding
  ↓
Goes through all steps (1-6)
  ↓
Completes onboarding
  ↓
completeOnboarding() calls:
  - createDefaultWallet() ← NEW
    - Creates wallet with default mint
    - Publishes to Nostr
  ↓
Redirects to home
```

## Benefits

1. **Seamless Onboarding**: Users don't need to manually configure wallets
2. **Community Continuity**: Invited users use the same mints as their inviter
3. **Better UX**: Wallet is ready to use immediately after signup
4. **Automatic Discovery**: The wallet is published to Nostr so it can be discovered by the user on other clients

## Technical Notes

- Uses `NDKCashuWallet.create()` which:
  - Generates a private key for the wallet
  - Publishes a kind 17375 event (wallet config)
  - Creates a kind 375 event (wallet backup)
- The wallet is created and published before the user reaches the home page
- Errors in wallet creation are caught and logged but don't block onboarding

## Future Enhancements

- Allow users to customize mint selection during onboarding
- Show wallet creation status to users
- Support multiple default mints based on user location/language
