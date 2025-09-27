import { useEffect, useState } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent } from '@nostr-dev-kit/ndk';

interface PaymentMethodInfo {
  id: string;
  name: string;
  icon: string;
}

const paymentMethodMetadata: Record<string, { icon: string }> = {
  'Cash': { icon: '💵' },
  'PIX': { icon: '🔄' },
  'BLIK': { icon: '📱' },
  'Revolut': { icon: '💳' },
  'Zelle': { icon: '🏦' },
  'CashApp': { icon: '📲' },
  'CVU': { icon: '🏧' },
  'MercadoPago': { icon: '🏧' },
  'f2f': { icon: '🤝' },
  'Bank Transfer': { icon: '🏦' },
  'Wire': { icon: '🏦' },
  'SEPA': { icon: '🇪🇺' },
  'PayPal': { icon: '💰' },
  'Venmo': { icon: '💸' },
  'Strike': { icon: '⚡' },
  'Wise': { icon: '🌐' },
  'N26': { icon: '💳' },
  'Monzo': { icon: '💳' },
  'Starling': { icon: '💳' },
  'TransferWise': { icon: '🌐' },
};

export function useAvailablePaymentMethods() {
  const { ndk } = useNDK();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([
    { id: 'all', name: 'All Methods', icon: '💰' }
  ]);

  useEffect(() => {
    if (!ndk) return;

    const sub = ndk.subscribe(
      { kinds: [38383 as any] },
      { closeOnEose: false }
    );

    sub.on('event', (event: NDKEvent) => {
      const tags = event.tags;
      const zTag = tags.find((t: string[]) => t[0] === 'z');
      if (zTag && zTag[1] === 'info') return;

      const paymentMethod = tags.find((t: string[]) => t[0] === 'pm')?.[1];
      const status = tags.find((t: string[]) => t[0] === 's')?.[1];

      if (paymentMethod && status === 'pending') {
        setPaymentMethods(prev => {
          if (prev.some(pm => pm.id === paymentMethod)) return prev;

          const metadata = paymentMethodMetadata[paymentMethod];
          const newPaymentMethod: PaymentMethodInfo = {
            id: paymentMethod,
            name: paymentMethod,
            icon: metadata?.icon || '💳'
          };

          const updated = [...prev.filter(pm => pm.id !== 'all'), newPaymentMethod].sort((a, b) =>
            a.name.localeCompare(b.name)
          );

          return [{ id: 'all', name: 'All Methods', icon: '💰' }, ...updated];
        });
      }
    });

    return () => {
      sub.stop();
    };
  }, [ndk]);

  return { paymentMethods };
}