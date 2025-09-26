import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { NDKKind } from '@nostr-dev-kit/ndk';
import { FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { nip19 } from 'nostr-tools';

interface EmbeddedArticleProps {
  naddr: any; // naddr decoded data
}

export function EmbeddedArticle({ naddr }: EmbeddedArticleProps) {
  // For kind:30023 (long-form content), we'll show a preview
  const profile = useProfile(naddr.pubkey);
  const displayName = profile?.name || profile?.displayName || 'Anonymous';

  // Parse tags if available
  const title = naddr.identifier || 'Untitled Article';

  return (
    <div className="my-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-900/50 hover:bg-neutral-50 dark:hover:bg-neutral-900/70 transition-colors overflow-hidden">
      <Link
        to={`/article/${nip19.naddrEncode(naddr)}`}
        className="block p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-accent-100 dark:bg-accent-900/20 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-accent-600 dark:text-accent-400" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 line-clamp-2 mb-1">
              {title}
            </h3>

            {profile?.about && (
              <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 mb-2">
                {profile.about}
              </p>
            )}

            <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-500">
              <span className="font-medium">{displayName}</span>
              {naddr.kind === NDKKind.Article && (
                <>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Long-form article
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}