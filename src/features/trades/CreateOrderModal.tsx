import { useState, useEffect } from 'react';
import { X, Bitcoin, MapPin, Plus } from 'lucide-react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';

interface CreateOrderModalProps {
  onClose: () => void;
}

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
  { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
];

const paymentMethods = [
  { id: 'Cash (F2F)', name: 'Cash (F2F)', icon: '💵', requiresLocation: true },
  { id: 'Revolut', name: 'Revolut', icon: '💳' },
  { id: 'PIX', name: 'PIX (Brazil)', icon: '🔄' },
  { id: 'BLIK', name: 'BLIK (Poland)', icon: '📱' },
  { id: 'Zelle', name: 'Zelle', icon: '🏦' },
  { id: 'CashApp', name: 'Cash App', icon: '📲' },
  { id: 'custom', name: 'Other...', icon: '✏️' },
];

function encodeGeohash(lat: number, lon: number, precision = 5): string {
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let idx = 0;
  let bit = 0;
  let evenBit = true;
  let geohash = '';

  let latRange = [-90.0, 90.0];
  let lonRange = [-180.0, 180.0];

  while (geohash.length < precision) {
    if (evenBit) {
      const mid = (lonRange[0] + lonRange[1]) / 2;
      if (lon >= mid) {
        idx |= (1 << (4 - bit));
        lonRange[0] = mid;
      } else {
        lonRange[1] = mid;
      }
    } else {
      const mid = (latRange[0] + latRange[1]) / 2;
      if (lat >= mid) {
        idx |= (1 << (4 - bit));
        latRange[0] = mid;
      } else {
        latRange[1] = mid;
      }
    }

    evenBit = !evenBit;
    bit++;

    if (bit === 5) {
      geohash += base32[idx];
      bit = 0;
      idx = 0;
    }
  }

  return geohash;
}

export function CreateOrderModal({ onClose }: CreateOrderModalProps) {
  const { ndk } = useNDK();
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [currency, setCurrency] = useState('USD');
  const [satsAmount, setSatsAmount] = useState('100000');
  const [fiatAmount, setFiatAmount] = useState('50');
  const [paymentMethod, setPaymentMethod] = useState('Cash (F2F)');
  const [customPaymentMethod, setCustomPaymentMethod] = useState('');
  const [location, setLocation] = useState('');
  const [geohash, setGeohash] = useState('');
  const [premium, setPremium] = useState('0');
  const [expirationHours, setExpirationHours] = useState('24');
  const [creating, setCreating] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  useEffect(() => {
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    if (selectedMethod?.requiresLocation) {
      setShowLocationPicker(true);
    } else {
      setShowLocationPicker(false);
      setLocation('');
      setGeohash('');
    }
  }, [paymentMethod]);

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const gh = encodeGeohash(lat, lon, 5);
          setGeohash(gh);
          setLocation(`Near ${gh} (auto-detected)`);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your location. Please enter city/area manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser. Please enter location manually.');
    }
  };

  const handleCreate = async () => {
    if (!ndk) return;

    const actualPaymentMethod = paymentMethod === 'custom' ? customPaymentMethod : paymentMethod;

    if (!actualPaymentMethod) {
      alert('Please specify a payment method');
      return;
    }

    if (paymentMethod === 'Cash (F2F)' && !location && !geohash) {
      alert('Please provide a location for face-to-face trades');
      return;
    }

    setCreating(true);

    try {
      const event = new NDKEvent(ndk);
      event.kind = 38383;

      const orderId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const tags = [
        ['d', orderId],
        ['k', orderType],
        ['f', currency],
        ['s', 'pending'],
        ['amt', satsAmount],
        ['fa', fiatAmount],
        ['pm', actualPaymentMethod],
        ['premium', premium],
        ['y', 'Voces'],
        ['z', 'order'],
        ['network', 'mainnet'],
        ['layer', 'lightning'],
        ['expiration', (Math.floor(Date.now() / 1000) + parseInt(expirationHours) * 3600).toString()]
      ];

      if (geohash) {
        tags.push(['g', geohash]);
      }

      event.tags = tags;
      event.content = '';

      await event.publish();

      onClose();
    } catch (error) {
      console.error('Failed to create order:', error);
    } finally {
      setCreating(false);
    }
  };

  const btcAmount = parseInt(satsAmount) / 100000000;
  const pricePerBtc = parseFloat(fiatAmount) / btcAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-black rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create P2P Order
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOrderType('buy')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  orderType === 'buy'
                    ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                I want to buy Bitcoin
              </button>
              <button
                onClick={() => setOrderType('sell')}
                className={`px-4 py-3 rounded-lg border-2 transition-colors ${
                  orderType === 'sell'
                    ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    : 'border-gray-300 dark:border-gray-700'
                }`}
              >
                I want to sell Bitcoin
              </button>
            </div>
          </div>

          {/* Bitcoin Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bitcoin Amount (sats)
            </label>
            <div className="relative">
              <Bitcoin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-500" />
              <input
                type="number"
                value={satsAmount}
                onChange={(e) => setSatsAmount(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                placeholder="100000"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              = {btcAmount.toFixed(8)} BTC
            </p>
          </div>

          {/* Fiat Amount & Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fiat Amount
              </label>
              <input
                type="number"
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                placeholder="50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ≈ ${pricePerBtc.toFixed(2)}/BTC
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              >
                {currencies.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors ${
                    paymentMethod === method.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                      : 'border-gray-300 dark:border-gray-700'
                  }`}
                >
                  <span className="text-lg">{method.icon}</span>
                  <span className="text-sm">{method.name}</span>
                </button>
              ))}
            </div>

            {paymentMethod === 'custom' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={customPaymentMethod}
                  onChange={(e) => setCustomPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                  placeholder="Enter payment method (e.g., Bank Transfer, PayPal, etc.)"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Location for F2F */}
          {showLocationPicker && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                Location (Required for F2F)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
                    placeholder="City, neighborhood, or area"
                  />
                  <button
                    type="button"
                    onClick={handleLocationRequest}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                    title="Use current location"
                  >
                    <MapPin className="w-5 h-5" />
                  </button>
                </div>
                {geohash && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Geohash: {geohash} (approximate location)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Premium */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Premium (%)
            </label>
            <input
              type="number"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
              placeholder="0"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Positive for above market, negative for below
            </p>
          </div>

          {/* Expiration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Expiration (hours)
            </label>
            <select
              value={expirationHours}
              onChange={(e) => setExpirationHours(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white"
            >
              <option value="1">1 hour</option>
              <option value="6">6 hours</option>
              <option value="12">12 hours</option>
              <option value="24">24 hours</option>
              <option value="48">48 hours</option>
              <option value="72">72 hours</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !satsAmount || !fiatAmount}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}