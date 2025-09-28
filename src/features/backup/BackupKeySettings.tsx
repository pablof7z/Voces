/**
 * Main component for configuring and creating encrypted key backups
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { Button } from '@/components/ui/button';
import { TrusteeSelector } from './components/TrusteeSelector';
import { QuorumSelector } from './components/QuorumSelector';
import { PassphraseInput } from './components/PassphraseInput';
import type { Trustee, BackupProgress } from './types';
import { useBackupProgress } from './hooks/useBackupProgress';
import { useBackupWorkflow } from './hooks/useBackupWorkflow';

export function BackupKeySettings() {
  const { t } = useTranslation();
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();

  const [step, setStep] = useState<'setup' | 'progress'>('setup');
  const [threshold, setThreshold] = useState(2);
  const [totalShards, setTotalShards] = useState(3);
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [isPassphraseValid, setIsPassphraseValid] = useState(false);

  const progressHook = useBackupProgress();
  const { createBackup } = useBackupWorkflow({
    ndk,
    currentUser,
    progress: progressHook
  });

  const canProceed = trustees.length >= totalShards && isPassphraseValid;

  const handleCreateBackup = async () => {
    setStep('progress');
    await createBackup({
      threshold,
      totalShards,
      trustees,
      passphrase
    });
  };

  if (step === 'progress') {
    return (
      <ProgressView 
        progress={progressHook.progress} 
        onReset={() => {
          setStep('setup');
          progressHook.resetProgress();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-900 dark:text-red-200">
            <p className="font-semibold mb-1">
              {t('backup.security.warning.title')}
            </p>
            <p className="text-xs text-red-700 dark:text-red-300">
              {t('backup.security.warning.description')}
            </p>
          </div>
        </div>
      </div>

      {/* Quorum selection */}
      <QuorumSelector
        threshold={threshold}
        totalShards={totalShards}
        onThresholdChange={setThreshold}
        onTotalShardsChange={setTotalShards}
        maxShards={10}
      />

      {/* Trustee selection */}
      <TrusteeSelector
        trustees={trustees}
        maxTrustees={totalShards}
        onTrusteesChange={setTrustees}
      />

      {/* Passphrase inputs */}
      {trustees.length >= totalShards && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <PassphraseInput
            value={passphrase}
            confirmValue={confirmPassphrase}
            onChange={setPassphrase}
            onConfirmChange={setConfirmPassphrase}
            onValidChange={setIsPassphraseValid}
          />
        </motion.div>
      )}

      {/* Action button */}
      {canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Button
            onClick={handleCreateBackup}
            className="w-full"
            size="lg"
          >
            <Shield className="w-4 h-4 mr-2" />
            {t('backup.create.button')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

function ProgressView({ progress, onReset }: { progress: BackupProgress; onReset: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center py-12">
        {progress.status === 'complete' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </motion.div>
        ) : progress.status === 'error' ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mb-4"
          >
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </motion.div>
        ) : (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 bg-blue-100 dark:bg-blue-950/30 rounded-full flex items-center justify-center mb-4"
          >
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </motion.div>
        )}

        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
          {progress.message}
        </h3>

        {progress.status !== 'complete' && progress.status !== 'error' && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {t('backup.progress.step', { current: progress.currentStep, total: progress.totalSteps })}
          </p>
        )}

        {progress.status === 'error' && progress.error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center max-w-md">
            {progress.error}
          </p>
        )}

        {(progress.status === 'complete' || progress.status === 'error') && (
          <Button onClick={onReset} className="mt-6" variant="outline">
            {t('common.close')}
          </Button>
        )}
      </div>
    </div>
  );
}