import { BackupErrorCode, withBackupErrorHandling } from '../errors';

export const PASSPHRASE_CONSTANTS = {
  MIN_LENGTH: 12,
  PBKDF2_ITERATIONS: 600000,
  SALT_LENGTH: 16,
  IV_LENGTH: 12,
  AES_KEY_LENGTH: 256,
  HASH_ALGORITHM: 'SHA-256' as const,
} as const;

export interface PassphraseValidationResult {
  valid: boolean;
  errors: string[];
}

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

    const saltLength = PASSPHRASE_CONSTANTS.SALT_LENGTH;
    const ivLength = PASSPHRASE_CONSTANTS.IV_LENGTH;
    const combined = new Uint8Array(saltLength + ivLength + encrypted.byteLength);

    combined.set(salt, 0);
    combined.set(iv, saltLength);
    combined.set(new Uint8Array(encrypted), saltLength + ivLength);

    return btoa(String.fromCharCode(...combined));
  }, BackupErrorCode.ENCRYPTION_FAILED, 'Failed to encrypt data');
}

export async function symmetricDecrypt(
  encryptedData: string,
  passphrase: string
): Promise<string> {
  return withBackupErrorHandling(async () => {
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

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
