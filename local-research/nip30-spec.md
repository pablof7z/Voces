Querying perplexity using sonar for: What is NIP-30 in Nostr protocol? Explain how custom emoji shortcodes work with maxTokens: 21000
**NIP-30** is a Nostr Improvement Proposal that defines how **custom emoji shortcodes** work within the Nostr protocol. Specifically, it allows clients to specify custom emoji using shortcodes in the content of events. The emoji are defined using an `"emoji"` tag in the event, and clients parse content text for these shortcodes—formatted like `:shortcode:`—to display the corresponding custom emoji graphics[2][4][6].

### How Custom Emoji Shortcodes Work (per NIP-30):

- Events can include an `"emoji"` tag that defines custom emojis. This tag links a shortcode (a keyword) to an emoji image (likely a URL or identifier).
- When a client renders the content of an event (such as a message or reaction), it scans the text for patterns like `:shortcode:`—similar to many chat platforms and social networks.
- The client replaces instances of these shortcodes with the appropriate custom emoji defined in the `"emoji"` tag.
- This enables users to use their custom emojis natively in Nostr communications, enhancing expressiveness beyond standard Unicode emojis.

### Context about NIP-30 and Nostr:

- Nostr events are JSON objects; the `"tags"` field holds arrays that add metadata or context.
- The `"emoji"` tag in the tags array explicitly pairs shortcode identifiers with the associated custom emoji data.
- Custom emoji parsing improves clients' capability to react and communicate visually in a decentralized social network environment[2][4][6].

In summary, **NIP-30 introduces a standard way to embed and interpret custom emojis in Nostr events via emoji shortcodes embedded in the event text and defined in the event's `"emoji"` tags**. This makes expressive communication richer while maintaining decentralization and interoperability among Nostr clients.