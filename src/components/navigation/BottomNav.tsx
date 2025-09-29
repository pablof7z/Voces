import { Home, Store, Wallet, User, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import { useNDKCurrentUser, useProfile } from '@nostr-dev-kit/ndk-hooks';

const navItemsConfig = [
  { path: '/', icon: Home, key: 'feed' },
  { path: '/messages', icon: MessageSquare, key: 'messages' },
  { path: '/marketplace', icon: Store, key: 'marketplace' },
  { path: '/money', icon: Wallet, key: 'money' },
  { path: 'profile', icon: User, key: 'profile' },
];

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentUser = useNDKCurrentUser();
  const profile = useProfile(currentUser?.pubkey);

  const navItems = navItemsConfig.map(item => ({
    ...item,
    path: item.key === 'profile' && currentUser ? `/p/${currentUser.npub}` : item.path,
    label: t(`navigation.${item.key}`)
  }));

  return (
    <nav className="fixed bottom-0 left-0 right-0 md:hidden z-40">
      {/* Clean bottom nav */}
      <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around h-16 px-3">
          {navItems.map(({ path, icon: Icon, key }) => {
            const isActive = key === 'profile'
              ? location.pathname.startsWith('/p/')
              : location.pathname === path;
            const isProfileTab = key === 'profile';
            const showAvatar = isProfileTab && currentUser && profile?.picture;

            return (
              <Link
                key={path}
                to={path}
                className="relative flex items-center justify-center w-full h-full group"
              >
                <div className="relative">
                  {showAvatar ? (
                    <div className={cn(
                      "w-7 h-7 rounded-full overflow-hidden ring-2 transition-all duration-200",
                      isActive
                        ? 'ring-gray-900 dark:ring-white'
                        : 'ring-gray-400 dark:ring-gray-500'
                    )}>
                      <img
                        src={profile.picture}
                        alt={profile?.name || 'Profile'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <Icon
                      className={cn(
                        'w-6 h-6 transition-colors duration-200',
                        isActive
                          ? 'text-gray-900 dark:text-white'
                          : 'text-gray-400 dark:text-gray-500'
                      )}
                      strokeWidth={isActive ? 2 : 1.5}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}