import { FC } from 'react';

export type ProviderType = {
  title: string;
  loader: () => Promise<FC>;
};

export const PROVIDERS: Record<string, Readonly<ProviderType>> = {
  binance: {
    title: 'Binance Connect',
    loader: async () => (await import('./components/InjectProviderStep/Binance')).default,
  },
  transak: {
    title: 'Transak',
    loader: async () => (await import('./components/InjectProviderStep/Transak')).default,
  },
};
