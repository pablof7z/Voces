/**
 * NIP-05 username utilities for Agora relays
 */

/**
 * Extracts the domain from a relay URL
 * @param relayUrl - The relay URL (e.g., "wss://ve.agorawlc.com" or "ws://test.agorawlc.com:3335")
 * @returns The domain (e.g., "ve.agorawlc.com" or "test.agorawlc.com")
 */
export function extractDomainFromRelay(relayUrl: string): string {
	try {
		const url = new URL(relayUrl);
		return url.hostname;
	} catch {
		return '';
	}
}

/**
 * Checks if a NIP-05 username is available on a given domain
 * @param username - The username to check
 * @param domain - The domain (e.g., "ve.agorawlc.com")
 * @returns Promise that resolves to true if available, false if taken
 */
export async function checkNip05Availability(
	username: string,
	domain: string
): Promise<{ available: boolean; error?: string }> {
	if (!username || !domain) {
		return { available: false, error: 'Username and domain are required' };
	}

	// Validate username (alphanumeric, underscore, hyphen only)
	if (!/^[a-z0-9_-]+$/i.test(username)) {
		return { available: false, error: 'Username can only contain letters, numbers, underscore, and hyphen' };
	}

	try {
		// Check if the NIP-05 identifier already exists
		const protocol = domain.includes('localhost') || domain.includes('test') ? 'http' : 'https';
		const nip05Url = `${protocol}://${domain}/.well-known/nostr.json?name=${encodeURIComponent(username)}`;

		const response = await fetch(nip05Url);

		if (response.status === 404) {
			// 404 means the username doesn't exist - it's available
			return { available: true };
		}

		if (response.ok) {
			// If we get a successful response, the username is taken
			const data = await response.json();
			if (data.names && data.names[username]) {
				return { available: false, error: 'Username is already taken' };
			}
			// If username not in response, it's available
			return { available: true };
		}

		// Other response codes - treat as unavailable for safety
		return { available: false, error: 'Unable to check availability. Please try again.' };
	} catch (error) {
		console.error('Error checking NIP-05 availability:', error);
		// On error, we'll treat it as available but log the error
		// This prevents blocking users if the relay is temporarily unavailable
		return { available: true };
	}
}

/**
 * Formats a NIP-05 identifier
 * @param username - The username
 * @param domain - The domain
 * @returns The formatted NIP-05 identifier (e.g., "username@domain.com")
 */
export function formatNip05(username: string, domain: string): string {
	return `${username}@${domain}`;
}
