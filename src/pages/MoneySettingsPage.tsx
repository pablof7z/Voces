import { useState } from 'react';
import { ChevronLeft, Check, Plus, Trash2, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePreferredCurrency } from '../hooks/usePreferredCurrency';
import { useWalletStore } from '../stores/walletStore';
import { DiscoverMintsModal } from '../components/wallet/DiscoverMintsModal';

const FIAT_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
];

export function MoneySettingsPage() {
  const navigate = useNavigate();
  const { currency, updateCurrency } = usePreferredCurrency();

  const mints = useWalletStore((state) => state.mints);
  const walletRelays = useWalletStore((state) => state.walletRelays);
  const addMint = useWalletStore((state) => state.addMint);
  const removeMint = useWalletStore((state) => state.removeMint);
  const addWalletRelay = useWalletStore((state) => state.addWalletRelay);
  const removeWalletRelay = useWalletStore((state) => state.removeWalletRelay);

  const [newMint, setNewMint] = useState('');
  const [newRelay, setNewRelay] = useState('');
  const [showMintInput, setShowMintInput] = useState(false);
  const [showRelayInput, setShowRelayInput] = useState(false);
  const [showDiscoverModal, setShowDiscoverModal] = useState(false);
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

  const handleSelectCurrency = (code: string) => {
    updateCurrency(code);
    setShowCurrencyDropdown(false);
  };

  const handleAddMint = () => {
    if (newMint.trim()) {
      addMint(newMint.trim());
      setNewMint('');
      setShowMintInput(false);
    }
  };

  const handleAddRelay = () => {
    if (newRelay.trim()) {
      addWalletRelay(newRelay.trim());
      setNewRelay('');
      setShowRelayInput(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-black pb-20">
      <div className="max-w-2xl mx-auto">
        <div className="sticky top-0 z-10 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/money')}
                className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  Money Settings
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Configure your wallet and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Mints
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Manage Cashu mints for your wallet
              </p>
            </div>

            <div className="space-y-2 mb-3">
              {mints.map((mint) => (
                <div
                  key={mint}
                  className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl"
                >
                  <span className="text-sm text-neutral-900 dark:text-neutral-100 font-mono truncate flex-1 mr-2">
                    {mint}
                  </span>
                  <button
                    onClick={() => removeMint(mint)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {showMintInput && (
              <div className="mb-3 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                <input
                  type="text"
                  value={newMint}
                  onChange={(e) => setNewMint(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMint()}
                  placeholder="https://mint.example.com"
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddMint}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowMintInput(false);
                      setNewMint('');
                    }}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setShowMintInput(true)}
                disabled={showMintInput}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-neutral-50 dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                Add Mint
              </button>
              <button
                onClick={() => setShowDiscoverModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors"
              >
                <Search className="w-4 h-4" />
                Discover
              </button>
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Wallet Relays
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Configure relays for wallet operations (separate from app relays)
              </p>
            </div>

            <div className="space-y-2 mb-3">
              {walletRelays.length === 0 ? (
                <div className="p-4 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    No wallet relays configured. Using app relays.
                  </p>
                </div>
              ) : (
                walletRelays.map((relay) => (
                  <div
                    key={relay}
                    className="flex items-center justify-between p-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl"
                  >
                    <span className="text-sm text-neutral-900 dark:text-neutral-100 font-mono truncate flex-1 mr-2">
                      {relay}
                    </span>
                    <button
                      onClick={() => removeWalletRelay(relay)}
                      className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {showRelayInput && (
              <div className="mb-3 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                <input
                  type="text"
                  value={newRelay}
                  onChange={(e) => setNewRelay(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRelay()}
                  placeholder="wss://relay.example.com"
                  className="w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRelay}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowRelayInput(false);
                      setNewRelay('');
                    }}
                    className="px-4 py-2 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowRelayInput(true)}
              disabled={showRelayInput}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 hover:bg-neutral-800 dark:hover:bg-neutral-200 text-neutral-50 dark:text-neutral-900 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Add Relay
            </button>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-1">
                Preferred Fiat Currency
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Choose your preferred currency for viewing marketplace items and P2P trades
              </p>
            </div>

            <div className="relative">
              {/* Selected Currency Display - Always visible */}
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="w-full px-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/80 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                      {FIAT_CURRENCIES.find(c => c.code === currency)?.symbol || '$'}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {currency || 'USD'}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {FIAT_CURRENCIES.find(c => c.code === currency)?.name || 'US Dollar'}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-neutral-500 transition-transform ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {showCurrencyDropdown && (
                <div className="absolute top-full mt-2 w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg z-50 max-h-80 overflow-y-auto">
                  {FIAT_CURRENCIES.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => handleSelectCurrency(curr.code)}
                      className="w-full px-4 py-3 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center font-semibold transition-colors">
                          {curr.symbol}
                        </div>
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            {curr.code}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {curr.name}
                          </div>
                        </div>
                      </div>
                      {currency === curr.code && (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Discover Mints Modal */}
      <DiscoverMintsModal
        isOpen={showDiscoverModal}
        onClose={() => setShowDiscoverModal(false)}
      />
    </div>
  );
}