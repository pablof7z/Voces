import { Home, Edit3, Bell, User, Wallet, TrendingUp, Settings, ShoppingBag, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { useTranslation } from 'react-i18next';
import { WalletWidget } from '../wallet/WalletWidget';
import { UserAvatar } from '../ui/UserAvatar';

const navItemsConfig = [
  { path: '/', icon: Home, key: 'feed' },
  { path: '/compose', icon: Edit3, key: 'compose' },
  { path: '/notifications', icon: Bell, key: 'notifications' },
  { path: '/profile', icon: User, key: 'profile' },
  { path: '/packs', icon: Package, key: 'followPacks' },
  { path: '/marketplace', icon: ShoppingBag, key: 'marketplace' },
  { path: '/wallet', icon: Wallet, key: 'wallet' },
  { path: '/trades', icon: TrendingUp, key: 'trades' },
];

export function Sidebar() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentUser = useNDKCurrentUser();
  const profile = useProfile(currentUser?.pubkey);

  const navItems = navItemsConfig.map(item => ({
    ...item,
    label: item.key === 'compose' ? 'Compose' : t(`navigation.${item.key}`)
  }));

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col h-screen fixed left-0 top-0 bg-black border-r border-neutral-800/50">
      {/* Clean logo without gradients */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-neutral-800/50">
        <h1 className="text-xl font-medium tracking-tight text-white">
          Voces
        </h1>
      </div>

      <nav className="flex-1 px-3 py-6">
        <div className="space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path ||
                           (path === '/packs' && location.pathname.startsWith('/packs/'));
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
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Wallet Widget */}
      <div className="px-3 mb-4">
        <WalletWidget />
      </div>

      {currentUser && (
        <div className="border-t border-neutral-800/50 p-4">
          <div className="flex items-center gap-3 mb-4">
            <UserAvatar pubkey={currentUser.pubkey} size="md" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate text-white">
                {profile?.name || 'Anonymous'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {profile?.nip05 || currentUser.npub?.slice(0, 16) + '...'}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              to="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-neutral-400 hover:bg-neutral-900/50 hover:text-neutral-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">{t('navigation.settings')}</span>
            </Link>
          </div>
        </div>
      )}
    </aside>
  );
}