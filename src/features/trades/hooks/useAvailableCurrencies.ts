import { useEffect, useState } from 'react';
import { useNDK } from '@nostr-dev-kit/ndk-hooks';
import { NDKEvent, type NDKFilter } from '@nostr-dev-kit/ndk';

interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
}

const currencyMetadata: Record<string, { name: string; flag: string }> = {
  USD: { name: 'US Dollar', flag: '🇺🇸' },
  EUR: { name: 'Euro', flag: '🇪🇺' },
  BRL: { name: 'Brazilian Real', flag: '🇧🇷' },
  ARS: { name: 'Argentine Peso', flag: '🇦🇷' },
  GBP: { name: 'British Pound', flag: '🇬🇧' },
  PLN: { name: 'Polish Złoty', flag: '🇵🇱' },
  JPY: { name: 'Japanese Yen', flag: '🇯🇵' },
  CAD: { name: 'Canadian Dollar', flag: '🇨🇦' },
  AUD: { name: 'Australian Dollar', flag: '🇦🇺' },
  CHF: { name: 'Swiss Franc', flag: '🇨🇭' },
  CNY: { name: 'Chinese Yuan', flag: '🇨🇳' },
  INR: { name: 'Indian Rupee', flag: '🇮🇳' },
  MXN: { name: 'Mexican Peso', flag: '🇲🇽' },
  ZAR: { name: 'South African Rand', flag: '🇿🇦' },
  SEK: { name: 'Swedish Krona', flag: '🇸🇪' },
  NOK: { name: 'Norwegian Krone', flag: '🇳🇴' },
  DKK: { name: 'Danish Krone', flag: '🇩🇰' },
  NZD: { name: 'New Zealand Dollar', flag: '🇳🇿' },
  SGD: { name: 'Singapore Dollar', flag: '🇸🇬' },
  HKD: { name: 'Hong Kong Dollar', flag: '🇭🇰' },
  KRW: { name: 'South Korean Won', flag: '🇰🇷' },
  TRY: { name: 'Turkish Lira', flag: '🇹🇷' },
  RUB: { name: 'Russian Ruble', flag: '🇷🇺' },
  THB: { name: 'Thai Baht', flag: '🇹🇭' },
  MYR: { name: 'Malaysian Ringgit', flag: '🇲🇾' },
  PHP: { name: 'Philippine Peso', flag: '🇵🇭' },
  IDR: { name: 'Indonesian Rupiah', flag: '🇮🇩' },
  VND: { name: 'Vietnamese Dong', flag: '🇻🇳' },
  COP: { name: 'Colombian Peso', flag: '🇨🇴' },
  CLP: { name: 'Chilean Peso', flag: '🇨🇱' },
  PEN: { name: 'Peruvian Sol', flag: '🇵🇪' },
  UAH: { name: 'Ukrainian Hryvnia', flag: '🇺🇦' },
  AED: { name: 'UAE Dirham', flag: '🇦🇪' },
  SAR: { name: 'Saudi Riyal', flag: '🇸🇦' },
  QAR: { name: 'Qatari Riyal', flag: '🇶🇦' },
  KWD: { name: 'Kuwaiti Dinar', flag: '🇰🇼' },
  NGN: { name: 'Nigerian Naira', flag: '🇳🇬' },
  KES: { name: 'Kenyan Shilling', flag: '🇰🇪' },
  GHS: { name: 'Ghanaian Cedi', flag: '🇬🇭' },
  UGX: { name: 'Ugandan Shilling', flag: '🇺🇬' },
  VES: { name: 'Venezuelan Bolívar', flag: '🇻🇪' },
  UYU: { name: 'Uruguayan Peso', flag: '🇺🇾' },
  BOB: { name: 'Bolivian Boliviano', flag: '🇧🇴' },
  CRC: { name: 'Costa Rican Colón', flag: '🇨🇷' },
  GTQ: { name: 'Guatemalan Quetzal', flag: '🇬🇹' },
  HNL: { name: 'Honduran Lempira', flag: '🇭🇳' },
  NIO: { name: 'Nicaraguan Córdoba', flag: '🇳🇮' },
  PAB: { name: 'Panamanian Balboa', flag: '🇵🇦' },
  PYG: { name: 'Paraguayan Guarani', flag: '🇵🇾' },
  DOP: { name: 'Dominican Peso', flag: '🇩🇴' },
  JMD: { name: 'Jamaican Dollar', flag: '🇯🇲' },
  TTD: { name: 'Trinidad Dollar', flag: '🇹🇹' },
  BSD: { name: 'Bahamian Dollar', flag: '🇧🇸' },
  BBD: { name: 'Barbadian Dollar', flag: '🇧🇧' },
  BZD: { name: 'Belize Dollar', flag: '🇧🇿' },
  XOF: { name: 'West African CFA', flag: '🌍' },
  XAF: { name: 'Central African CFA', flag: '🌍' },
  MAD: { name: 'Moroccan Dirham', flag: '🇲🇦' },
  TND: { name: 'Tunisian Dinar', flag: '🇹🇳' },
  EGP: { name: 'Egyptian Pound', flag: '🇪🇬' },
  ILS: { name: 'Israeli Shekel', flag: '🇮🇱' },
  JOD: { name: 'Jordanian Dinar', flag: '🇯🇴' },
  LBP: { name: 'Lebanese Pound', flag: '🇱🇧' },
  PKR: { name: 'Pakistani Rupee', flag: '🇵🇰' },
  BDT: { name: 'Bangladeshi Taka', flag: '🇧🇩' },
  LKR: { name: 'Sri Lankan Rupee', flag: '🇱🇰' },
  NPR: { name: 'Nepalese Rupee', flag: '🇳🇵' },
  MMK: { name: 'Myanmar Kyat', flag: '🇲🇲' },
  KHR: { name: 'Cambodian Riel', flag: '🇰🇭' },
  LAK: { name: 'Lao Kip', flag: '🇱🇦' },
  BND: { name: 'Brunei Dollar', flag: '🇧🇳' },
  TWD: { name: 'Taiwan Dollar', flag: '🇹🇼' },
  HRK: { name: 'Croatian Kuna', flag: '🇭🇷' },
  BGN: { name: 'Bulgarian Lev', flag: '🇧🇬' },
  RON: { name: 'Romanian Leu', flag: '🇷🇴' },
  CZK: { name: 'Czech Koruna', flag: '🇨🇿' },
  HUF: { name: 'Hungarian Forint', flag: '🇭🇺' },
  ISK: { name: 'Icelandic Króna', flag: '🇮🇸' },
  BAM: { name: 'Bosnian Mark', flag: '🇧🇦' },
  MKD: { name: 'Macedonian Denar', flag: '🇲🇰' },
  ALL: { name: 'Albanian Lek', flag: '🇦🇱' },
  RSD: { name: 'Serbian Dinar', flag: '🇷🇸' },
  GEL: { name: 'Georgian Lari', flag: '🇬🇪' },
  AZN: { name: 'Azerbaijani Manat', flag: '🇦🇿' },
  AMD: { name: 'Armenian Dram', flag: '🇦🇲' },
  BYN: { name: 'Belarusian Ruble', flag: '🇧🇾' },
  MDL: { name: 'Moldovan Leu', flag: '🇲🇩' },
  KZT: { name: 'Kazakhstani Tenge', flag: '🇰🇿' },
  UZS: { name: 'Uzbekistani Som', flag: '🇺🇿' },
  TJS: { name: 'Tajikistani Somoni', flag: '🇹🇯' },
  KGS: { name: 'Kyrgyzstani Som', flag: '🇰🇬' },
  TMT: { name: 'Turkmenistani Manat', flag: '🇹🇲' }
};

export function useAvailableCurrencies() {
  const { ndk } = useNDK();
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>([
    { code: 'all', name: 'All', flag: '🌍' }
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

      const currency = tags.find((t: string[]) => t[0] === 'f')?.[1];
      const status = tags.find((t: string[]) => t[0] === 's')?.[1];

      if (currency && status === 'pending') {
        const upperCurrency = currency.toUpperCase();
        setCurrencies(prev => {
          if (prev.some(c => c.code === upperCurrency)) return prev;

          const metadata = currencyMetadata[upperCurrency];
          const newCurrency: CurrencyInfo = {
            code: upperCurrency,
            name: metadata?.name || upperCurrency,
            flag: metadata?.flag || '💱'
          };

          const updated = [...prev.filter(c => c.code !== 'all'), newCurrency].sort((a, b) =>
            a.code.localeCompare(b.code)
          );

          return [{ code: 'all', name: 'All', flag: '🌍' }, ...updated];
        });
      }
    });

    return () => {
      sub.stop();
    };
  }, [ndk]);

  return { currencies };
}