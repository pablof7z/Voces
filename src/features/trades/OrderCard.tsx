import { useState } from 'react';
import { Bitcoin, Star, MessageSquare, ArrowRight, Shield } from 'lucide-react';
import { useProfile } from '@nostr-dev-kit/ndk-hooks';
import { formatDistanceToNow } from 'date-fns';
import { NDKEvent } from '@nostr-dev-kit/ndk';
import { TakeOrderModal } from './TakeOrderModal';

interface OrderCardProps {
  order: {
    id: string;
    pubkey: string;
    type: 'buy' | 'sell';
    currency: string;
    status: string;
    paymentMethod: string;
    satsAmount: number;
    fiatAmount: number;
    premium?: number;
    rating?: number;
    platform?: string;
    createdAt: number;
    event: NDKEvent;
  };
}

const currencyData: { [key: string]: { symbol: string; flag: string } } = {
  USD: { symbol: '$', flag: '🇺🇸' },
  EUR: { symbol: '€', flag: '🇪🇺' },
  GBP: { symbol: '£', flag: '🇬🇧' },
  BRL: { symbol: 'R$', flag: '🇧🇷' },
  ARS: { symbol: '$', flag: '🇦🇷' },
  PLN: { symbol: 'zł', flag: '🇵🇱' },
  JPY: { symbol: '¥', flag: '🇯🇵' },
  CHF: { symbol: 'Fr', flag: '🇨🇭' },
  PEN: { symbol: 'S/', flag: '🇵🇪' },
  UYU: { symbol: '$', flag: '🇺🇾' },
  VES: { symbol: 'Bs', flag: '🇻🇪' },
  RUB: { symbol: '₽', flag: '🇷🇺' },
  SEK: { symbol: 'kr', flag: '🇸🇪' },
  NOK: { symbol: 'kr', flag: '🇳🇴' },
  AUD: { symbol: '$', flag: '🇦🇺' },
  CUP: { symbol: '$', flag: '🇨🇺' },
};

const paymentMethodData: { [key: string]: { icon: string; region: string } } = {
  'Cash': { icon: '💵', region: 'Universal' },
  'PIX': { icon: '🔄', region: 'Brazil' },
  'BLIK': { icon: '📱', region: 'Poland' },
  'Revolut': { icon: '💳', region: 'Europe' },
  'Zelle': { icon: '🏦', region: 'USA' },
  'CashApp': { icon: '📲', region: 'USA' },
  'CVU': { icon: '🏧', region: 'Argentina' },
  'MP': { icon: '📲', region: 'Argentina' },
  'f2f': { icon: '🤝', region: 'Local' },
  'СБП': { icon: '🏦', region: 'Russia' },
};

export function OrderCard({ order }: OrderCardProps) {
  const profile = useProfile(order.pubkey);
  const [showTakeModal, setShowTakeModal] = useState(false);

  const currencyInfo = currencyData[order.currency] || { symbol: order.currency, flag: '🌍' };
  const paymentInfo = paymentMethodData[order.paymentMethod] || { icon: '💰', region: '' };

  // Calculate price per BTC
  const pricePerBtc = order.fiatAmount > 0 && order.satsAmount > 0
    ? (order.fiatAmount / order.satsAmount) * 100000000
    : 0;

  return (
    <>
      <div className="bg-white dark:bg-black rounded-lg md:rounded-xl border border-gray-200 dark:border-gray-800 p-3 md:p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-2 md:mb-3">
          <div className="flex items-center gap-3">
            {profile?.picture ? (
              <img
                src={profile.picture}
                alt={profile.name || 'User'}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">
                  {profile?.name || `@${order.pubkey.slice(0, 6)}...`}
                </h3>
                {order.rating && order.rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{order.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(order.createdAt * 1000, { addSuffix: true })}
                {order.platform && ` • ${order.platform}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <span className="text-lg md:text-2xl">{currencyInfo.flag}</span>
            <div className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-medium ${
              order.type === 'buy'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}>
              {order.type === 'buy' ? 'Buying' : 'Selling'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-3 md:mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">Amount</p>
            <div className="flex items-center gap-1 md:gap-2">
              <Bitcoin className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
              <span className="font-mono font-semibold text-xs md:text-base text-gray-900 dark:text-white">
                {(order.satsAmount / 100000000).toFixed(4)}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 hidden md:block">
              {order.satsAmount.toLocaleString()} sats
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">Price</p>
            <div className="flex items-center gap-1">
              <span className="text-sm md:text-base hidden md:inline">{currencyInfo.flag}</span>
              <p className="text-sm md:text-lg font-semibold text-gray-900 dark:text-white">
                {currencyInfo.symbol}{order.fiatAmount.toFixed(0)}
              </p>
            </div>
            {pricePerBtc > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currencyInfo.symbol}{pricePerBtc.toFixed(2)}/BTC
                {order.premium && order.premium !== 0 && (
                  <span className={order.premium > 0 ? 'text-red-500' : 'text-green-500'}>
                    {' '}({order.premium > 0 ? '+' : ''}{order.premium}%)
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="min-w-0">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">Payment</p>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-sm md:text-lg flex-shrink-0">{paymentInfo.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="font-medium text-xs md:text-base text-gray-900 dark:text-white truncate max-w-[80px] md:max-w-none">
                  {order.paymentMethod}
                </span>
                {paymentInfo.region && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 hidden md:inline">
                    {paymentInfo.region}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTakeModal(true)}
            className="flex-1 flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm md:text-base"
          >
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">{order.type === 'buy' ? 'Sell to User' : 'Buy from User'}</span>
            <span className="md:hidden">{order.type === 'buy' ? 'Sell' : 'Buy'}</span>
          </button>
          <button className="p-1.5 md:p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors">
            <MessageSquare className="w-3 h-3 md:w-4 md:h-4" />
          </button>
          <button className="p-1.5 md:p-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-900 transition-colors hidden md:block">
            <Shield className="w-3 h-3 md:w-4 md:h-4" />
          </button>
        </div>
      </div>

      {showTakeModal && (
        <TakeOrderModal order={order} onClose={() => setShowTakeModal(false)} />
      )}
    </>
  );
}