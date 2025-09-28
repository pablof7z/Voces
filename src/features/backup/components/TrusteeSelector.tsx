/**
 * Component for selecting trustees for backup key shards
 */

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, X } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useProfile, useFollows } from '@nostr-dev-kit/ndk-hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Trustee } from '../types';

interface TrusteeSelectorProps {
  trustees: Trustee[];
  maxTrustees: number;
  onTrusteesChange: (trustees: Trustee[]) => void;
}

export function TrusteeSelector({ trustees, maxTrustees, onTrusteesChange }: TrusteeSelectorProps) {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const follows = useFollows();

  const followsList = useMemo(() => Array.from(follows), [follows]);

  const handleAddTrustee = (pubkey: string) => {
    if (trustees.length >= maxTrustees) {
      return;
    }

    if (trustees.some(t => t.pubkey === pubkey)) {
      return;
    }

    onTrusteesChange([...trustees, { pubkey, selected: true }]);
  };

  const handleRemoveTrustee = (pubkey: string) => {
    onTrusteesChange(trustees.filter(t => t.pubkey !== pubkey));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
          {t('backup.trustees.label')}
        </label>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-3">
          {t('backup.trustees.description')}
        </p>
      </div>

      {/* Selected trustees list */}
      {trustees.length > 0 && (
        <div className="space-y-2">
          {trustees.map((trustee) => (
            <TrusteeCard
              key={trustee.pubkey}
              trustee={trustee}
              onRemove={() => handleRemoveTrustee(trustee.pubkey)}
            />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm mb-2">
        <span className="text-neutral-600 dark:text-neutral-400">
          {t('backup.trustees.selected', { count: trustees.length, max: maxTrustees })}
        </span>
      </div>

      {/* Search follows */}
      {trustees.length < maxTrustees && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search your follows..."
              className="w-full pl-10"
            />
          </div>

          <FollowsList
            follows={followsList}
            searchValue={searchValue}
            selectedPubkeys={new Set(trustees.map(t => t.pubkey))}
            onSelect={handleAddTrustee}
          />
        </>
      )}
    </div>
  );
}

interface FollowsListProps {
  follows: string[];
  searchValue: string;
  selectedPubkeys: Set<string>;
  onSelect: (pubkey: string) => void;
}

function FollowsList({ follows, searchValue, selectedPubkeys, onSelect }: FollowsListProps) {
  const filteredFollows = useMemo(() => {
    if (!searchValue.trim()) {
      return follows.filter(pubkey => !selectedPubkeys.has(pubkey));
    }

    const searchLower = searchValue.toLowerCase();
    return follows.filter(pubkey => !selectedPubkeys.has(pubkey));
  }, [follows, searchValue, selectedPubkeys]);

  if (filteredFollows.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm">
        {searchValue ? 'No follows found matching your search' : 'No follows available'}
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg max-h-64 overflow-y-auto">
      {filteredFollows.map((pubkey) => (
        <FollowListItem
          key={pubkey}
          pubkey={pubkey}
          searchValue={searchValue}
          onSelect={() => onSelect(pubkey)}
        />
      ))}
    </div>
  );
}

interface FollowListItemProps {
  pubkey: string;
  searchValue: string;
  onSelect: () => void;
}

function FollowListItem({ pubkey, searchValue, onSelect }: FollowListItemProps) {
  const profile = useProfile(pubkey);

  const matchesSearch = useMemo(() => {
    if (!searchValue.trim()) return true;

    const searchLower = searchValue.toLowerCase();
    const name = profile?.name?.toLowerCase() || '';
    const displayName = profile?.displayName?.toLowerCase() || '';
    const nip05 = profile?.nip05?.toLowerCase() || '';

    return name.includes(searchLower) ||
           displayName.includes(searchLower) ||
           nip05.includes(searchLower);
  }, [profile, searchValue]);

  if (!matchesSearch) return null;

  return (
    <button
      onClick={onSelect}
      className="w-full flex items-center gap-3 p-3 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
    >
      <UserAvatar pubkey={pubkey} size="sm" />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {profile?.name || 'Anonymous'}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {profile?.nip05 || `${pubkey.slice(0, 8)}...${pubkey.slice(-4)}`}
        </p>
      </div>
    </button>
  );
}

interface TrusteeCardProps {
  trustee: Trustee;
  onRemove: () => void;
}

function TrusteeCard({ trustee, onRemove }: TrusteeCardProps) {
  const profile = useProfile(trustee.pubkey);

  return (
    <div className="flex items-center gap-3 p-3 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
      <UserAvatar pubkey={trustee.pubkey} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
          {profile?.name || 'Anonymous'}
        </p>
        <p className="text-xs text-neutral-500 truncate">
          {profile?.nip05 || `${trustee.pubkey.slice(0, 8)}...${trustee.pubkey.slice(-4)}`}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
      >
        <X className="w-4 h-4 text-neutral-500" />
      </button>
    </div>
  );
}