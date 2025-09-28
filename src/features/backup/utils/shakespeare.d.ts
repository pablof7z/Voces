/**
 * Type declarations for the shakespeare library
 */

declare module 'shakespeare' {
  /**
   * Splits a secret into shares using Shamir's Secret Sharing
   * @param secret - The secret to split
   * @param threshold - Minimum number of shares needed to reconstruct
   * @param shares - Total number of shares to create
   * @returns Array of share strings
   */
  export function split(secret: string, threshold: number, shares: number): string[];

  /**
   * Reconstructs a secret from shares
   * @param shares - Array of share strings (must have at least threshold shares)
   * @returns The reconstructed secret
   */
  export function join(shares: string[]): string;
}