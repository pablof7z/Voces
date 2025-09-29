import { useState, useRef, useEffect } from 'react';
import { Home, Edit3, Bell, Wallet, TrendingUp, ShoppingBag, Package, MessageSquare, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useWallet } from '@/hooks/useWallet';
import { ComposeModal } from '@/features/feed/ComposeModal';

const NAV_ITEMS_CONFIG = [
  { path: '/', icon: Home, labelKey: 'feed' },
  { path: '/messages', icon: MessageSquare, labelKey: 'messages' },
  { path: '/notifications', icon: Bell, labelKey: 'notifications' },
  { path: '/packs', icon: Package, labelKey: 'followPacks' },
  { path: '/money', icon: Wallet, labelKey: 'money' },
] as const;

const MORE_ITEMS_CONFIG = [
  { path: '/marketplace', icon: ShoppingBag, labelKey: 'marketplace' },
  { path: '/trades', icon: TrendingUp, labelKey: 'trades' },
] as const;

export function NavItems() {
  const { t } = useTranslation();
  const location = useLocation();
  const { balance } = useWallet();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMoreActive = MORE_ITEMS_CONFIG.some(({ path }) => location.pathname.startsWith(path));

  return (
    <nav className="flex-1 px-3 py-6">
      <div className="space-y-1">
        {NAV_ITEMS_CONFIG.map(({ path, icon: Icon, labelKey }) => {
          const isActive = location.pathname === path ||
                         (path === '/packs' && location.pathname.startsWith('/packs/')) ||
                         (path === '/money' && location.pathname.startsWith('/money')) ||
                         (path === '/messages' && location.pathname.startsWith('/messages'));
          const isMoney = path === '/money';

          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm',
                isActive
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
              <span>{t(`navigation.${labelKey}`)}</span>
              {isMoney && (
                <span className="ml-auto text-xs font-normal text-orange-500">
                  {balance.toLocaleString()} sats
                </span>
              )}
            </Link>
          );
        })}

        <div ref={moreRef} className="relative">
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm',
              isMoreActive
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200'
            )}
          >
            <MoreHorizontal className="w-5 h-5" strokeWidth={isMoreActive ? 2 : 1.5} />
            <span>More</span>
            <ChevronDown
              className={cn(
                'w-4 h-4 ml-auto transition-transform',
                showMoreMenu && 'rotate-180'
              )}
            />
          </button>

          {showMoreMenu && (
            <div className="absolute left-0 right-0 mt-1 bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-lg z-50">
              {MORE_ITEMS_CONFIG.map(({ path, icon: Icon, labelKey }) => {
                const isActive = location.pathname.startsWith(path);

                return (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setShowMoreMenu(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 transition-all font-medium text-sm',
                      isActive
                        ? 'bg-neutral-800 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800/50 hover:text-neutral-200'
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                    <span>{t(`navigation.${labelKey}`)}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <button
          onClick={() => setIsComposeOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
        >
          <Edit3 className="w-5 h-5" strokeWidth={2} />
          <span>{t('navigation.compose')}</span>
        </button>
      </div>

      <ComposeModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />
    </nav>
  );
}