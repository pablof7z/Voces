import { Settings, LogOut, UserPlus, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useNDKCurrentUser, useNDKSessionLogout } from '@nostr-dev-kit/ndk-hooks';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { UserAvatar } from '@/components/ui/UserAvatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { clearAuthStorage } from '@/features/auth/utils/logout';
import { useState } from 'react';
import { CreateInviteModal } from '@/features/invites/CreateInviteModal';

export function UserMenu() {
  const { t } = useTranslation();
  const currentUser = useNDKCurrentUser();
  const profile = useProfile(currentUser?.pubkey);
  const logout = useNDKSessionLogout();
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleLogout = () => {
    logout();
    clearAuthStorage();
  };

  if (!currentUser) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="w-full">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-neutral-900/50 transition-colors cursor-pointer">
            <UserAvatar pubkey={currentUser.pubkey} size="md" />
            <div className="flex-1 min-w-0 text-left">
              <p className="font-medium text-sm truncate text-white">
                {profile?.name || 'Anonymous'}
              </p>
              <p className="text-xs text-neutral-500 truncate">
                {profile?.nip05 || currentUser.npub?.slice(0, 16) + '...'}
              </p>
            </div>
          </div>
        </DropdownMenuTrigger>
        {/* 
          Positioned above (side="top") to avoid dropdown being cut off at bottom of screen.
          Aligned to start (left edge) to match the trigger element's position.
        */}
        <DropdownMenuContent
          className="w-56 mb-2 ml-4"
          align="start"
          side="top"
        >
          <DropdownMenuItem asChild>
            <Link
              to={`/p/${currentUser.npub}`}
              className="flex items-center gap-3 px-2 py-3 cursor-pointer hover:bg-neutral-900/50"
            >
              <UserAvatar pubkey={currentUser.pubkey} size="md" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-white">
                  {profile?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-neutral-500">View profile</p>
              </div>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowInviteModal(true)}>
            <div className="flex items-center gap-3 cursor-pointer">
              <UserPlus className="w-4 h-4" />
              <span>Create Invite</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link
              to="/settings"
              className="flex items-center gap-3 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>{t('navigation.settings')}</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 cursor-pointer text-red-500 focus:text-red-600 dark:text-red-400 dark:focus:text-red-300"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('navigation.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateInviteModal 
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)} 
      />
    </>
  );
}