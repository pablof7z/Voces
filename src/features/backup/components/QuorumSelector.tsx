/**
 * Component for selecting threshold (quorum) and total shard count
 * Uses intuitive, non-technical language for accessibility
 */

import { useTranslation } from 'react-i18next';
import { Info } from 'lucide-react';
import { SHARD_CONSTANTS } from '../utils/shamir';

interface QuorumSelectorProps {
  threshold: number;
  totalShards: number;
  onThresholdChange: (threshold: number) => void;
  onTotalShardsChange: (totalShards: number) => void;
  maxShards: number;
}

export function QuorumSelector({
  threshold,
  totalShards,
  onThresholdChange,
  onTotalShardsChange,
  maxShards
}: QuorumSelectorProps) {
  const { t } = useTranslation();

  const effectiveMaxShards = Math.min(maxShards, SHARD_CONSTANTS.MAX_TOTAL_SHARDS);
  const effectiveMaxThreshold = Math.min(SHARD_CONSTANTS.MAX_THRESHOLD, totalShards);
  
  const thresholdOptions = Array.from(
    { length: effectiveMaxThreshold - SHARD_CONSTANTS.MIN_THRESHOLD + 1 }, 
    (_, i) => i + SHARD_CONSTANTS.MIN_THRESHOLD
  );
  
  const shardsOptions = Array.from(
    { length: effectiveMaxShards - SHARD_CONSTANTS.MIN_TOTAL_SHARDS + 1 }, 
    (_, i) => i + SHARD_CONSTANTS.MIN_TOTAL_SHARDS
  );

  return (
    <div className="space-y-6">
      {/* Total Shards */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          {t('backup.quorum.totalShards.label')}
        </label>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          {t('backup.quorum.totalShards.description')}
        </p>
        <select
          value={totalShards}
          onChange={(e) => {
            const newTotal = parseInt(e.target.value);
            onTotalShardsChange(newTotal);
            // Adjust threshold if it exceeds new total
            if (threshold > newTotal) {
              onThresholdChange(Math.min(threshold, newTotal));
            }
          }}
          className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {shardsOptions.map(num => (
            <option key={num} value={num}>
              {num} {t('backup.quorum.totalShards.pieces')}
            </option>
          ))}
        </select>
      </div>

      {/* Threshold */}
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          {t('backup.quorum.threshold.label')}
        </label>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          {t('backup.quorum.threshold.description')}
        </p>
        <select
          value={threshold}
          onChange={(e) => onThresholdChange(parseInt(e.target.value))}
          className="w-full px-3 py-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {thresholdOptions.map(num => (
            <option key={num} value={num}>
              {num} {t('backup.quorum.threshold.pieces')}
            </option>
          ))}
        </select>
      </div>

      {/* Explanation */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-blue-900 dark:text-blue-200">
            <p className="font-medium mb-1">
              {t('backup.quorum.explanation.title')}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              {t('backup.quorum.explanation.description', { threshold, totalShards })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}