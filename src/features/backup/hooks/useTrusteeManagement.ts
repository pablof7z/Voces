import { useCallback } from 'react';
import type { Trustee } from '../types';
import { parsePubkey } from '../utils/pubkey';

export interface AddTrusteeResult {
  success: boolean;
  trustees?: Trustee[];
  error?: string;
}

export interface UseTrusteeManagementResult {
  addTrustee: (input: string, currentTrustees: Trustee[]) => AddTrusteeResult;
  removeTrustee: (pubkey: string, currentTrustees: Trustee[]) => Trustee[];
  canAddMore: (currentTrustees: Trustee[]) => boolean;
  hasEnough: (currentTrustees: Trustee[]) => boolean;
}

export function useTrusteeManagement(
  maxTrustees: number,
  minTrustees: number = maxTrustees
): UseTrusteeManagementResult {
  const addTrustee = useCallback((
    input: string, 
    currentTrustees: Trustee[]
  ): AddTrusteeResult => {
    if (currentTrustees.length >= maxTrustees) {
      return {
        success: false,
        error: `You can only select up to ${maxTrustees} trustees`
      };
    }

    const parseResult = parsePubkey(input);
    
    if (!parseResult.success) {
      return {
        success: false,
        error: parseResult.error
      };
    }

    const pubkey = parseResult.pubkey!;

    if (currentTrustees.some(t => t.pubkey === pubkey)) {
      return {
        success: false,
        error: 'This person is already in your trustee list'
      };
    }

    return { 
      success: true,
      trustees: [
        ...currentTrustees,
        { pubkey, selected: true }
      ]
    };
  }, [maxTrustees]);

  const removeTrustee = useCallback((pubkey: string, currentTrustees: Trustee[]) => {
    return currentTrustees.filter(t => t.pubkey !== pubkey);
  }, []);

  const canAddMore = useCallback((currentTrustees: Trustee[]) => {
    return currentTrustees.length < maxTrustees;
  }, [maxTrustees]);

  const hasEnough = useCallback((currentTrustees: Trustee[]) => {
    return currentTrustees.length >= minTrustees;
  }, [minTrustees]);

  return {
    addTrustee,
    removeTrustee,
    canAddMore,
    hasEnough
  };
}