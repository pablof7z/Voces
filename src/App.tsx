import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NDKProvider } from './contexts/NDKContext';
import { LoginButton } from './features/auth/LoginButton';
import { NoteFeed } from './features/feed/NoteFeed';
import { ComposeNote } from './features/feed/ComposeNote';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NDKProvider>
        <div className="min-h-screen bg-background">
          <header className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Voces</h1>
                <LoginButton />
              </div>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <ComposeNote />
              <NoteFeed />
            </div>
          </main>
        </div>
      </NDKProvider>
    </QueryClientProvider>
  );
}

export default App;