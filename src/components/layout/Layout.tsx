import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from '@/components/navigation/Sidebar';
import { RightSidebar } from '@/components/navigation/RightSidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { LoginButton } from '@/features/auth/LoginButton';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { FAB } from '@/components/ui/FAB';
import { Bell } from 'lucide-react';
import { RelaySelector } from '@/components/navigation/RelaySelector';
import { useNotificationStore } from '@/stores/notificationStore';

export function Layout() {
  const currentUser = useNDKCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = useNotificationStore(state => state.unreadCount);

  // Hide right sidebar on certain pages that need full width
  const hideRightSidebar = location.pathname.startsWith('/article/') ||
                          location.pathname.startsWith('/note/') ||
                          location.pathname.startsWith('/messages/') ||
                          location.pathname.startsWith('/p/');

  return (
    <div className="min-h-screen bg-black flex justify-center">
      <div className="flex w-full max-w-[1400px]">
        {/* Left Sidebar - Navigation */}
        <Sidebar />

        {/* Main Content Container */}
        <div className="flex-1 flex">
          {/* Center column - Main content */}
          <div className={`flex-1 ${hideRightSidebar ? 'max-w-[900px]' : 'max-w-[600px]'} flex flex-col min-h-screen border-x border-neutral-800/50`}>
          {/* Mobile header */}
          <header className="md:hidden sticky top-0 z-50 bg-black/90 backdrop-blur-xl border-b border-neutral-800/50">
            <div className="flex items-center justify-between px-4 h-14">
              <RelaySelector />
              <div className="flex items-center gap-2">
                {currentUser && (
                  <button
                    onClick={() => navigate('/notifications')}
                    className="relative p-2 hover:bg-neutral-800/50 rounded-lg transition-all duration-200"
                  >
                    <Bell className="w-5 h-5 text-neutral-400" />
                    {/* Notification dot if unread */}
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </button>
                )}
                {!currentUser && <LoginButton />}
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 pb-20 md:pb-0 bg-black">
            <Outlet />
          </main>
        </div>

          {/* Right Sidebar - Suggested content */}
          {!hideRightSidebar && <RightSidebar />}
        </div>
      </div>

      {/* Bottom navigation for mobile - always show */}
      <BottomNav />

      {/* FAB for compose */}
      {currentUser && <FAB />}
    </div>
  );
}