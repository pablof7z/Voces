import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ComposePage } from './pages/ComposePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MoneyPage } from './pages/MoneyPage';
import { MoneySettingsPage } from './pages/MoneySettingsPage';
import { SettingsPage } from './pages/SettingsPage';
import { TradePage } from './pages/TradePage';
import { MarketplacePage } from './pages/marketplace/MarketplacePage';
import { CreateListingPage } from './pages/marketplace/CreateListingPage';
import { ListingDetailPage } from './pages/marketplace/ListingDetailPage';
import { FollowPacksPage } from './pages/FollowPacksPageImproved';
import { FollowPackDetailPage } from './pages/FollowPackDetailPage';
import { NoteDetailPage } from './pages/NoteDetailPage';
import { MessagesPage } from './pages/MessagesPage';
import { ConversationPage } from './pages/ConversationPage';
import { NewConversationPage } from './pages/NewConversationPage';
import { ArticlePage } from './pages/ArticlePage';
import InviteOnboarding1 from './pages/invites/InviteOnboarding1';
import InviteOnboarding2 from './pages/invites/InviteOnboarding2';
import InviteOnboarding3 from './pages/invites/InviteOnboarding3';
import InviteOnboarding4 from './pages/invites/InviteOnboarding4';
import InviteOnboarding5 from './pages/invites/InviteOnboarding5';
import InviteOnboarding6 from './pages/invites/InviteOnboarding6';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';
import { WalletInitializer } from './components/wallet/WalletInitializer';

const queryClient = new QueryClient();

function AppRoutes() {
  const currentUser = useNDKCurrentUser();

  return (
    <Routes>
      {/* Invite onboarding routes - standalone without layout */}
      <Route path="/i-1/:code" element={<InviteOnboarding1 />} />
      <Route path="/i-2/:code" element={<InviteOnboarding2 />} />
      <Route path="/i-3/:code" element={<InviteOnboarding3 />} />
      <Route path="/i-4/:code" element={<InviteOnboarding4 />} />
      <Route path="/i-5/:code" element={<InviteOnboarding5 />} />
      <Route path="/i-6/:code" element={<InviteOnboarding6 />} />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="compose" element={currentUser ? <ComposePage /> : <Navigate to="/" />} />
        <Route path="notifications" element={currentUser ? <NotificationsPage /> : <Navigate to="/" />} />
        <Route path="messages" element={currentUser ? <MessagesPage /> : <Navigate to="/" />} />
        <Route path="messages/new" element={currentUser ? <NewConversationPage /> : <Navigate to="/" />} />
        <Route path="messages/:pubkey" element={currentUser ? <ConversationPage /> : <Navigate to="/" />} />
        <Route path="profile" element={currentUser ? <ProfilePage /> : <Navigate to="/" />} />
        <Route path="p/:identifier" element={<ProfilePage />} />
        <Route path="e/:nevent" element={<NoteDetailPage />} />
        <Route path="article/:naddr" element={<ArticlePage />} />
        <Route path="packs" element={<FollowPacksPage />} />
        <Route path="packs/:packId" element={<FollowPackDetailPage />} />
        <Route path="money" element={<MoneyPage />} />
        <Route path="money/settings" element={<MoneySettingsPage />} />
        <Route path="trades" element={<TradePage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="marketplace/create" element={<CreateListingPage />} />
        <Route path="marketplace/:id" element={<ListingDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <WalletInitializer />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;