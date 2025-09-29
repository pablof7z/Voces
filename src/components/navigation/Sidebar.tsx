import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { LoginButton } from '@/features/auth/LoginButton';
import { NavItems } from './NavItems';
import { UserMenu } from './UserMenu';

export function Sidebar() {
  const currentUser = useNDKCurrentUser();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col h-screen sticky top-0 bg-black border-r border-neutral-800/50">
      <div className="flex flex-col px-6 py-6 border-b border-neutral-800/50">
        <h1 className="text-2xl font-bold tracking-tight text-orange-600">
          Voces
        </h1>
        <span className="text-xs text-neutral-400 mt-1 tracking-wider uppercase">
          a WLC project
        </span>
      </div>

      <NavItems />

      <div className="border-t border-neutral-800/50 p-4 mt-auto">
        {currentUser ? <UserMenu /> : <LoginButton />}
      </div>
    </aside>
  );
}