import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ComposePage } from './pages/ComposePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { WalletPage } from './pages/WalletPage';
import { SettingsPage } from './pages/SettingsPage';
import { TradePage } from './pages/TradePage';
import { MarketplacePage } from './pages/marketplace/MarketplacePage';
import { CreateListingPage } from './pages/marketplace/CreateListingPage';
import { ListingDetailPage } from './pages/marketplace/ListingDetailPage';
import { FollowPacksPage } from './pages/FollowPacksPage';
import { FollowPackDetailPage } from './pages/FollowPackDetailPage';
import { useNDKCurrentUser } from '@nostr-dev-kit/ndk-hooks';

const queryClient = new QueryClient();

function AppRoutes() {
  const currentUser = useNDKCurrentUser();
  
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="compose" element={currentUser ? <ComposePage /> : <Navigate to="/" />} />
        <Route path="notifications" element={currentUser ? <NotificationsPage /> : <Navigate to="/" />} />
        <Route path="profile" element={currentUser ? <ProfilePage /> : <Navigate to="/" />} />
        <Route path="p/:identifier" element={<ProfilePage />} />
        <Route path="packs" element={<FollowPacksPage />} />
        <Route path="packs/:packId" element={<FollowPackDetailPage />} />
        <Route path="wallet" element={<WalletPage />} />
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
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;