import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { WalletWidget } from '../wallet/WalletWidget';
import { LoginButton } from '@/features/auth/LoginButton';
import { NavItems } from './NavItems';
import { UserMenu } from './UserMenu';

export function Sidebar() {
  const currentUser = useNDKCurrentUser();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col h-screen fixed left-0 top-0 bg-black border-r border-neutral-800/50">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-neutral-800/50">
        <h1 className="text-xl font-medium tracking-tight text-white">
          Voces
        </h1>
      </div>

      <NavItems />

      <div className="px-3 mb-4">
        <WalletWidget />
      </div>

      <div className="border-t border-neutral-800/50 p-4">
        {currentUser ? <UserMenu /> : <LoginButton />}
      </div>
    </aside>
  );
}