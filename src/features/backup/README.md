# Backup Key Feature

## Overview

The Backup Key feature implements Shamir's Secret Sharing to allow users to securely back up their Nostr private key (nsec) by distributing encrypted shards to trusted friends.

## How It Works

### 1. User Configuration
- User selects trusted people (trustees) who will receive backup shards
- User configures the quorum: threshold (how many shards needed to recover) and total shards
- User creates a strong passphrase that encrypts all shards

### 2. Key Sharding
- User's nsec is split into N shards using Shamir's Secret Sharing (via `shakespeare` library)
- Each shard is individually encrypted with the user's passphrase (AES-GCM with PBKDF2)
- The encrypted shards are then NIP-44 encrypted to each trustee

### 3. Publishing Strategy
- Each shard is published as a kind:3 event (contact list) for stealth
- Published with different disposable keys to avoid correlation
- Events have staggered `created_at` timestamps to avoid relay rejections
- Some shards may be stored in localStorage for delayed publishing (if timestamps are too far in the past)

### 4. Metadata Event
- A kind:1115 event is published with self-encrypted metadata
- Contains the mapping of shards to trustees and relay information
- Allows health checking of published shards

## Security Considerations

### Encryption Layers
1. **Passphrase Layer**: Each shard is symmetrically encrypted with user's passphrase
   - Uses PBKDF2 with 600,000 iterations
   - AES-GCM 256-bit encryption
   - Passphrase requirements: 12+ chars, uppercase, lowercase, number, symbol

2. **NIP-44 Layer**: Encrypted shards are then NIP-44 encrypted to recipients
   - Uses disposable keys for publishing
   - Each trustee receives their shard via NIP-44 encryption

### Threat Model
- **Passphrase Loss**: If user forgets passphrase, backup is unrecoverable (by design)
- **Trustee Compromise**: Single trustee compromise doesn't reveal the key (requires threshold)
- **Relay Surveillance**: Using kind:3 events provides stealth (looks like contact lists)
- **Correlation**: Different disposable keys and timestamps reduce correlation risk

## Technical Details

### Event Kinds
- **kind:3**: Used for shard events (stealth mode, looks like contact lists)
- **kind:1115**: Custom kind for backup metadata (self-encrypted)

### Dependencies
- `shakespeare`: Shamir's Secret Sharing implementation
- `@nostr-dev-kit/ndk`: Nostr protocol implementation
- `nostr-tools`: For NIP-44 encryption utilities
- Web Crypto API: For symmetric encryption (PBKDF2, AES-GCM)

### File Structure
```
src/features/backup/
├── BackupKeySettings.tsx        # Main UI component
├── components/
│   ├── TrusteeSelector.tsx      # Trustee selection UI
│   ├── QuorumSelector.tsx       # Threshold/shard count UI
│   └── PassphraseInput.tsx      # Passphrase input with validation
├── services/
│   ├── shardPublisher.ts        # Shard publishing logic
│   └── metadataPublisher.ts     # Metadata event publishing
├── utils/
│   ├── shamir.ts                # Shamir sharding logic
│   ├── passphrase.ts            # Passphrase validation and KDF
│   ├── crypto.ts                # Crypto utilities
│   └── shakespeare.d.ts         # Type definitions for shakespeare
└── types.ts                     # TypeScript types
```

## Usage

1. Navigate to Settings > Backup Key
2. Configure quorum (e.g., 2-of-3 means 2 shards needed from 3 total)
3. Select trustees by entering their npub or pubkey
4. Create and confirm a strong passphrase
5. Click "Create Secure Backup"

## Recovery (Future Implementation)

Recovery flow would involve:
1. Collecting threshold number of shards from trustees
2. Each trustee provides their shard event
3. User enters the original passphrase
4. Shards are decrypted and recombined to recover nsec

## Known Limitations

1. **kind:3 Misuse**: Using kind:3 for non-contact-list data violates NIP-02 spec
   - Trade-off accepted for stealth/privacy benefits
   - May cause issues with relay policies or client implementations

2. **Delayed Publishing**: Shards with far-future timestamps may need manual publishing
   - Stored in localStorage until appropriate time
   - User must remember to publish them later

3. **No Password Recovery**: Lost passphrase = lost backup (intentional security choice)

## Future Enhancements

- [ ] Recovery flow implementation
- [ ] Shard health monitoring dashboard
- [ ] Automated delayed shard publishing
- [ ] Trustee notification system
- [ ] Backup verification before completion