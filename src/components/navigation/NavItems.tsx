import { Home, Edit3, Bell, User, Wallet, TrendingUp, ShoppingBag, Package } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

const NAV_ITEMS_CONFIG = [
  { path: '/', icon: Home, labelKey: 'feed' },
  { path: '/compose', icon: Edit3, labelKey: 'compose' },
  { path: '/notifications', icon: Bell, labelKey: 'notifications' },
  { path: '/profile', icon: User, labelKey: 'profile' },
  { path: '/packs', icon: Package, labelKey: 'followPacks' },
  { path: '/marketplace', icon: ShoppingBag, labelKey: 'marketplace' },
  { path: '/wallet', icon: Wallet, labelKey: 'wallet' },
  { path: '/trades', icon: TrendingUp, labelKey: 'trades' },
] as const;

export function NavItems() {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <nav className="flex-1 px-3 py-6">
      <div className="space-y-1">
        {NAV_ITEMS_CONFIG.map(({ path, icon: Icon, labelKey }) => {
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
              <span>{t(`navigation.${labelKey}`)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}