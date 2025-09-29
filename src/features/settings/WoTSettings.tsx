import { useTranslation } from 'react-i18next';
import { useWoTStore } from '@/stores/wotStore';
import { useWoT } from '@/hooks/useWoT';
import { calculateWebOfTrust } from '@/services/wotService';
import { useNDK, useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { Shield, RefreshCw, Clock, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WoTSettings() {
  const { t } = useTranslation();
  const { ndk } = useNDK();
  const currentUser = useNDKCurrentUser();
  const {
    enabled,
    minTrustLevel,
    setEnabled,
    setMinTrustLevel,
  } = useWoTStore();
  const { lastUpdate, isCalculating, trustScores } = useWoT();

  const handleRecalculate = async () => {
    if (!ndk || isCalculating) return;

    useWoTStore.getState().setIsCalculating(true);
    try {
      const scores = await calculateWebOfTrust(ndk, currentUser?.pubkey);
      useWoTStore.getState().setTrustScores(scores);
      useWoTStore.getState().setLastUpdate(Date.now());
    } catch (error) {
      console.error('Failed to recalculate WoT:', error);
    } finally {
      useWoTStore.getState().setIsCalculating(false);
    }
  };

  const trustCount = Object.keys(trustScores).length;
  const level1Count = Object.values(trustScores).filter(s => s.level === 1).length;
  const level2Count = Object.values(trustScores).filter(s => s.level === 2).length;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl">
        <Shield className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
            {t('settings.sections.wot.info.title')}
          </p>
          <p className="text-blue-700 dark:text-blue-300 text-xs">
            {t('settings.sections.wot.info.description')}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              {t('settings.sections.wot.enable')}
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              {t('settings.sections.wot.enableDescription')}
            </p>
          </div>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${enabled ? 'bg-accent-500' : 'bg-neutral-300 dark:bg-neutral-700'}
            `}
          >
            <span
              className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${enabled ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {t('settings.sections.wot.trustLevel')}
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.5"
              value={minTrustLevel}
              onChange={(e) => setMinTrustLevel(parseFloat(e.target.value))}
              className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-accent-500"
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400">
              <span>{t('settings.sections.wot.levels.strict')}</span>
              <span>{t('settings.sections.wot.levels.moderate')}</span>
              <span>{t('settings.sections.wot.levels.relaxed')}</span>
            </div>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-2">
              {minTrustLevel === 1.0
                ? t('settings.sections.wot.currentLevel.direct')
                : minTrustLevel === 0.5
                ? t('settings.sections.wot.currentLevel.extended')
                : t('settings.sections.wot.currentLevel.all')}
            </p>
          </div>
        </div>

        {trustCount > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-neutral-100 dark:bg-neutral-900 rounded-lg p-3 text-center">
              <Users className="w-4 h-4 text-neutral-500 dark:text-neutral-400 mx-auto mb-1" />
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {trustCount}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                {t('settings.sections.wot.stats.total')}
              </div>
            </div>
            <div className="bg-green-100 dark:bg-green-950/30 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                {level1Count}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                {t('settings.sections.wot.stats.direct')}
              </div>
            </div>
            <div className="bg-blue-100 dark:bg-blue-950/30 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                {level2Count}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">
                {t('settings.sections.wot.stats.extended')}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {lastUpdate && (
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {t('settings.sections.wot.lastUpdate')}{' '}
                {formatDistanceToNow(lastUpdate, { addSuffix: true })}
              </span>
            </div>
          )}
          <button
            onClick={handleRecalculate}
            disabled={isCalculating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 disabled:bg-neutral-300 disabled:dark:bg-neutral-800 text-white disabled:text-neutral-500 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isCalculating ? 'animate-spin' : ''}`} />
            {isCalculating
              ? t('settings.sections.wot.calculating')
              : t('settings.sections.wot.recalculate')}
          </button>
        </div>
      </div>
    </div>
  );
}