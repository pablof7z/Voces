Querying perplexity using sonar for: Explain NIP-17 Direct Messages specification including NIP-44 encryption and gift wraps implementation details with maxTokens: 21000
NIP-17 is a Nostr Implementation Possibility (NIP) that defines a **private, encrypted direct messaging scheme** using the advanced encryption methods specified in NIP-44 and NIP-59. It establishes a protocol for sending encrypted direct messages (kind 14 events) between users on Nostr, ensuring the confidentiality and privacy of messages.

### Key aspects of NIP-17

- **Direct Message Kind**: Messages are of type `kind=14`, which designates them as chat messages. The messages contain `p` tags that identify one or more recipient public keys, enabling multi-party direct messaging.

- **Message content**: The message `.content` field remains *plain text for the receiver's client*, but this plaintext is after decryption using NIP-44 encryption. Messages **must never be signed** because signing could cause messages to leak as publicly visible events.

- **Tags**:
  - `p` tags specify receiver(s) (their public keys and relay URLs).
  - Optional `e` tags indicate parent message IDs for threading or replies.
  - Optional `subject` tags can define conversation titles.

- **Encryption**: NIP-17 relies on **NIP-44** for encryption, which specifies a *versioned, keypair-based encryption format* designed for upgrading and robust security. NIP-44 uses:
  - secp256k1 ECDH (Elliptic Curve Diffie-Hellman) for shared secret derivation
  - HKDF (key derivation)
  - ChaCha20-Poly1305 for authenticated encryption
  - HMAC-SHA256 for authentication of ciphertext
  - Base64 for encoding ciphertext

- **Gift Wraps and Seals**: NIP-17 leverages **NIP-59**, which defines a **gift wrap protocol** for encapsulating events, thus further obscuring message metadata and providing collaborative signing capabilities. This involves:
  1. **Rumor**: The core event payload (the actual message).
  2. **Seal**: Encrypted rumor with additional metadata, ensuring confidentiality.
  3. **Gift Wrap**: The public event that wraps the sealed rumor, allowing it to be distributed without leaking sensitive information.

This layered approach in NIP-59 enhances privacy by making it difficult for relays or third parties to discern message contents or metadata beyond what is necessary.

### Implementation details summary

| Aspect              | Description                                                                                   |
|---------------------|-----------------------------------------------------------------------------------------------|
| Message Kind        | 14 (chat messages, encrypted direct messages)                                                 |
| Recipient Tags       | `p` tags list intended recipients by public key and relay                                       |
| Encryption scheme    | NIP-44: secp256k1 ECDH, HKDF, ChaCha20-Poly1305, HMAC-SHA256, base64 encoding                  |
| Metadata obfuscation | NIP-59 gift wraps & seals encapsulate and encrypt entire events for privacy & collaborative signing |
| Signatures          | Direct messages **must not be signed** to prevent public leakage                                |
| Content format       | Post-decryption plaintext stored in `.content`                                                |

### Summary

NIP-17 establishes a **secure private messaging protocol on Nostr** by combining:

- **NIP-44's modern, versioned encryption** for encrypting message content,
- **NIP-59's gift wrap protocol** to wrap and encrypt full messages or events to obscure metadata,
- a designated event kind (`14`) and tagging scheme for sender/receiver identification,

thus enabling **private, metadata-protected, encrypted direct messages** in the decentralized Nostr ecosystem[1][2][3][4].