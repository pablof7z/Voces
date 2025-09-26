import { Home, Store, Wallet, TrendingUp, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

const navItemsConfig = [
  { path: '/', icon: Home, key: 'feed' },
  { path: '/marketplace', icon: Store, key: 'marketplace' },
  { path: '/wallet', icon: Wallet, key: 'wallet' },
  { path: '/trades', icon: TrendingUp, key: 'trades' },
  { path: '/profile', icon: User, key: 'profile' },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = navItemsConfig.map(item => ({
    ...item,
    label: t(`navigation.${item.key}`)
  }));

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
      {/* Clean bottom nav */}
      <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around h-16 px-3">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative flex flex-col items-center justify-center gap-1 w-full h-full group"
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors duration-200',
                      isActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-400 dark:text-gray-500'
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>

                <span className={cn(
                  'text-xs font-medium transition-colors duration-200 mt-0.5',
                  isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                )}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}