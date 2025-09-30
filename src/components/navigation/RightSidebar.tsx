import { Clock, Sparkles, PenTool } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { nip19 } from 'nostr-tools';
import { useArticles } from '@/features/articles/hooks/useArticles';
import { useMemo } from 'react';
import { UserName } from '@/components/ui/UserName';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { MarketplaceSidebar } from '@/components/wallet/MarketplaceSidebar';
import { P2PTradeSidebar } from '@/components/wallet/P2PTradeSidebar';

export function RightSidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const articles = useArticles({ limit: 10 }); // Fetch more to ensure we have 5 with images
  const loading = articles.length === 0;

  // Determine what content to show based on current page
  const showHomeFeedContent = location.pathname === '/' || location.pathname === '/home';
  const showMoneyContent = location.pathname === '/money';

  const articleData = useMemo(() => {
    return articles
      .filter(article => article.image) // Only show articles with images
      .slice(0, 5) // Take first 5 articles with images
      .map(article => ({
        id: article.dTag || article.id,
        title: (article.title || 'Untitled').slice(0, 100),
        timestamp: article.published_at || article.created_at || 0,
        image: article.image,
        pubkey: article.pubkey
      }));
  }, [articles]);

  // Journalists profiles
  const journalists = [
    {
      npub: 'npub1q6wrnf7ue6wdxwjc2z5wxfwp7eykahady78hjh7wvqkmjsvwva2qcypndn',
      pubkey: nip19.decode('npub1q6wrnf7ue6wdxwjc2z5wxfwp7eykahady78hjh7wvqkmjsvwva2qcypndn').data as string,
    },
    {
      npub: 'npub147whqsr5vsj86x0ays70r0hgreklre3ey97uvcmxhum65skst56s30selt',
      pubkey: nip19.decode('npub147whqsr5vsj86x0ays70r0hgreklre3ey97uvcmxhum65skst56s30selt').data as string,
    }
  ];


  return (
    <aside className="hidden xl:flex xl:w-80 2xl:w-96 flex-col h-screen sticky top-0 bg-black border-l border-neutral-800/50 overflow-y-auto">
      <div className="p-6 space-y-8">
        {showHomeFeedContent ? (
          <>
            {/* Recent Articles */}
            <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h2 className="text-lg font-semibold text-white">Recent Articles</h2>
              </div>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-neutral-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-neutral-800 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {articleData.map((article) => (
                    <Link
                      key={article.id}
                      to={`/article/${nip19.naddrEncode({
                        kind: 30023,
                        pubkey: article.pubkey || '',
                        identifier: article.id
                      })}`}
                      className="block p-3 rounded-xl hover:bg-neutral-800/50 transition-all duration-200 group"
                    >
                      <div className="flex gap-3">
                        <img
                          src={article.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 text-xs text-neutral-600">
                            {article.pubkey && (
                              <>
                                <UserName pubkey={article.pubkey} className="text-neutral-500" />
                                <span>•</span>
                              </>
                            )}
                            <Clock className="w-3 h-3" />
                            <span>{new Date(article.timestamp * 1000).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Journalists Section */}
            <div className="bg-neutral-900/50 rounded-2xl p-5 border border-neutral-800/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="w-5 h-5 text-orange-500" />
                <h2 className="text-lg font-semibold text-white">Journalists</h2>
              </div>
              <div className="space-y-3">
                {journalists.map((journalist) => (
                  <Link
                    key={journalist.npub}
                    to={`/p/${journalist.npub}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800/50 transition-all duration-200 group"
                  >
                    <UserAvatar
                      pubkey={journalist.pubkey}
                      size="sm"
                      showTrustIndicator={false}
                    />
                    <div className="flex-1 min-w-0">
                      <UserName
                        pubkey={journalist.pubkey}
                        className="text-sm font-medium text-white group-hover:text-orange-500 transition-colors"
                        showNpub={false}
                      />
                      <p className="text-xs text-neutral-500 mt-1">Journalist</p>
                    </div>
                    <button className="px-3 py-1 text-xs bg-orange-500/10 text-orange-500 rounded-full hover:bg-orange-500/20 transition-colors">
                      Follow
                    </button>
                  </Link>
                ))}
              </div>
              <Link
                to="/journalists"
                className="mt-3 block text-center text-sm text-orange-500 hover:text-orange-400 transition-colors"
              >
                View all journalists →
              </Link>
            </div>

            {/* Footer Links */}
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-600">
                <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-neutral-400 transition-colors">About</a>
                <a href="#" className="hover:text-neutral-400 transition-colors">Help</a>
              </div>
              <p className="text-xs text-neutral-700 mt-3">© 2024 Voces</p>
            </div>
          </>
        ) : showMoneyContent ? (
          <>
            {/* Marketplace Section */}
            <MarketplaceSidebar />

            {/* P2P Trades Section */}
            <P2PTradeSidebar />

            {/* Footer Links */}
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-neutral-600">
                <a href="#" className="hover:text-neutral-400 transition-colors">Terms</a>
                <a href="#" className="hover:text-neutral-400 transition-colors">Privacy</a>
                <a href="#" className="hover:text-neutral-400 transition-colors">About</a>
                <a href="#" className="hover:text-neutral-400 transition-colors">Help</a>
              </div>
              <p className="text-xs text-neutral-700 mt-3">© 2024 Voces</p>
            </div>
          </>
        ) : (
          /* Empty state for non-home pages - ready for future content */
          <div className="flex-1" />
        )}
      </div>
    </aside>
  );
}