import type { PublishedShard } from './shardPublisher';

export interface BackupMetadata {
  version: number;
  createdAt: number;
  threshold: number;
  totalShards: number;
  trustees: Array<{
    pubkey: string;
    shardIndex: number;
  }>;
  shardEvents: Array<{
    eventId: string;
    recipientPubkey: string;
    relays: string[];
    shardIndex: number;
    publishedAt: number;
  }>;
}

export class MetadataBuilder {
  private version: number = 1;
  private createdAt: number;
  private threshold: number = 0;
  private publishedShards: PublishedShard[] = [];

  constructor() {
    this.createdAt = Math.floor(Date.now() / 1000);
  }

  withVersion(version: number): this {
    this.version = version;
    return this;
  }

  withCreatedAt(timestamp: number): this {
    this.createdAt = timestamp;
    return this;
  }

  withThreshold(threshold: number): this {
    this.threshold = threshold;
    return this;
  }

  withPublishedShards(shards: PublishedShard[]): this {
    this.publishedShards = shards;
    return this;
  }

  private validate(): void {
    if (this.threshold <= 0) {
      throw new Error('Threshold must be greater than 0');
    }

    if (this.publishedShards.length === 0) {
      throw new Error('At least one shard must be published');
    }

    if (this.threshold > this.publishedShards.length) {
      throw new Error('Threshold cannot exceed number of published shards');
    }
  }

  build(): BackupMetadata {
    this.validate();

    return {
      version: this.version,
      createdAt: this.createdAt,
      threshold: this.threshold,
      totalShards: this.publishedShards.length,
      trustees: this.publishedShards.map(shard => ({
        pubkey: shard.recipientPubkey,
        shardIndex: shard.shardIndex
      })),
      shardEvents: this.publishedShards.map(shard => ({
        eventId: shard.eventId,
        recipientPubkey: shard.recipientPubkey,
        relays: shard.relays,
        shardIndex: shard.shardIndex,
        publishedAt: shard.publishedAt
      }))
    };
  }

  toJSON(): string {
    return JSON.stringify(this.build());
  }
}
