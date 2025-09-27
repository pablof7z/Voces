Querying perplexity using sonar for: Summarize NIP-60 and NIP-61 Nostr specifications focusing on wallet events, token management, and nutzaps with maxTokens: 21000
**NIP-60** and **NIP-61** are Nostr protocol extensions designed to enable interoperable Cashu wallets and a token-based micropayment system called Nutzaps, focusing on wallet events, token management, and payment verification.

### NIP-60: Wallet Events and Token Management
- **Wallet Events:** NIP-60 defines a standardized wallet event format for Cashu wallets using the event kind `17375` to represent a user's wallet stored in Nostr relays. This allows the wallet to be accessible and portable across different nostr applications, enabling interoperability[1][2][6].
- The wallet event includes the private key for tokens (distinct from the user's Nostr key), lists the mints the wallet interacts with, and can also be backed up via another event kind `375` to safely store wallet data[2].
- Token management is handled by storing token-related information within these wallet events, allowing for minting, tracking, and swapping of Cashu tokens across trusted mints[1][2].

### NIP-61: Nutzaps (Token Payments and Receipts)
- **Nutzaps** are a specific type of Cashu token payment encapsulated as a token locked with the recipient’s public key (P2PK), where the payment itself serves as a receipt. Nutzaps are represented by events of kind `9321`[1][3].
- The process flow:
  1. Alice wants to send 1 sat (Satoshi) to Bob as a Nutzap because she liked a particular nostr event (e.g., `event-id-1`).
  2. Alice fetches Bob's `kind:10019` event to learn which mints Bob trusts and the public key (P2PK) to lock tokens to[1][3].
  3. Alice mints or swaps tokens at Bob’s trusted mint(s), locking them cryptographically to Bob’s pubkey.
  4. Alice publishes a Nutzap event (`kind:9321`) on the relays Bob specified.
  5. Bob receives the event, fetches Nutzap events tagging him, and swaps the tokens into his wallet[3].
- The `kind:10019` event is a NIP-61 informational event that advertises how to send Nutzaps to a user, including mints, relays, and the public key to use[1][2].
- Nutzaps enhance the verification and trust model of zaps (micropayments) in Nostr by cryptographically binding payments to recipients and events[4].

### Summary Table

| Aspect                  | NIP-60 (Cashu Wallets)                            | NIP-61 (Nutzaps)                                              |
|-------------------------|--------------------------------------------------|---------------------------------------------------------------|
| **Event kinds used**    | Wallet: `17375`; Backup: `375`                    | Nutzap info: `10019`; Nutzap payment: `9321`                  |
| **Wallet portability**  | Wallet stored on relays, accessible across apps  | Nutzap public key corresponds to wallet private key in NIP-60 |
| **Token management**    | Track mints, store keys, mint/swap tokens        | Nutzaps are P2PK Cashu tokens acting as payments + receipts   |
| **Payment flow**        | Mint/track tokens                                 | Send/use Nutzap event referencing an event and token locked to recipient’s key |
| **Verification**        | Wallet backup events allow recovery               | Payment event itself is proof of transfer, improving zap verification |

NIP-60 enables interoperable, persistent Cashu wallets for managing ecash tokens, while NIP-61 builds on it to provide a secure, verifiable micropayment system (Nutzaps) within Nostr, closely integrated with event liking and trust relationships.

This compound design improves the Nostr ecosystem’s ability to handle cash transfers and user wallet interoperability securely and flexibly[1][2][3][4].