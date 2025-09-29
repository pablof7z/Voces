import { useMemo } from 'react';
import { useSubscribe } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';
import { OrderCard } from './OrderCard';

interface Order {
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
  geohash?: string;
  createdAt: number;
  event: NDKEvent;
}

interface OrderBookProps {
  pair: string;
  filters: {
    currency: string;
    paymentMethod: string;
    orderType: 'all' | 'buy' | 'sell';
    minAmount: number;
    maxAmount: number;
  };
}

export function OrderBook({ pair, filters }: OrderBookProps) {
  const filter: NDKFilter = {
    kinds: [38383],
    "#t": [pair],
    limit: 100,
  };

  const { events } = useSubscribe([filter], { closeOnEose: false });

  const orders = useMemo(() => {
    const parsedOrders: Order[] = [];

    events.forEach((event: NDKEvent) => {
      const tags = event.tags;

      // Skip info events
      const zTag = tags.find((t: string[]) => t[0] === 'z');
      if (zTag && zTag[1] === 'info') return;

      // Extract order data from tags
      const orderType = tags.find((t: string[]) => t[0] === 'k')?.[1] as 'buy' | 'sell';
      const currency = tags.find((t: string[]) => t[0] === 'f')?.[1];
      const status = tags.find((t: string[]) => t[0] === 's')?.[1];
      const paymentMethod = tags.find((t: string[]) => t[0] === 'pm')?.[1];
      const satsAmount = parseInt(tags.find((t: string[]) => t[0] === 'amt')?.[1] || '0');
      const fiatAmount = parseFloat(tags.find((t: string[]) => t[0] === 'fa')?.[1] || '0');
      const premium = parseFloat(tags.find((t: string[]) => t[0] === 'premium')?.[1] || '0');
      const rating = parseFloat(tags.find((t: string[]) => t[0] === 'rating')?.[1] || '0');
      const platform = tags.find((t: string[]) => t[0] === 'y')?.[1];
      const geohash = tags.find((t: string[]) => t[0] === 'g')?.[1];
      const dTag = tags.find((t: string[]) => t[0] === 'd')?.[1];

      // Only include active orders
      if (status === 'pending' && orderType && currency && dTag) {
        parsedOrders.push({
          id: dTag,
          pubkey: event.pubkey,
          type: orderType,
          currency,
          status,
          paymentMethod: paymentMethod || 'Unknown',
          satsAmount,
          fiatAmount,
          premium,
          rating,
          platform,
          geohash,
          createdAt: event.created_at || Date.now() / 1000,
          event
        });
      }
    });

    // Sort by created date, newest first
    parsedOrders.sort((a, b) => b.createdAt - a.createdAt);

    return parsedOrders;
  }, [events]);

  // Filter orders based on user preferences
  const filteredOrders = orders.filter(order => {
    if (filters.currency !== 'all' && order.currency !== filters.currency) return false;
    if (filters.paymentMethod !== 'all' && order.paymentMethod !== filters.paymentMethod) return false;
    if (filters.orderType !== 'all' && order.type !== filters.orderType) return false;
    if (order.satsAmount < filters.minAmount || order.satsAmount > filters.maxAmount) return false;
    return true;
  });

  return (
    <div className="w-full">
      <div className="grid gap-3 md:gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            No orders available matching your filters
          </div>
        ) : (
          filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
}