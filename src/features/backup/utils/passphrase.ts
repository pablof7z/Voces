/**
 * Passphrase strength validation and KDF utilities for backup encryption
 */

import { BackupError, BackupErrorCode, withBackupErrorHandling } from '../errors';

/**
 * Security constants for passphrase validation and encryption
 */
export const PASSPHRASE_CONSTANTS = {
  // Minimum passphrase length (NIST SP 800-63B recommends 8+ for user-generated passwords)
  // We use 12 for higher security given the critical nature of key backup
  MIN_LENGTH: 12,
  
  // PBKDF2 iteration count (OWASP recommends 600,000+ for PBKDF2-SHA256 as of 2023)
  // This provides strong resistance against brute-force attacks
  PBKDF2_ITERATIONS: 600000,
  
  // Salt length in bytes (128 bits / 16 bytes)
  // NIST SP 800-132 recommends at least 128-bit random salt
  SALT_LENGTH: 16,
  
  // IV (Initialization Vector) length for AES-GCM (96 bits / 12 bytes)
  // NIST SP 800-38D specifies 96-bit IV for AES-GCM
  IV_LENGTH: 12,
  
  // AES key length in bits
  AES_KEY_LENGTH: 256,
  
  // Hash algorithm for PBKDF2
  HASH_ALGORITHM: 'SHA-256' as const,
} as const;

export interface PassphraseValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates passphrase strength according to security requirements:
 * - Minimum length (defined by PASSPHRASE_CONSTANTS.MIN_LENGTH)
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one symbol
 */
export function validatePassphraseStrength(passphrase: string): PassphraseValidationResult {
  const errors: string[] = [];

  if (passphrase.length < PASSPHRASE_CONSTANTS.MIN_LENGTH) {
    errors.push(`Passphrase must be at least ${PASSPHRASE_CONSTANTS.MIN_LENGTH} characters long`);
  }

  if (!/[A-Z]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one number');
  }

  if (!/[^A-Za-z0-9]/.test(passphrase)) {
    errors.push('Passphrase must contain at least one symbol');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Derives an encryption key from a passphrase using PBKDF2
 * 
 * Uses PBKDF2 with SHA-256 and a high iteration count (600,000) to provide
 * strong resistance against brute-force attacks. The iteration count follows
 * OWASP recommendations as of 2023.
 * 
 * @param passphrase - The user's passphrase
 * @param salt - Random salt (must be PASSPHRASE_CONSTANTS.SALT_LENGTH bytes)
 * @returns CryptoKey suitable for AES-GCM encryption/decryption
 * @throws BackupError with KEY_DERIVATION_FAILED code on failure
 */
export async function deriveKeyFromPassphrase(
  passphrase: string, 
  salt: Uint8Array
): Promise<CryptoKey> {
  return withBackupErrorHandling(async () => {
    const encoder = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: PASSPHRASE_CONSTANTS.PBKDF2_ITERATIONS,
        hash: PASSPHRASE_CONSTANTS.HASH_ALGORITHM
      },
      passphraseKey,
      { 
        name: 'AES-GCM', 
        length: PASSPHRASE_CONSTANTS.AES_KEY_LENGTH 
      },
      false,
      ['encrypt', 'decrypt']
    );
  }, BackupErrorCode.KEY_DERIVATION_FAILED, 'Failed to derive key from passphrase');
}

/**
 * Symmetrically encrypts data using AES-GCM with a passphrase-derived key
 * 
 * The encrypted output includes:
 * - Salt (16 bytes) - Random salt for PBKDF2
 * - IV (12 bytes) - Random initialization vector for AES-GCM
 * - Ciphertext (variable) - Encrypted data with authentication tag
 * 
 * @param data - The data to encrypt
 * @param passphrase - The passphrase to derive the encryption key from
 * @returns Base64-encoded encrypted data (salt + IV + ciphertext)
 * @throws BackupError with ENCRYPTION_FAILED code on failure
 */
export async function symmetricEncrypt(
  data: string,
  passphrase: string
): Promise<string> {
  return withBackupErrorHandling(async () => {
    const salt = crypto.getRandomValues(new Uint8Array(PASSPHRASE_CONSTANTS.SALT_LENGTH));
    const iv = crypto.getRandomValues(new Uint8Array(PASSPHRASE_CONSTANTS.IV_LENGTH));
    
    const key = await deriveKeyFromPassphrase(passphrase, salt);
    
    const encoder = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Combine salt + iv + encrypted data for single output
    const saltLength = PASSPHRASE_CONSTANTS.SALT_LENGTH;
    const ivLength = PASSPHRASE_CONSTANTS.IV_LENGTH;
    const combined = new Uint8Array(saltLength + ivLength + encrypted.byteLength);
    
    combined.set(salt, 0);
    combined.set(iv, saltLength);
    combined.set(new Uint8Array(encrypted), saltLength + ivLength);

    // Return as base64
    return btoa(String.fromCharCode(...combined));
  }, BackupErrorCode.ENCRYPTION_FAILED, 'Failed to encrypt data');
}

/**
 * Symmetrically decrypts data using AES-GCM with a passphrase-derived key
 * 
 * Expects input format created by symmetricEncrypt:
 * - Salt (16 bytes)
 * - IV (12 bytes)
 * - Ciphertext with authentication tag
 * 
 * @param encryptedData - Base64-encoded encrypted data
 * @param passphrase - The passphrase to derive the decryption key from
 * @returns Decrypted plaintext string
 * @throws BackupError with DECRYPTION_FAILED code on failure (including authentication failure)
 */
export async function symmetricDecrypt(
  encryptedData: string,
  passphrase: string
): Promise<string> {
  return withBackupErrorHandling(async () => {
    // Decode from base64
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    // Extract components using defined constants
    const saltLength = PASSPHRASE_CONSTANTS.SALT_LENGTH;
    const ivLength = PASSPHRASE_CONSTANTS.IV_LENGTH;
    
    const salt = combined.slice(0, saltLength);
    const iv = combined.slice(saltLength, saltLength + ivLength);
    const encrypted = combined.slice(saltLength + ivLength);

    const key = await deriveKeyFromPassphrase(passphrase, salt);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }, BackupErrorCode.DECRYPTION_FAILED, 'Failed to decrypt data');
}