# Relay Authentication Policy

This application implements a user-friendly relay authentication policy that asks for user confirmation when relays request authentication.

## How It Works

1. **Authentication Request**: When a relay sends an `AUTH` message requesting authentication, the policy is triggered.

2. **User Decision Storage**: The policy checks if the user has previously accepted or rejected authentication for this specific relay.

3. **User Prompt**: If no previous decision exists, the user is prompted with a confirmation dialog asking if they want to authenticate with the relay.

4. **Persistent Storage**: The user's decision is stored in `localStorage` so they won't be asked again for the same relay.

5. **Automatic Authentication**: If the user previously accepted, the policy automatically creates and signs the authentication event using NDK's signer.

## Implementation Details

### Files

- **`src/lib/relayAuthPolicy.svelte.ts`**: Core authentication policy implementation
- **`src/lib/stores/relayAuthModal.svelte.ts`**: Modal store for managing auth confirmation UI
- **`src/lib/components/RelayAuthModal.svelte`**: Beautiful modal component for user confirmation
- **`src/lib/ndk.svelte.ts`**: NDK initialization with auth policy configured
- **`src/routes/+layout.svelte`**: Root layout with RelayAuthModal mounted

### Key Features

- ✅ Beautiful modal UI for user confirmation (no ugly browser confirm dialogs!)
- ✅ User confirmation before authenticating with any relay
- ✅ Persistent storage of auth decisions in localStorage
- ✅ Automatic re-authentication for previously approved relays
- ✅ Proper handling of signer availability (waits for signer if not ready)
- ✅ Educational UI explaining why authentication is needed
- ✅ Debug logging for troubleshooting

## Managing Auth Decisions

You can programmatically manage auth decisions using the exported utilities:

```typescript
import {
  clearAuthDecisions,
  removeAuthDecision,
  getAuthDecisions
} from '$lib/ndk.svelte';

// Clear all stored auth decisions
clearAuthDecisions();

// Remove decision for a specific relay
removeAuthDecision('wss://relay.example.com');

// Get all stored decisions
const decisions = getAuthDecisions();
// Returns Map<string, boolean> where key is relay URL and value is accepted (true) or rejected (false)
```

## Settings Integration (Future Enhancement)

You could add a settings page where users can:
- View all relays they've authenticated with
- Revoke authentication for specific relays
- Clear all authentication decisions
- See when each decision was made

Example settings UI:

```svelte
<script lang="ts">
  import { getAuthDecisions, removeAuthDecision } from '$lib/ndk.svelte';

  const authDecisions = getAuthDecisions();
</script>

<div class="auth-settings">
  <h2>Relay Authentication</h2>
  {#each [...authDecisions.entries()] as [relay, accepted]}
    <div class="auth-item">
      <span>{relay}</span>
      <span>{accepted ? '✓ Authenticated' : '✗ Rejected'}</span>
      <button onclick={() => removeAuthDecision(relay)}>
        Remove
      </button>
    </div>
  {/each}
</div>
```

## Customization

### Customize the Modal UI

The modal component (`src/lib/components/RelayAuthModal.svelte`) can be customized with your own styles, copy, or additional features. The modal uses a store-based pattern for easy integration.

### Different Auth Policies

You can create alternative policies:

```typescript
import { NDKRelayAuthPolicies } from '@nostr-dev-kit/ndk';

// Always authenticate (default NDK behavior)
ndk.relayAuthDefaultPolicy = NDKRelayAuthPolicies.signIn({ ndk });

// Never authenticate (disconnect from auth-requiring relays)
ndk.relayAuthDefaultPolicy = NDKRelayAuthPolicies.disconnect(ndk.pool);

// Custom policy with whitelist
ndk.relayAuthDefaultPolicy = createWhitelistAuthPolicy({
  ndk,
  allowedRelays: ['wss://relay.damus.io', 'wss://relay.snort.social']
});
```

## Security Considerations

- Auth decisions are stored in `localStorage` which is scoped to the domain
- Authentication events are signed with the user's Nostr private key (via NDK signer)
- Each relay gets a unique auth event with a challenge-response mechanism
- Users can revoke authentication at any time by clearing decisions

## Troubleshooting

Enable debug logging to see auth policy in action:

```javascript
// In browser console:
localStorage.setItem('debug', 'voces:relay:auth');
```

This will log:
- When relays request authentication
- Whether a stored decision was found
- User confirmation results
- Auth event signing success/failure
