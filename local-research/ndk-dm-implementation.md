Analyzing GitHub repository: nostr-dev-kit/ndk
Analyzing repository using gemini-2.5-flash...
Provider gemini failed, trying next available provider...
Analyzing repository using gemini-2.5-flash...
NDK implements NIP-17 (Gift-Wrapping events) and NIP-44 (encryption scheme) to handle direct messages and other forms of encrypted communication. The core functionality is primarily found in the `ndk-core` package, specifically within the `src/events/encryption.ts` and `src/events/gift-wrapping.ts` files.

### NIP-44 Encryption

NDK provides `encrypt` and `decrypt` methods on the `NDKEvent` class that automatically handle the specified encryption scheme (NIP-04 or NIP-44). The choice of scheme is determined by the `scheme` parameter or inferred from the encrypted content.

**API Methods:**

*   `NDKEvent.encrypt(recipient: NDKUser, signer?: NDKSigner, scheme: NDKEncryptionScheme = "nip44"): Promise<void>`
*   `NDKEvent.decrypt(sender?: NDKUser, signer?: NDKSigner, scheme?: NDKEncryptionScheme): Promise<void>`

**Code Example (Encryption):**

```typescript
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

async function encryptMessage() {
  const ndk = new NDK(); // NDK instance
  const senderSigner = new NDKPrivateKeySigner("your-private-key-nsec");
  const recipientUser = ndk.getUser({ pubkey: "recipient-public-key" });

  const event = new NDKEvent(ndk);
  event.content = "This is a secret message.";
  event.kind = 4; // Kind 4 for direct messages

  // Encrypt using NIP-44 (default scheme)
  await event.encrypt(recipientUser, senderSigner, "nip44");

  console.log("Encrypted content:", event.content);
  // event.content will now contain the NIP-44 encrypted string
}
```

**Code Example (Decryption):**

```typescript
import NDK, { NDKEvent, NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";

async function decryptMessage(encryptedEvent: NDKEvent) {
  const ndk = new NDK(); // NDK instance
  const recipientSigner = new NDKPrivateKeySigner("your-private-key-nsec");
  const senderUser = ndk.getUser({ pubkey: encryptedEvent.pubkey }); // Author of the encrypted event

  // The event's content already contains the encrypted message
  // Decrypts using NIP-44 (can be inferred or specified)
  await encryptedEvent.decrypt(senderUser, recipientSigner, "nip44");

  console.log("Decrypted content:", encryptedEvent.content);
  // encryptedEvent.content will now contain the original plaintext
}
```

### NIP-17 Gift-Wrapping

NIP-17 is implemented through the `giftWrap` and `giftUnwrap` functions, which create a special Kind 1059 event (Gift Wrap) containing an encrypted "seal" event. The seal event, in turn, contains an encrypted "rumor" event (e.g., a private direct message).

**API Methods:**

*   `giftWrap(event: NDKEvent, recipient: NDKUser, signer?: NDKSigner, params: GiftWrapParams = {}): Promise<NDKEvent>`
*   `giftUnwrap(event: NDKEvent, sender?: NDKUser, signer?: NDKSigner, scheme: NDKEncryptionScheme = "nip44"): Promise<NDKEvent>`

**Code Example (Gift-Wrapping):**

```typescript
import NDK, { NDKEvent, NDKPrivateKeySigner, giftWrap } from "@nostr-dev-kit/ndk";

async function sendGiftWrappedMessage() {
  const ndk = new NDK(); // NDK instance
  const senderSigner = new NDKPrivateKeySigner("your-private-key-nsec");
  const recipientUser = ndk.getUser({ pubkey: "recipient-public-key" });

  const message = new NDKEvent(ndk);
  message.content = "This is a gift for you!";
  message.kind = 14; // Private Direct Message (rumor kind)

  // Gift-wrap the message for the recipient
  const wrappedEvent = await giftWrap(message, recipientUser, senderSigner, { scheme: "nip44" });

  // Publish the wrapped event
  await wrappedEvent.publish();

  console.log("Gift-wrapped event ID:", wrappedEvent.id);
  console.log("Wrapped event kind:", wrappedEvent.kind); // Should be Kind 1059 (Gift Wrap)
}
```

**Code Example (Unwrapping):**

```typescript
import NDK, { NDKEvent, NDKPrivateKeySigner, giftUnwrap } from "@nostr-dev-kit/ndk";

async function receiveAndUnwrapGift(wrappedEvent: NDKEvent) {
  const ndk = new NDK(); // NDK instance
  const recipientSigner = new NDKPrivateKeySigner("your-private-key-nsec");
  const originalSenderUser = ndk.getUser({ pubkey: wrappedEvent.pubkey }); // Author of the wrapped event

  // Unwrap the gift-wrapped event
  const unwrappedMessage = await giftUnwrap(wrappedEvent, originalSenderUser, recipientSigner, "nip44");

  console.log("Unwrapped message content:", unwrappedMessage.content);
  console.log("Unwrapped message kind:", unwrappedMessage.kind); // Should be Kind 14 (Private DM)
}
```

These examples demonstrate how NDK's `NDKEvent` class and utility functions integrate NIP-17 and NIP-44 to provide secure and flexible private messaging capabilities.

The relevant files for NIP-17 and NIP-44 implementation are:

*   `ndk-core/src/events/encryption.ts`
*   `ndk-core/src/events/gift-wrapping.ts`

These files define the `encrypt`, `decrypt`, `giftWrap`, and `giftUnwrap` functions, which are the core of NDK's NIP-17 and NIP-44 support.