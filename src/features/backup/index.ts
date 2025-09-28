export { BackupKeySettings } from './BackupKeySettings';
export { TrusteeSelector } from './components/TrusteeSelector';
export { QuorumSelector } from './components/QuorumSelector';
export { PassphraseInput } from './components/PassphraseInput';
export { SecurePasswordField } from './components/SecurePasswordField';
export { WarningBanner } from './components/WarningBanner';

export { publishShard, storeShardLocally, getPendingShards } from './services/shardPublisher';
export { publishBackupMetadata, fetchBackupMetadata, checkShardHealth } from './services/metadataPublisher';
export { MetadataBuilder } from './services/metadataBuilder';

export { createEncryptedShards, reconstructSecret, SHARD_CONSTANTS } from './utils/shamir';
export { 
  validatePassphraseStrength, 
  symmetricEncrypt, 
  symmetricDecrypt,
  PASSPHRASE_CONSTANTS,
  deriveKeyFromPassphrase
} from './utils/passphrase';
export { parsePubkey, parsePubkeyOrThrow, isValidPubkey } from './utils/pubkey';

export { BackupError, BackupErrorCode, withBackupErrorHandling } from './errors';

export { useBackupProgress } from './hooks/useBackupProgress';
export { useTrusteeManagement } from './hooks/useTrusteeManagement';
export { useBackupWorkflow } from './hooks/useBackupWorkflow';

export type { Trustee, BackupConfig, BackupProgress, ShardHealthStatus } from './types';
export type { PublishedShard, ShardPublishConfig } from './services/shardPublisher';
export type { BackupMetadata } from './services/metadataBuilder';
export type { EncryptedShard, ShardConfig } from './utils/shamir';
export type { PassphraseValidationResult } from './utils/passphrase';
export type { PubkeyParseResult } from './utils/pubkey';
export type { UseBackupProgressResult } from './hooks/useBackupProgress';
export type { UseTrusteeManagementResult, AddTrusteeResult } from './hooks/useTrusteeManagement';