import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { LoginButton } from '@/features/auth/LoginButton';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { FAB } from '@/components/ui/FAB';
import { Bell } from 'lucide-react';
import { RelaySelector } from '@/components/navigation/RelaySelector';

export function Layout() {
  const currentUser = useNDKCurrentUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="md:ml-64 lg:ml-72 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden sticky top-0 z-50 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/30">
          <div className="flex items-center justify-between px-5 h-14">
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
              Voces
            </h1>
            <div className="flex items-center gap-2">
              <RelaySelector />
              {currentUser && (
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50 rounded-lg transition-all duration-200"
                >
                  <Bell className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
                  {/* Subtle notification dot */}
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-accent-500 rounded-full" />
                </button>
              )}
              {!currentUser && <LoginButton />}
            </div>
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between px-6 py-4">
            <RelaySelector />
            <div className="flex-1" />
            <LoginButton />
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      
      {/* Bottom navigation for mobile - always show */}
      <BottomNav />

      {/* FAB for compose */}
      {currentUser && <FAB />}
    </div>
  );
}