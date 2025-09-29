/**
 * Utilities for validating and parsing Nostr public keys
 */

import { nip19 } from 'nostr-tools';
import { BackupError, BackupErrorCode } from '../errors';

export interface PubkeyParseResult {
  success: boolean;
  pubkey?: string;
  error?: string;
}

/**
 * Parses a public key from various formats (npub, hex)
 * 
 * Supports:
 * - npub1... format (NIP-19 encoded)
 * - 64-character hex string
 * 
 * @param input - The public key string to parse
 * @returns PubkeyParseResult with parsed pubkey or error message
 */
export function parsePubkey(input: string): PubkeyParseResult {
  const trimmedInput = input.trim();
  
  if (!trimmedInput) {
    return {
      success: false,
      error: 'Please enter a public key'
    };
  }

  try {
    // Try to decode as npub
    if (trimmedInput.startsWith('npub1')) {
      const decoded = nip19.decode(trimmedInput);
      
      if (decoded.type !== 'npub') {
        return {
          success: false,
          error: 'Invalid npub format'
        };
      }
      
      return {
        success: true,
        pubkey: decoded.data as string
      };
    }
    
    // Try to validate as hex pubkey (64 hex characters)
    if (/^[0-9a-f]{64}$/i.test(trimmedInput)) {
      return {
        success: true,
        pubkey: trimmedInput.toLowerCase()
      };
    }
    
    return {
      success: false,
      error: 'Please enter a valid npub or hex public key'
    };
  } catch {
    return {
      success: false,
      error: 'Invalid public key format'
    };
  }
}

/**
 * Parses a public key and throws a BackupError on failure
 * Useful for contexts where you want to handle errors via exceptions
 * 
 * @param input - The public key string to parse
 * @returns Parsed pubkey (hex format)
 * @throws BackupError with INVALID_PUBKEY code on failure
 */
export function parsePubkeyOrThrow(input: string): string {
  const result = parsePubkey(input);
  
  if (!result.success) {
    throw new BackupError(
      BackupErrorCode.INVALID_PUBKEY,
      result.error || 'Invalid public key'
    );
  }
  
  return result.pubkey!;
}

/**
 * Validates that a public key is in the correct format
 * 
 * @param pubkey - The public key to validate (should be 64-char hex)
 * @returns true if valid, false otherwise
 */
export function isValidPubkey(pubkey: string): boolean {
  return /^[0-9a-f]{64}$/i.test(pubkey);
}