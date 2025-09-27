# NIP-17 Private Direct Messages: Key Requirements and Recommendations

## Core Requirements
- DMs use kind 14 for text messages and kind 15 for files
- Messages must NEVER be signed directly (would leak content publicly)
- Must use NIP-44 encryption and NIP-59 seals (kind 13) and gift wraps (kind 1059)
- Must verify the pubkey in kind 13 matches the pubkey in kind 14/15

## Gift Wrap and Seal Implementation
- Create separate gift wraps for each recipient AND sender
- Use randomized public/private key pairs for gift wraps
- Randomize `created_at` timestamps up to 2 days in the past in both seal and gift wrap
- This prevents correlation by timestamp metadata

## Publishing Guidelines
- Check for recipient's kind 10050 event listing preferred DM relays
- If kind 10050 not found, recipient isn't ready for NIP-17 DMs
- Send DMs to relays listed in recipient's kind 10050
- Send copies of outgoing messages to sender's own relay set
- Keep relay lists small (1-3 relays recommended)

## Optional Features
- Can offer disappearing messages using expiration tags or by not creating a sender gift wrap
- Can use separate keys exclusively for DM backup/recovery ("cold storage")
- Subject tags define conversation topic/name

## Security Considerations
- Group chats with >100 participants should use a different messaging scheme
- Relays should only serve kind 1059 events to tagged recipients
- No shared secrets required between participants
- Messages completely recoverable with private key
- Users can receive DMs with alias keys to protect identity

The system design prevents metadata leakage and lacks public group identifiers, providing strong privacy while using standard public relays.