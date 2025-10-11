/**
 * Symmetric encryption utilities for invite system
 * Uses AES-GCM with a random key for encrypting invite payloads
 */

const IV_LENGTH = 12;

/**
 * Generate a random encryption key (24 alphanumeric characters)
 */
export function generateEncryptionKey(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 24; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Generate a random d-tag (12 alphanumeric characters)
 */
export function generateDTag(): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < 12; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Convert a string key to a CryptoKey for AES-GCM
 */
async function stringKeyToCryptoKey(keyString: string): Promise<CryptoKey> {
	const encoder = new TextEncoder();
	const keyData = encoder.encode(keyString.padEnd(32, '0').slice(0, 32));

	return crypto.subtle.importKey(
		'raw',
		keyData,
		{ name: 'AES-GCM', length: 256 },
		false,
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypt data with a string key
 */
export async function encryptInvitePayload(data: string, keyString: string): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const key = await stringKeyToCryptoKey(keyString);

	const encoder = new TextEncoder();
	const encrypted = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		key,
		encoder.encode(data)
	);

	// Combine IV + encrypted data
	const combined = new Uint8Array(IV_LENGTH + encrypted.byteLength);
	combined.set(iv, 0);
	combined.set(new Uint8Array(encrypted), IV_LENGTH);

	// Return as base64
	return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data with a string key
 */
export async function decryptInvitePayload(encryptedData: string, keyString: string): Promise<string> {
	const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

	const iv = combined.slice(0, IV_LENGTH);
	const encrypted = combined.slice(IV_LENGTH);

	const key = await stringKeyToCryptoKey(keyString);

	const decrypted = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		key,
		encrypted
	);

	const decoder = new TextDecoder();
	return decoder.decode(decrypted);
}
