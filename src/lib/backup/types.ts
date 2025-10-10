export interface Trustee {
  pubkey: string;
  name?: string;
  nip05?: string;
  selected: boolean;
}

export interface BackupConfig {
  threshold: number;
  totalShards: number;
  trustees: Trustee[];
  passphrase: string;
}

export interface BackupProgress {
  status: 'idle' | 'creating-shards' | 'publishing' | 'complete' | 'error';
  currentStep: number;
  totalSteps: number;
  message: string;
  error?: string;
}

export interface ShardHealthStatus {
  shardIndex: number;
  recipientPubkey: string;
  healthy: boolean;
  relays: string[];
  eventId: string;
}
