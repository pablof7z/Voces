import { Home, Store, Wallet, TrendingUp, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/marketplace', icon: Store, label: 'Market' },
  { path: '/wallet', icon: Wallet, label: 'Wallet' },
  { path: '/trades', icon: TrendingUp, label: 'Trades' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
      {/* Frosted glass effect with subtle border */}
      <div className="bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-200/20 dark:border-neutral-800/20">
        <div className="flex items-center justify-around h-16 px-3">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative flex flex-col items-center justify-center gap-1 w-full h-full group"
              >
                {/* Active indicator - minimal and elegant */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-accent-600 dark:bg-accent-400 rounded-full" />
                )}

                <div className="relative">
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-all duration-300',
                      isActive
                        ? 'text-neutral-900 dark:text-neutral-50'
                        : 'text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'
                    )}
                    strokeWidth={isActive ? 2 : 1.5}
                  />
                </div>

                <span className={cn(
                  'text-2xs font-medium transition-all duration-300',
                  isActive
                    ? 'text-neutral-900 dark:text-neutral-50'
                    : 'text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400'
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