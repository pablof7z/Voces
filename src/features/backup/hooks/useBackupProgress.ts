/**
 * Custom hook for managing backup creation progress
 */

import { useState, useCallback } from 'react';
import type { BackupProgress } from '../types';

export interface UseBackupProgressResult {
  progress: BackupProgress;
  startProgress: (totalSteps: number) => void;
  updateProgress: (step: number, message: string) => void;
  completeProgress: (message: string) => void;
  failProgress: (message: string, error?: string) => void;
  resetProgress: () => void;
}

const INITIAL_PROGRESS: BackupProgress = {
  status: 'idle',
  currentStep: 0,
  totalSteps: 0,
  message: ''
};

/**
 * Hook for managing backup creation progress state
 * 
 * @returns Progress state and update functions
 */
export function useBackupProgress(): UseBackupProgressResult {
  const [progress, setProgress] = useState<BackupProgress>(INITIAL_PROGRESS);

  const startProgress = useCallback((totalSteps: number) => {
    setProgress({
      status: 'creating-shards',
      currentStep: 0,
      totalSteps,
      message: 'Starting backup creation...'
    });
  }, []);

  const updateProgress = useCallback((step: number, message: string) => {
    setProgress(prev => ({
      ...prev,
      status: step === prev.totalSteps ? 'complete' : prev.status,
      currentStep: step,
      message
    }));
  }, []);

  const completeProgress = useCallback((message: string) => {
    setProgress(prev => ({
      ...prev,
      status: 'complete',
      currentStep: prev.totalSteps,
      message
    }));
  }, []);

  const failProgress = useCallback((message: string, error?: string) => {
    setProgress(prev => ({
      ...prev,
      status: 'error',
      message,
      error
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
  }, []);

  return {
    progress,
    startProgress,
    updateProgress,
    completeProgress,
    failProgress,
    resetProgress
  };
}